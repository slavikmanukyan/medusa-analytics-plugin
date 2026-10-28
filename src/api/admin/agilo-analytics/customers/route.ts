import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { reportContext } from '../../../../utils/reporting-query';
import {
  allGraph,
  bucketKeys,
  isSale,
  netSales,
} from '../../../../utils/reporting';

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { query, range, currency, fetchOrders } = await reportContext(req);
  const orders = (await fetchOrders()).filter(isSale);
  const ids = [...new Set(orders.map((o) => o.customer_id).filter(Boolean))];
  const previous = ids.length
    ? (
        await allGraph(query, {
          entity: 'order',
          fields: ['id', 'created_at', 'customer_id', 'status', 'metadata'],
          filters: {
            customer_id: ids,
            status: { $nin: ['draft', 'canceled'] },
            created_at: { $lt: range.from.toUTC().toISO() },
          },
          pagination: { order: { created_at: 'asc', id: 'asc' } },
        })
      ).data.filter(isSale)
    : [];
  const returningIds = new Set(previous.map((o) => o.customer_id));
  const buckets = bucketKeys(range.from, range.to, range.days);
  const grouped = new Map<
    string,
    { new: Set<string>; returning: Set<string> }
  >();
  const customers = new Map<
    string,
    CustomerAnalyticsResponse['customer_sales'][number]
  >();
  const groups = new Map<string, number>();
  for (const order of orders) {
    const id = order.customer_id;
    if (!id) continue;
    const key = buckets.key(order.created_at);
    const total = netSales(order);
    const bucket = grouped.get(key) ?? {
      new: new Set<string>(),
      returning: new Set<string>(),
    };
    bucket[returningIds.has(id) ? 'returning' : 'new'].add(id);
    grouped.set(key, bucket);
    const customer = order.customer;
    const row = customers.get(id) ?? {
      customer_id: id,
      sales: 0,
      name: [customer?.first_name, customer?.last_name]
        .filter(Boolean)
        .join(' '),
      groups: (customer?.groups ?? []).map((g: any) => g.name),
      order_count: 0,
      last_order: order.created_at,
      email: customer?.email ?? '',
    };
    row.sales += total;
    row.order_count++;
    row.last_order = order.created_at;
    customers.set(id, row);
    for (const group of row.groups.length ? row.groups : ['Без группы'])
      groups.set(group, (groups.get(group) ?? 0) + total);
  }
  const returning = [...customers.keys()].filter((id) =>
    returningIds.has(id),
  ).length;
  res.json({
    total_customers: customers.size,
    new_customers: customers.size - returning,
    returning_customers: returning,
    currency_code: currency,
    customer_count: buckets.keys.map((name) => ({
      name,
      new_customers: grouped.get(name)?.new.size ?? 0,
      returning_customers: grouped.get(name)?.returning.size ?? 0,
    })),
    customer_group: [...groups].map(([name, total]) => ({ name, total })),
    customer_sales: [...customers.values()].sort((a, b) => b.sales - a.sales),
  } satisfies CustomerAnalyticsResponse);
}
export type CustomerAnalyticsResponse = {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  currency_code: string;
  customer_count: {
    name: string;
    returning_customers: number;
    new_customers: number;
  }[];
  customer_group: { name: string; total: number }[];
  customer_sales: {
    customer_id: string;
    sales: number;
    name: string;
    groups: string[];
    order_count: number;
    last_order: Date | string;
    email: string;
  }[];
};
