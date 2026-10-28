import { DateTime } from 'luxon';

export type ReportOrder = {
  id: string;
  created_at: string | Date;
  currency_code: string;
  status?: string;
  total?: unknown;
  credit_line_total?: unknown;
  shipping_total?: unknown;
  metadata?: Record<string, any> | null;
  items?: any[];
  region?: { name?: string };
  customer?: any;
  customer_id?: string;
};

export function amount(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function isGiftCard(line: any): boolean {
  return (
    line.is_giftcard === true ||
    !!line.metadata?.gift_card_kind ||
    /^gift-card-(digital|physical)$/.test(line.product_handle ?? '')
  );
}

export function isSale(order: ReportOrder): boolean {
  return (
    order.status !== 'draft' &&
    order.status !== 'canceled' &&
    order.metadata?.lifecycle !== 'cancelled' &&
    order.metadata?.payment?.status === 'success' &&
    !!order.metadata?.payment?.paid_at
  );
}

/** Goods + shipping at face value; issuing Gift Cards is prepayment.
 * Returns restate the original Order cohort, not the date of the Return.
 * Redeemed Gift Cards remain payment, never a sales discount.
 */
export function netSales(order: ReportOrder): number {
  if (!isSale(order)) return 0;
  const gross =
    order.metadata?.gift_goods_total != null
      ? amount(order.metadata.gift_goods_total)
      : Math.max(
          0,
          amount(order.total) +
            amount(order.credit_line_total) -
            (order.items ?? [])
              .filter(isGiftCard)
              .reduce(
                (s, i) => s + amount(i.unit_price) * amount(i.quantity),
                0,
              ),
        );
  const refunded = (order.metadata?.returns ?? []).reduce(
    (sum: number, record: any) => {
      if (record.goods_amount != null) return sum + amount(record.goods_amount);
      if (record.items?.length)
        return (
          sum +
          record.items.reduce((s: number, line: any) => {
            const original = order.items?.find((i) => i.id === line.item_id);
            return (
              s + (original && isGiftCard(original) ? 0 : amount(line.amount))
            );
          }, 0)
        );
      return sum + amount(record.amount);
    },
    0,
  );
  return Math.max(0, gross - refunded);
}

export function netLineQuantity(order: ReportOrder, line: any): number {
  if (!isSale(order) || isGiftCard(line)) return 0;
  const returned = (order.metadata?.returns ?? [])
    .flatMap((r: any) => r.items ?? [])
    .filter((r: any) =>
      r.item_id ? r.item_id === line.id : r.variant_id === line.variant_id,
    )
    .reduce((n: number, r: any) => n + amount(r.quantity), 0);
  return Math.max(0, amount(line.quantity) - returned);
}

/** Component inventory may require multiple units per sellable Variant. */
export function availableStock(variant: any): number | null {
  if (variant.manage_inventory === false) return null;
  const items = variant.inventory_items ?? [];
  if (!items.length) return 0;
  return Math.min(
    ...items.map((item: any) => {
      const available = (item.inventory?.location_levels ?? []).reduce(
        (n: number, l: any) =>
          n + amount(l.stocked_quantity) - amount(l.reserved_quantity),
        0,
      );
      return Math.max(
        0,
        Math.floor(available / Math.max(1, amount(item.required_quantity))),
      );
    }),
  );
}

export function dateRange(query: Record<string, any>, zone = 'Asia/Yerevan') {
  if (
    query.preset &&
    !['custom', 'this-month', 'last-month', 'last-3-months'].includes(
      query.preset,
    )
  )
    throw new Error('Неизвестный период');
  if (
    (!query.preset || query.preset === 'custom') &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(query.date_from ?? '') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(query.date_to ?? ''))
  )
    throw new Error('Некорректные даты');
  const now = DateTime.now().setZone(zone);
  let from: DateTime;
  let to: DateTime;
  if (query.preset === 'this-month') {
    from = now.startOf('month');
    to = now.startOf('day');
  } else if (query.preset === 'last-month') {
    from = now.minus({ months: 1 }).startOf('month');
    to = from.endOf('month').startOf('day');
  } else if (query.preset === 'last-3-months') {
    from = now.minus({ months: 3 }).startOf('month');
    to = now.startOf('month').minus({ days: 1 });
  } else {
    from = DateTime.fromISO(query.date_from ?? '', { zone }).startOf('day');
    to = DateTime.fromISO(query.date_to ?? '', { zone }).startOf('day');
  }
  const days = Math.round(to.diff(from, 'days').days) + 1;
  if (
    !from.isValid ||
    !to.isValid ||
    !Number.isFinite(days) ||
    days < 1 ||
    days > 1096
  )
    throw new Error('Выберите корректный период не длиннее трёх лет');
  return {
    from,
    to,
    days,
    previousFrom: from.minus({ days }),
    previousTo: from.minus({ days: 1 }),
  };
}

export function bucketKeys(from: DateTime, to: DateTime, days: number) {
  const key = (date: DateTime) =>
    days > 120
      ? date.toFormat('yyyy-MM')
      : days > 30
        ? from
            .plus({ days: Math.floor(date.diff(from, 'days').days / 7) * 7 })
            .toISODate()!
        : date.toISODate()!;
  const keys = new Set<string>();
  for (let day = from; day <= to; day = day.plus({ days: 1 }))
    keys.add(key(day));
  return {
    keys: [...keys],
    key: (created: string | Date) =>
      key(
        (created instanceof Date
          ? DateTime.fromJSDate(created, { zone: from.zoneName! })
          : DateTime.fromISO(created, { zone: from.zoneName! })
        ).startOf('day'),
      ),
  };
}

export async function allGraph(
  query: any,
  input: any,
): Promise<{ data: any[] }> {
  const data: any[] = [];
  for (let skip = 0; ; skip += 200) {
    const page = await query.graph({
      ...input,
      pagination: { ...input.pagination, skip, take: 200 },
    });
    data.push(...page.data);
    if (page.data.length < 200) return { data };
  }
}
