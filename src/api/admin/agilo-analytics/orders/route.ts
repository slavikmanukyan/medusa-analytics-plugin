import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { reportContext } from '../../../../utils/reporting-query';
import { bucketKeys, isSale, netSales } from '../../../../utils/reporting';

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { range, currency, fetchOrders } = await reportContext(req);
  const raw = await fetchOrders();
  const orders = raw.filter(isSale);
  const previous = (
    await fetchOrders(range.previousFrom, range.previousTo)
  ).filter(isSale);
  const buckets = bucketKeys(range.from, range.to, range.days);
  const sales = new Map<string, number>();
  const counts = new Map<string, number>();
  const regions = new Map<string, number>();
  const statuses = new Map<string, number>();
  for (const order of raw) {
    const status = order.metadata?.lifecycle ?? order.status ?? 'unknown';
    statuses.set(status, (statuses.get(status) ?? 0) + 1);
  }
  for (const order of orders) {
    const key = buckets.key(order.created_at);
    const total = netSales(order);
    sales.set(key, (sales.get(key) ?? 0) + total);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (order.region?.name)
      regions.set(
        order.region.name,
        (regions.get(order.region.name) ?? 0) + total,
      );
  }
  const totalSales = orders.reduce((n, o) => n + netSales(o), 0);
  const previousSales = previous.reduce((n, o) => n + netSales(o), 0);
  const change = (n: number, p: number) =>
    p === 0 ? (n === 0 ? 0 : 100) : Math.round(((n - p) / p) * 10000) / 100;
  res.json({
    total_orders: orders.length,
    total_sales: totalSales,
    currency_code: currency,
    prev_orders_percent: change(orders.length, previous.length),
    prev_sales_percent: change(totalSales, previousSales),
    order_sales: buckets.keys.map((name) => ({
      name,
      sales: sales.get(name) ?? 0,
    })),
    order_count: buckets.keys.map((name) => ({
      name,
      count: counts.get(name) ?? 0,
    })),
    regions: [...regions]
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5),
    statuses: [...statuses].map(([status, count]) => ({
      status,
      name: statusLabels[status] ?? status,
      count,
    })),
  } satisfies OrderAnalyticsResponse);
}
const statusLabels: Record<string, string> = {
  paid: 'Оплачен',
  packed: 'Собран',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
  canceled: 'Отменён',
  refunded: 'Возвращён',
  awaiting_payment: 'Ожидает оплаты',
  pending: 'В обработке',
  completed: 'Завершён',
  archived: 'Архив',
};
export type OrderAnalyticsResponse = {
  total_orders: number;
  total_sales: number;
  prev_orders_percent: number;
  prev_sales_percent: number;
  currency_code: string;
  regions: { name: string; sales: number }[];
  statuses: { name: string; count: number; status?: string }[];
  order_sales: { name: string; sales: number }[];
  order_count: { name: string; count: number }[];
};
