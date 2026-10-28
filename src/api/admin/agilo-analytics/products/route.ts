import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { reportContext } from '../../../../utils/reporting-query';
import {
  allGraph,
  availableStock,
  netLineQuantity,
} from '../../../../utils/reporting';

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { query, fetchOrders } = await reportContext(req);
  const config = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE);
  const plugin = config.plugins.find(
    (p: any) =>
      typeof p === 'object' && p.resolve === '@agilo/medusa-analytics-plugin',
  ) as any;
  const threshold = Number(plugin?.options?.stock_threshold ?? 5);
  const stockThreshold =
    Number.isFinite(threshold) && threshold >= 0 ? threshold : 5;
  const sales = new Map<string, { title: string; quantity: number }>();
  for (const order of await fetchOrders())
    for (const line of order.items ?? []) {
      if (!line.variant_id) continue;
      const quantity = netLineQuantity(order, line);
      if (!quantity) continue;
      const row = sales.get(line.variant_id) ?? {
        title: [line.product_title, line.variant_title]
          .filter(Boolean)
          .join(' '),
        quantity: 0,
      };
      row.quantity += quantity;
      sales.set(line.variant_id, row);
    }
  const { data: variants } = await allGraph(query, {
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
      const available = availableStock(variant);
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
    .sort(
      (a, b) =>
        a.inventoryQuantity - b.inventoryQuantity ||
        a.variantName.localeCompare(b.variantName, 'ru'),
    );
  res.json({
    lowStockVariants,
    variantQuantitySold: [...sales.values()].sort(
      (a, b) => b.quantity - a.quantity,
    ),
  } satisfies ProductAnalyticsResponse);
}
export type ProductAnalyticsResponse = {
  lowStockVariants: {
    sku: string;
    variantName: string;
    inventoryQuantity: number;
    variantId: string;
    productId: string;
  }[];
  variantQuantitySold: { title: string; quantity: number }[];
};
