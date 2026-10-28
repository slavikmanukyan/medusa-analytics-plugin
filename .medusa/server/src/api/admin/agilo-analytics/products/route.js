"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
const reporting_query_1 = require("../../../../utils/reporting-query");
const reporting_1 = require("../../../../utils/reporting");
async function GET(req, res) {
    const { query, fetchOrders } = await (0, reporting_query_1.reportContext)(req);
    const config = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
    const plugin = config.plugins.find((p) => typeof p === 'object' && p.resolve === '@agilo/medusa-analytics-plugin');
    const threshold = Number(plugin?.options?.stock_threshold ?? 5);
    const stockThreshold = Number.isFinite(threshold) && threshold >= 0 ? threshold : 5;
    const sales = new Map();
    for (const order of await fetchOrders())
        for (const line of order.items ?? []) {
            if (!line.variant_id)
                continue;
            const quantity = (0, reporting_1.netLineQuantity)(order, line);
            if (!quantity)
                continue;
            const row = sales.get(line.variant_id) ?? {
                title: [line.product_title, line.variant_title]
                    .filter(Boolean)
                    .join(' '),
                quantity: 0,
            };
            row.quantity += quantity;
            sales.set(line.variant_id, row);
        }
    const { data: variants } = await (0, reporting_1.allGraph)(query, {
        entity: 'variant',
        fields: [
            'id',
            'sku',
            'title',
            'product_id',
            'manage_inventory',
            'product.title',
            'product.is_giftcard',
            'inventory_items.required_quantity',
            'inventory_items.inventory.location_levels.stocked_quantity',
            'inventory_items.inventory.location_levels.reserved_quantity',
        ],
        pagination: { order: { id: 'asc' } },
    });
    const lowStockVariants = variants
        .filter((v) => !v.product?.is_giftcard)
        .flatMap((variant) => {
        const available = (0, reporting_1.availableStock)(variant);
        return available === null || available > stockThreshold
            ? []
            : [
                {
                    sku: variant.sku ?? '—',
                    variantId: variant.id,
                    productId: variant.product_id ?? '',
                    variantName: [variant.product?.title, variant.title]
                        .filter(Boolean)
                        .join(' '),
                    inventoryQuantity: available,
                },
            ];
    })
        .sort((a, b) => a.inventoryQuantity - b.inventoryQuantity ||
        a.variantName.localeCompare(b.variantName, 'ru'));
    res.json({
        lowStockVariants,
        variantQuantitySold: [...sales.values()].sort((a, b) => b.quantity - a.quantity),
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL2FnaWxvLWFuYWx5dGljcy9wcm9kdWN0cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVNBLGtCQXNFQztBQTlFRCxxREFBc0U7QUFDdEUsdUVBQWtFO0FBQ2xFLDJEQUlxQztBQUU5QixLQUFLLFVBQVUsR0FBRyxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDL0QsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLElBQUEsK0JBQWEsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUN4RCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMxRSxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDaEMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUNULE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLGdDQUFnQyxDQUNuRSxDQUFDO0lBQ1QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsZUFBZSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sY0FBYyxHQUNsQixNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUErQyxDQUFDO0lBQ3JFLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxXQUFXLEVBQUU7UUFDckMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxJQUFJ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