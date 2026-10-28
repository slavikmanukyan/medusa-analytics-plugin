import { Button, Container, Text } from '@medusajs/ui';
import { BarChart } from '../components/BarChart';
import { LineChart } from './LineChart';
import { useProductAnalytics } from '../hooks/product-analytics';
import { useIntervalRange } from '../hooks/use-interval-range';
import { useCustomerAnalytics } from '../hooks/customer-analytics';
import { ChartStateWrapper } from './StateWrappers';
import { withOptionalAnalyticsRange } from '../lib/analytics-widgets-links';
import { useOrderAnalytics } from '../hooks/order-analytics';

// Товары
export const TopSellingProducts = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useProductAnalytics(range);
  const topThreeSellers = data?.variantQuantitySold
    ?.filter((item) => item.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  return (
    <Container className="flex flex-col">
      <div className="flex justify-between">
        <div>
          <Text size="large" weight="plus">
            Самые продаваемые варианты
          </Text>
          <Text size="xsmall" className="mb-4 text-ui-fg-muted ">
            Варианты по количеству продаж за вычетом возвратов
          </Text>
        </div>

        <a
          href={withOptionalAnalyticsRange(
            '/app/analytics?tab=products',
            range,
          )}
        >
          <Button variant="transparent" className="text-ui-fg-muted text-xs ">
            Подробнее
          </Button>
        </a>
      </div>
      <ChartStateWrapper
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        isEmpty={!topThreeSellers || topThreeSellers.length === 0}
      >
        <div className="max-w-72 flex-1 text-xs aspect-video">
          <BarChart
            isHorizontal
            data={topThreeSellers}
            yAxisDataKey="quantity"
            xAxisDataKey="title"
            lineColor="#a1a1aa"
            colorKeyField="title"
            hideTooltip
          />
        </div>
      </ChartStateWrapper>
    </Container>
  );
};

export const LowStockVariants = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useProductAnalytics(range);

  return (
    <Container className="flex flex-col">
      <div className="flex justify-between">
        <div>
          <Text size="large" weight="plus">
            Мало на складе
          </Text>
          <Text size="xsmall" className="mb-4 text-ui-fg-muted">
            Доступный остаток с учётом резервов{' '}
          </Text>
        </div>

        <a
          href={withOptionalAnalyticsRange(
            '/app/analytics?tab=products#:~:text=Low%20Stock%20Variants',
            range,
          )}
        >
          <Button variant="transparent" className="text-ui-fg-muted text-xs ">
            Подробнее
          </Button>
        </a>
      </div>
      <ChartStateWrapper
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        isEmpty={!data?.lowStockVariants || data.lowStockVariants.length === 0}
      >
        <div className="max-w-72 flex-1 text-xs aspect-video">
          <BarChart
            isHorizontal
            data={data?.lowStockVariants}
            xAxisDataKey="variantName"
            yAxisDataKey="inventoryQuantity"
            lineColor="#a1a1aa"
            colorKeyField="variantName"
            hideTooltip
          />
        </div>
      </ChartStateWrapper>
    </Container>
  );
};

export const BottomSellingProducts = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useProductAnalytics(range);
  const topThreeWorstSellingProducts = data?.variantQuantitySold
    ?.filter((item) => item.quantity > 0)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 3);

  return (
    <Container className="flex flex-col">
      <div className="flex justify-between">
        <div>
          <Text size="large" weight="plus">
            Наименее продаваемые варианты
          </Text>
          <Text size="xsmall" className="mb-4 text-ui-fg-muted">
            Варианты с наименьшим количеством продаж
          </Text>
        </div>

        <a
          href={withOptionalAnalyticsRange(
            '/app/analytics?tab=products',
            range,
          )}
        >
          <Button variant="transparent" className="text-ui-fg-muted text-xs ">
            Подробнее
          </Button>
        </a>
      </div>
      <ChartStateWrapper
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        isEmpty={
          !topThreeWorstSellingProducts ||
          topThreeWorstSellingProducts.length === 0
        }
      >
        <div className="max-w-72 flex-1 text-xs aspect-video">
          <BarChart
            isHorizontal
            data={topThreeWorstSellingProducts}
            yAxisDataKey="quantity"
            xAxisDataKey="title"
            lineColor="#a1a1aa"
            colorKeyField="title"
            hideTooltip
          />
        </div>
      </ChartStateWrapper>
    </Container>
  );
};

// Покупатели
export const NewVsReturningCustomers = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useCustomerAnalytics(range);

  return (
    <Container className="flex flex-col">
      <div className="flex justify-between">
        <div>
          <Text size="large" weight="plus">
            Новые и повторные покупатели
          </Text>
          <Text size="xsmall" className="mb-4 text-ui-fg-muted">
            Новые и повторные покупатели за выбранный период
          </Text>
        </div>

        <a
          href={withOptionalAnalyticsRange(
            '/app/analytics?tab=customers',
            range,
          )}
        >
          <Button variant="transparent" className="text-ui-fg-muted text-xs ">
            Подробнее
          </Button>
        </a>
      </div>
      <ChartStateWrapper
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        isEmpty={!data?.customer_count || data.customer_count.length === 0}
      >
        <div className="w-full max-w-72 mx-auto flex-1 aspect-video min-w-60">
          <LineChart
            data={data?.customer_count}
            xAxisDataKey="name"
            series={[
              { dataKey: 'new_customers', color: '#82ca9d' },
              { dataKey: 'returning_customers', color: '#a1a1aa' },
            ]}
            hideTooltip
          />
        </div>
      </ChartStateWrapper>
    </Container>
  );
};

export const TopCustomerGroupBySales = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useCustomerAnalytics(range);

  return (
    <Container className="flex flex-col">
      <div className="flex justify-between">
        <div>
          <Text size="large" weight="plus">
            Продажи по группам покупателей
          </Text>
          <Text size="xsmall" className="mb-4 text-ui-fg-muted">
            Продажи по группам за выбранный период
          </Text>
        </div>

        <a
          href={withOptionalAnalyticsRange(
            '/app/analytics?tab=customers#:~:text=Top%20Customer%20Groups%20by%20Sales',
            range,
          )}
        >
          <Button variant="transparent" className="text-ui-fg-muted text-xs ">
            Подробнее
          </Button>
        </a>
      </div>
      <ChartStateWrapper
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        isEmpty={!data?.customer_group || data.customer_group.length === 0}
      >
        <div className="w-full max-w-72 mx-auto flex-1 aspect-video min-w-60">
          <BarChart
            data={data?.customer_group ?? []}
            xAxisDataKey="name"
            yAxisDataKey="total"
            lineColor="#a1a1aa"
            hideTooltip
          />
        </div>
      </ChartStateWrapper>
    </Container>
  );
};

export const AverageSalesPerCustomer = () => {
  const { interval, range } = useIntervalRange();
  const ordersQuery = useOrderAnalytics(interval, range);
  const customersQuery = useCustomerAnalytics(range);

  const customersPerBucket = new Map(
    (customersQuery.data?.customer_count ?? []).map((point) => [
      point.name,
      (point.new_customers ?? 0) + (point.returning_customers ?? 0),
    ]),
  );

  const averageSalesPerCustomerTimeline = (
    ordersQuery.data?.order_sales ?? []
  ).map((point) => {
    const customersInBucket =
      customersPerBucket.get(point.name) ??
      customersQuery.data?.total_customers ??
      0;

    return {
      name: point.name,
      value:
        customersInBucket > 0
          ? Number((point.sales / customersInBucket).toFixed(2))
          : 0,
    };
  });

  return (
    <Container className="flex flex-col">
      <div className="flex justify-between">
        <div>
          <Text size="large" weight="plus">
            Средние продажи на покупателя
          </Text>
          <Text size="xsmall" className="mb-4 text-ui-fg-muted">
            Средние продажи на покупателя за выбранный период
          </Text>
        </div>
        <a
          href={withOptionalAnalyticsRange(
            '/app/analytics#:~:text=Sales%20Over%20Time',
            range,
          )}
        >
          <Button variant="transparent" className="text-ui-fg-muted text-xs">
            Подробнее
          </Button>
        </a>
      </div>
      <ChartStateWrapper
        isLoading={ordersQuery.isLoading || customersQuery.isLoading}
        isError={ordersQuery.isError || customersQuery.isError}
        errorMessage={
          ordersQuery.error?.message || customersQuery.error?.message
        }
        isEmpty={averageSalesPerCustomerTimeline.length === 0}
      >
        <div className="w-full max-w-72 mx-auto flex-1 aspect-video min-w-60">
          <LineChart
            data={averageSalesPerCustomerTimeline}
            xAxisDataKey="name"
            yAxisDataKey="value"
            lineColor="#a1a1aa"
            yAxisTickFormatter={(value) =>
              new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: ordersQuery.data?.currency_code || 'AMD',
                maximumFractionDigits: 0,
              }).format(
                typeof value === 'number'
                  ? value
                  : typeof value === 'string'
                    ? Number(value)
                    : 0,
              )
            }
            hideTooltip
          />
        </div>
      </ChartStateWrapper>
    </Container>
  );
};
