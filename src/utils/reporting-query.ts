import {
  ContainerRegistrationKeys,
  Modules,
  MedusaError,
} from '@medusajs/framework/utils';
import { allGraph, dateRange } from './reporting';

export async function reportContext(req: any, input = req.query) {
  let range: ReturnType<typeof dateRange>;
  try {
    range = dateRange(input);
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      (error as Error).message,
    );
  }
  const stores = await req.scope
    .resolve(Modules.STORE)
    .listStores({}, { relations: ['supported_currencies'] });
  const currency =
    stores[0]?.supported_currencies?.find((c: any) => c.is_default)
      ?.currency_code ?? 'amd';
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const fetchOrders = async (from = range.from, to = range.to) =>
    (
      await allGraph(query, {
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
      })
    ).data;
  return { range, currency: currency.toUpperCase(), query, fetchOrders };
}
