import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  netSales,
  netLineQuantity,
  availableStock,
  dateRange,
  bucketKeys,
  allGraph,
} from '../src/utils/reporting.ts';

const paid = {
  id: 'o1',
  created_at: '2026-10-27T21:00:00Z',
  currency_code: 'amd',
  total: 12000,
  metadata: {
    payment: { status: 'success', paid_at: '2026-10-27T21:00:00Z' },
    lifecycle: 'paid',
  },
};
test('only Paid, noncancelled Orders count as sales', () => {
  assert.equal(netSales(paid), 12000);
  assert.equal(netSales({ ...paid, status: 'canceled' }), 0);
  assert.equal(
    netSales({
      ...paid,
      metadata: { ...paid.metadata, lifecycle: 'cancelled' },
    }),
    0,
  );
  assert.equal(netSales({ ...paid, metadata: {} }), 0);
});
test('refunds reduce sales once and returned quantities reduce ranking', () => {
  const line = { id: 'li1', variant_id: 'v1', quantity: 3 };
  const order = {
    ...paid,
    items: [line],
    metadata: {
      ...paid.metadata,
      returns: [
        {
          amount: 4000,
          goods_amount: 4000,
          gift_restored: 2000,
          acquirer_amount: 2000,
          items: [{ item_id: 'li1', quantity: 1 }],
        },
      ],
    },
  };
  assert.equal(netSales(order), 8000);
  assert.equal(netLineQuantity(order, line), 2);
});
test('Gift Card prepayment is excluded and redemption is not a discount', () => {
  assert.equal(
    netSales({
      ...paid,
      total: 20000,
      items: [{ is_giftcard: true, unit_price: 20000, quantity: 1 }],
    }),
    0,
  );
  assert.equal(
    netSales({
      ...paid,
      total: 0,
      credit_line_total: 12000,
      metadata: { ...paid.metadata, gift_goods_total: 12000 },
    }),
    12000,
  );
  const card = {
    id: 'card',
    is_giftcard: true,
    quantity: 1,
    unit_price: 20000,
  };
  assert.equal(netLineQuantity({ ...paid, items: [card] }, card), 0);
  assert.equal(
    netSales({
      ...paid,
      total: 25000,
      metadata: {
        ...paid.metadata,
        gift_goods_total: 5000,
        returns: [{ goods_amount: 0, amount: 20000 }],
      },
    }),
    5000,
  );
});
test('low stock subtracts reservations and respects component ratios', () => {
  assert.equal(
    availableStock({
      inventory_items: [
        {
          required_quantity: 2,
          inventory: {
            location_levels: [{ stocked_quantity: 12, reserved_quantity: 8 }],
          },
        },
      ],
    }),
    2,
  );
  assert.equal(
    availableStock({
      inventory_items: [
        {
          inventory: {
            location_levels: [{ stocked_quantity: 2, reserved_quantity: 5 }],
          },
        },
      ],
    }),
    0,
  );
  assert.equal(availableStock({ manage_inventory: false }), null);
});
test('report boundaries and daily buckets use Yerevan time', () => {
  const range = dateRange({ date_from: '2026-10-28', date_to: '2026-10-28' });
  assert.equal(range.from.toUTC().toISO(), '2026-10-27T20:00:00.000Z');
  assert.equal(
    bucketKeys(range.from, range.to, range.days).key(paid.created_at),
    '2026-10-28',
  );
  assert.equal(
    bucketKeys(range.from, range.to, range.days).key(new Date(paid.created_at)),
    '2026-10-28',
  );
  assert.throws(() =>
    dateRange({ date_from: '2026-10-29', date_to: '2026-10-28' }),
  );
  assert.throws(() =>
    dateRange({ date_from: '2026-02-30', date_to: '2026-03-01' }),
  );
});
test('reports read beyond the first page', async () => {
  const calls: number[] = [];
  const result = await allGraph(
    {
      graph: async ({ pagination }: any) => {
        calls.push(pagination.skip);
        return {
          data: Array.from(
            { length: pagination.skip === 0 ? 200 : 1 },
            (_, i) => pagination.skip + i,
          ),
        };
      },
    },
    { entity: 'order' },
  );
  assert.equal(result.data.length, 201);
  assert.deepEqual(calls, [0, 200]);
});
