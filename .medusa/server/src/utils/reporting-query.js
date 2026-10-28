"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportContext = reportContext;
const utils_1 = require("@medusajs/framework/utils");
const reporting_1 = require("./reporting");
async function reportContext(req, input = req.query) {
    let range;
    try {
        range = (0, reporting_1.dateRange)(input);
    }
    catch (error) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, error.message);
    }
    const stores = await req.scope
        .resolve(utils_1.Modules.STORE)
        .listStores({}, { relations: ['supported_currencies'] });
    const currency = stores[0]?.supported_currencies?.find((c) => c.is_default)
        ?.currency_code ?? 'amd';
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const fetchOrders = async (from = range.from, to = range.to) => (await (0, reporting_1.allGraph)(query, {
        entity: 'order',
        fields: [
            'id',
            'created_at',
            'status',
            'currency_code',
            'total',
            'credit_line_total',
            'shipping_total',
            'metadata',
            'items.*',
            'region.name',
            'customer_id',
            'customer.id',
            'customer.first_name',
            'customer.last_name',
            'customer.email',
            'customer.groups.*',
        ],
        filters: {
            currency_code: currency.toLowerCase(),
            created_at: {
                $gte: from.toUTC().toISO(),
                $lte: to.endOf('day').toUTC().toISO(),
            },
            status: { $nin: ['draft'] },
        },
        pagination: { order: { created_at: 'asc', id: 'asc' } },
    })).data;
    return { range, currency: currency.toUpperCase(), query, fetchOrders };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0aW5nLXF1ZXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3JlcG9ydGluZy1xdWVyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLHNDQW1EQztBQTFERCxxREFJbUM7QUFDbkMsMkNBQWtEO0FBRTNDLEtBQUssVUFBVSxhQUFhLENBQUMsR0FBUSxFQUFFLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSztJQUM3RCxJQUFJLEtBQW1DLENBQUM7SUFDeEMsSUFBSSxDQUFDO1FBQ0gsS0FBSyxHQUFHLElBQUEscUJBQVMsRUFBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sSUFBSSxtQkFBVyxDQUNuQixtQkFBVyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQzdCLEtBQWUsQ0FBQyxPQUFPLENBQ3pCLENBQUM7SUFDSixDQUFDO0lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsS0FBSztTQUMzQixPQUFPLENBQUMsZUFBTyxDQUFDLEtBQUssQ0FBQztTQUN0QixVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsc0JBQXNCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0QsTUFBTSxRQUFRLEdBQ1osTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztRQUM3RCxFQUFFLGFBQWEsSUFBSSxLQUFLLENBQUM7SUFDN0IsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakUsTUFBTSxXQUFXLEdBQUcsS0FBSyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FDN0QsQ0FDRSxNQUFNLElBQUEsb0JBQVEsRUFBQyxLQUFLLEVBQUU7UUFDcEIsTUFBTSxFQUFFLE9BQU87UUFDZixNQUFNLEVBQUU7WUFDTixJQUFJO1lBQ0osWUFBWTtZQUNaLFFBQVE7WUFDUixlQUFlO1lBQ2YsT0FBTztZQUNQLG1CQUFtQjtZQUNuQixnQkFBZ0I7WUFDaEIsVUFBVTtZQUNWLFNBQVM7WUFDVCxhQUFhO1lBQ2IsYUFBYTtZQUNiLGFBQWE7WUFDYixxQkFBcUI7WUFDckIsb0JBQW9CO1lBQ3BCLGdCQUFnQjtZQUNoQixtQkFBbUI7U0FDcEI7UUFDRCxPQUFPLEVBQUU7WUFDUCxhQUFhLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUNyQyxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUU7Z0JBQzFCLElBQUksRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRTthQUN0QztZQUNELE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1NBQzVCO1FBQ0QsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUU7S0FDeEQsQ0FBQyxDQUNILENBQUMsSUFBSSxDQUFDO0lBQ1QsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQztBQUN6RSxDQUFDIn0=