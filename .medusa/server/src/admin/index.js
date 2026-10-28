"use strict";
const jsxRuntime = require("react/jsx-runtime");
const adminSdk = require("@medusajs/admin-sdk");
const ui = require("@medusajs/ui");
const React = require("react");
const recharts = require("recharts");
const Medusa = require("@medusajs/js-sdk");
const clsx = require("clsx");
const tailwindMerge = require("tailwind-merge");
const reactQuery = require("@tanstack/react-query");
const dateFns = require("date-fns");
const icons = require("@medusajs/icons");
const lucideReact = require("lucide-react");
const reactAriaComponents = require("react-aria-components");
const date = require("@internationalized/date");
const reactRouterDom = require("react-router-dom");
require("@medusajs/admin-shared");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const React__namespace = /* @__PURE__ */ _interopNamespace(React);
const Medusa__default = /* @__PURE__ */ _interopDefault(Medusa);
const useDarkMode = () => {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);
  return isDark;
};
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
function generateStableColor(input, saturation = 70, lightness = 50) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
function generateColorsForData(data, keyField, saturation = 70, lightness = 50) {
  return data.map(
    (item) => generateStableColor(String(item[keyField]), saturation, lightness)
  );
}
const sdk = new Medusa__default.default({
  baseUrl: __BACKEND_URL__ || "/",
  auth: {
    type: "session"
  }
});
const BarChart = ({
  data,
  xAxisDataKey,
  yAxisDataKey,
  lineColor = "#3B82F6",
  yAxisTickFormatter,
  useStableColors = false,
  colorKeyField,
  isHorizontal = false,
  hideTooltip = false
}) => {
  const isDark = useDarkMode();
  const colors = React__namespace.default.useMemo(() => {
    if (!useStableColors || !data || !colorKeyField) {
      return [];
    }
    return generateColorsForData(data, colorKeyField, 70, isDark ? 60 : 50);
  }, [data, useStableColors, colorKeyField, isDark]);
  return /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { aspect: 16 / 9, children: /* @__PURE__ */ jsxRuntime.jsxs(
    recharts.BarChart,
    {
      data,
      margin: { left: 20 },
      layout: isHorizontal ? "vertical" : "horizontal",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          recharts.CartesianGrid,
          {
            strokeDasharray: "3 3",
            stroke: isDark ? "#374151" : "#E5E7EB"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          recharts.XAxis,
          {
            type: isHorizontal ? "number" : "category",
            dataKey: !isHorizontal ? String(xAxisDataKey) : void 0,
            tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
            axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
            tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
            tickMargin: 10
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          recharts.YAxis,
          {
            type: isHorizontal ? "category" : "number",
            dataKey: isHorizontal ? String(xAxisDataKey) : void 0,
            tickFormatter: yAxisTickFormatter,
            allowDecimals: false,
            tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
            axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
            tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" }
          }
        ),
        !hideTooltip && /* @__PURE__ */ jsxRuntime.jsx(
          recharts.Tooltip,
          {
            cursor: {
              fill: isDark ? "rgba(55, 65, 81, 0.2)" : "rgba(243, 244, 246, 0.5)"
            },
            formatter: yAxisTickFormatter ? yAxisTickFormatter : void 0,
            contentStyle: {
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
              borderRadius: "0.5rem",
              color: isDark ? "#F9FAFB" : "#111827",
              boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            },
            labelStyle: {
              color: isDark ? "#F9FAFB" : "#111827",
              fontWeight: "500",
              marginBottom: "4px"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(recharts.Bar, { dataKey: String(yAxisDataKey), fill: lineColor, children: useStableColors && colors.length > 0 ? data?.map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(recharts.Cell, { fill: colors[index] }, `cell-${index}`)) : null })
      ]
    }
  ) });
};
const LineChart = ({
  data,
  xAxisDataKey,
  yAxisDataKey,
  lineColor = "#3B82F6",
  series,
  yAxisTickFormatter,
  hideTooltip = false
}) => {
  const isDark = useDarkMode();
  const resolvedSeries = series && series.length > 0 ? series : yAxisDataKey ? [{ dataKey: yAxisDataKey, color: lineColor }] : [];
  if (resolvedSeries.length === 0) {
    return null;
  }
  const isSingleDataPoint = data && data.length === 1;
  if (isSingleDataPoint) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { aspect: 16 / 9, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.BarChart, { data, margin: { left: 20 }, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        recharts.CartesianGrid,
        {
          strokeDasharray: "3 3",
          stroke: isDark ? "#374151" : "#E5E7EB"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        recharts.XAxis,
        {
          dataKey: xAxisDataKey,
          tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
          axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
          tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
          tickMargin: 10
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        recharts.YAxis,
        {
          tickFormatter: yAxisTickFormatter,
          allowDecimals: false,
          tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
          axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
          tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" }
        }
      ),
      !hideTooltip && /* @__PURE__ */ jsxRuntime.jsx(
        recharts.Tooltip,
        {
          cursor: {
            fill: isDark ? "rgba(55, 65, 81, 0.2)" : "rgba(243, 244, 246, 0.5)"
          },
          formatter: yAxisTickFormatter ? yAxisTickFormatter : void 0,
          contentStyle: {
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
            borderRadius: "0.5rem",
            color: isDark ? "#F9FAFB" : "#111827",
            boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          },
          labelStyle: {
            color: isDark ? "#F9FAFB" : "#111827",
            fontWeight: "500",
            marginBottom: "4px"
          }
        }
      ),
      resolvedSeries.map((s, idx) => /* @__PURE__ */ jsxRuntime.jsx(
        recharts.Bar,
        {
          dataKey: s.dataKey,
          fill: s.color || lineColor,
          radius: [4, 4, 0, 0],
          maxBarSize: 60
        },
        `${s.dataKey}_${idx}`
      ))
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { aspect: 16 / 9, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.LineChart, { data, margin: { left: 20 }, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      recharts.CartesianGrid,
      {
        strokeDasharray: "3 3",
        stroke: isDark ? "#374151" : "#E5E7EB"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      recharts.XAxis,
      {
        dataKey: xAxisDataKey,
        tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
        axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
        tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
        tickMargin: 10
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      recharts.YAxis,
      {
        tickFormatter: yAxisTickFormatter,
        allowDecimals: false,
        tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
        axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
        tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" }
      }
    ),
    !hideTooltip && /* @__PURE__ */ jsxRuntime.jsx(
      recharts.Tooltip,
      {
        cursor: {
          stroke: isDark ? "#4B5563" : "#E5E7EB",
          strokeWidth: 1,
          fill: isDark ? "rgba(55, 65, 81, 0.2)" : "rgba(243, 244, 246, 0.5)"
        },
        formatter: yAxisTickFormatter ? yAxisTickFormatter : void 0,
        contentStyle: {
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
          borderRadius: "0.5rem",
          color: isDark ? "#F9FAFB" : "#111827",
          boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        },
        labelStyle: {
          color: isDark ? "#F9FAFB" : "#111827",
          fontWeight: "500",
          marginBottom: "4px"
        }
      }
    ),
    resolvedSeries.map((s, idx) => {
      const color = s.color || lineColor;
      return /* @__PURE__ */ jsxRuntime.jsx(
        recharts.Line,
        {
          type: "monotone",
          dataKey: s.dataKey,
          stroke: color,
          activeDot: {
            r: 5,
            fill: color,
            stroke: isDark ? "#1F2937" : "#FFFFFF",
            strokeWidth: 2
          },
          strokeWidth: 2,
          dot: {
            r: 4,
            fill: color,
            stroke: isDark ? "#1F2937" : "#FFFFFF",
            strokeWidth: 1
          }
        },
        `${s.dataKey}_${idx}`
      );
    })
  ] }) });
};
async function retrieveProductAnalytics(date2) {
  if (!date2 || !date2.from || !date2?.to) {
    return void 0;
  }
  const dateFrom = dateFns.format(date2.from, "yyyy-MM-dd");
  const dateTo = dateFns.format(date2.to, "yyyy-MM-dd");
  const productAnalytics = await sdk.client.fetch(
    `/admin/agilo-analytics/products?date_from=${dateFrom}&date_to=${dateTo}`
  );
  return productAnalytics;
}
const useProductAnalytics = (query, options) => {
  return reactQuery.useQuery({
    queryKey: ["product-analytics", query?.from, query?.to],
    queryFn: async () => {
      const data = await retrieveProductAnalytics(query);
      return data;
    },
    ...options
  });
};
const intervalToDays = {
  "30-days-ago": 30,
  "60-days-ago": 60,
  "90-days-ago": 90
};
const getRangeForInterval = (interval) => {
  const to = /* @__PURE__ */ new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - intervalToDays[interval]);
  return {
    from,
    to
  };
};
const IntervalRangeContext = React__namespace.createContext({
  interval: "30-days-ago",
  range: getRangeForInterval("30-days-ago"),
  onIntervalChange: () => {
  }
});
const IntervalRangeContextProvider = ({ defaultInterval = "30-days-ago", children }) => {
  const [interval, setInterval] = React__namespace.useState(defaultInterval);
  const [range, setRange] = React__namespace.useState(
    () => getRangeForInterval(defaultInterval)
  );
  const onIntervalChange = React__namespace.useCallback((value) => {
    setInterval(value);
    setRange(getRangeForInterval(value));
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsx(
    IntervalRangeContext.Provider,
    {
      value: { interval, range, onIntervalChange },
      children
    }
  );
};
const useIntervalRange = () => React__namespace.useContext(IntervalRangeContext);
async function retrieveCustomersAnalytics(date2) {
  if (!date2 || !date2.from || !date2?.to) {
    return void 0;
  }
  const dateFrom = dateFns.format(date2.from, "yyyy-MM-dd");
  const dateTo = dateFns.format(date2.to, "yyyy-MM-dd");
  const customersAnalytics = await sdk.client.fetch(
    `/admin/agilo-analytics/customers?date_from=${dateFrom}&date_to=${dateTo}`
  );
  return customersAnalytics;
}
const useCustomerAnalytics = (query, options) => {
  return reactQuery.useQuery({
    queryKey: ["customer-analytics", JSON.stringify(query)],
    queryFn: async () => {
      const data = await retrieveCustomersAnalytics(query);
      return data;
    },
    ...options
  });
};
const Skeleton = ({
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "div",
  {
    ...props,
    className: tailwindMerge.twMerge(
      "animate-pulse rounded-md bg-[#F4F4F4] dark:bg-[#3F3F46]",
      className
    )
  }
);
const SmallCardSkeleton = () => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
  /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-20 h-[1.4375rem] my-1" }),
  /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-40 h-3.5" })
] });
const ChartStateWrapper = ({
  isLoading,
  isError,
  errorMessage,
  isEmpty = false,
  emptyText = "За выбранный период данных пока нет.",
  children
}) => {
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-44" });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-2 text-center aspect-video w-full mt-2.5 max-h-44", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "text-ui-fg-error", children: "Не удалось загрузить график." }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "text-ui-fg-muted max-w-72 truncate", children: errorMessage })
    ] });
  }
  if (isEmpty) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      ui.Text,
      {
        size: "xsmall",
        className: "text-ui-fg-muted flex items-center justify-center flex-1 aspect-video w-full mt-2.5 max-h-44",
        children: emptyText
      }
    );
  }
  return children;
};
const KPIStateWrapper = ({
  isLoading,
  isError,
  errorMessage,
  isEmpty = false,
  emptyText = "За выбранный период данных пока нет.",
  children
}) => {
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 justify-between flex-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(SmallCardSkeleton, {}) }),
      /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "aspect-video w-full max-w-64 mt-2.5" })
    ] });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-2 text-center py-4 max-h-44 aspect-video w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "text-ui-fg-error", children: "Не удалось загрузить показатели." }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "text-ui-fg-muted max-w-72 truncate", children: errorMessage })
    ] });
  }
  if (isEmpty) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      ui.Text,
      {
        size: "xsmall",
        className: "text-ui-fg-muted flex items-center justify-center flex-1 py-4 max-h-44 aspect-video w-full",
        children: emptyText
      }
    );
  }
  return children;
};
const formatDateYYYYMMDD = (date2) => dateFns.format(date2, "yyyy-MM-dd");
const dateRangeToAnalyticsRangeParam = (range) => {
  if (!range?.from) {
    return void 0;
  }
  const from = range.from;
  const to = range.to ?? range.from;
  return `${formatDateYYYYMMDD(from)}-${formatDateYYYYMMDD(to)}`;
};
const withOptionalAnalyticsRange = (href, range) => {
  const rangeParam = dateRangeToAnalyticsRangeParam(range);
  if (!rangeParam) {
    return href;
  }
  const url = new URL(href, "http://_");
  url.searchParams.set("range", rangeParam);
  return `${url.pathname}${url.search}${url.hash}`;
};
async function retrieveOrderAnalytics(preset, date2) {
  let url = `/admin/agilo-analytics/orders?preset=${preset}`;
  if (date2 && date2.from && date2.to) {
    const dateFrom = dateFns.format(date2.from, "yyyy-MM-dd");
    const dateTo = dateFns.format(date2.to, "yyyy-MM-dd");
    url = `/admin/agilo-analytics/orders?preset=custom&date_from=${dateFrom}&date_to=${dateTo}`;
  }
  const orderAnalytics = await sdk.client.fetch(url);
  return orderAnalytics;
}
const useOrderAnalytics = (preset, query, options) => {
  return reactQuery.useQuery({
    queryKey: ["order-analytics", preset, JSON.stringify(query)],
    queryFn: async () => {
      const data = await retrieveOrderAnalytics(preset, query);
      return data;
    },
    ...options
  });
};
const TopSellingProducts = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useProductAnalytics(range);
  const topThreeSellers = data?.variantQuantitySold?.filter((item) => item.quantity > 0).sort((a, b) => b.quantity - a.quantity).slice(0, 3);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", weight: "plus", children: "Самые продаваемые варианты" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "mb-4 text-ui-fg-muted ", children: "Варианты по количеству продаж за вычетом возвратов" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics?tab=products",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs ", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ChartStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        isEmpty: !topThreeSellers || topThreeSellers.length === 0,
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-72 flex-1 text-xs aspect-video", children: /* @__PURE__ */ jsxRuntime.jsx(
          BarChart,
          {
            isHorizontal: true,
            data: topThreeSellers,
            yAxisDataKey: "quantity",
            xAxisDataKey: "title",
            lineColor: "#a1a1aa",
            colorKeyField: "title",
            hideTooltip: true
          }
        ) })
      }
    )
  ] });
};
const LowStockVariants = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useProductAnalytics(range);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", weight: "plus", children: "Мало на складе" }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "xsmall", className: "mb-4 text-ui-fg-muted", children: [
          "Доступный остаток с учётом резервов",
          " "
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics?tab=products#:~:text=Low%20Stock%20Variants",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs ", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ChartStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        isEmpty: !data?.lowStockVariants || data.lowStockVariants.length === 0,
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-72 flex-1 text-xs aspect-video", children: /* @__PURE__ */ jsxRuntime.jsx(
          BarChart,
          {
            isHorizontal: true,
            data: data?.lowStockVariants,
            xAxisDataKey: "variantName",
            yAxisDataKey: "inventoryQuantity",
            lineColor: "#a1a1aa",
            colorKeyField: "variantName",
            hideTooltip: true
          }
        ) })
      }
    )
  ] });
};
const BottomSellingProducts = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useProductAnalytics(range);
  const topThreeWorstSellingProducts = data?.variantQuantitySold?.filter((item) => item.quantity > 0).sort((a, b) => a.quantity - b.quantity).slice(0, 3);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", weight: "plus", children: "Наименее продаваемые варианты" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "mb-4 text-ui-fg-muted", children: "Варианты с наименьшим количеством продаж" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics?tab=products",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs ", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ChartStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        isEmpty: !topThreeWorstSellingProducts || topThreeWorstSellingProducts.length === 0,
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-72 flex-1 text-xs aspect-video", children: /* @__PURE__ */ jsxRuntime.jsx(
          BarChart,
          {
            isHorizontal: true,
            data: topThreeWorstSellingProducts,
            yAxisDataKey: "quantity",
            xAxisDataKey: "title",
            lineColor: "#a1a1aa",
            colorKeyField: "title",
            hideTooltip: true
          }
        ) })
      }
    )
  ] });
};
const NewVsReturningCustomers = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useCustomerAnalytics(range);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", weight: "plus", children: "Новые и повторные покупатели" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "mb-4 text-ui-fg-muted", children: "Новые и повторные покупатели за выбранный период" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics?tab=customers",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs ", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ChartStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        isEmpty: !data?.customer_count || data.customer_count.length === 0,
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-72 mx-auto flex-1 aspect-video min-w-60", children: /* @__PURE__ */ jsxRuntime.jsx(
          LineChart,
          {
            data: data?.customer_count,
            xAxisDataKey: "name",
            series: [
              { dataKey: "new_customers", color: "#82ca9d" },
              { dataKey: "returning_customers", color: "#a1a1aa" }
            ],
            hideTooltip: true
          }
        ) })
      }
    )
  ] });
};
const TopCustomerGroupBySales = () => {
  const { range } = useIntervalRange();
  const { data, isLoading, isError, error } = useCustomerAnalytics(range);
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", weight: "plus", children: "Продажи по группам покупателей" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "mb-4 text-ui-fg-muted", children: "Продажи по группам за выбранный период" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics?tab=customers#:~:text=Top%20Customer%20Groups%20by%20Sales",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs ", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ChartStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        isEmpty: !data?.customer_group || data.customer_group.length === 0,
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-72 mx-auto flex-1 aspect-video min-w-60", children: /* @__PURE__ */ jsxRuntime.jsx(
          BarChart,
          {
            data: data?.customer_group ?? [],
            xAxisDataKey: "name",
            yAxisDataKey: "total",
            lineColor: "#a1a1aa",
            hideTooltip: true
          }
        ) })
      }
    )
  ] });
};
const AverageSalesPerCustomer = () => {
  const { interval, range } = useIntervalRange();
  const ordersQuery = useOrderAnalytics(interval, range);
  const customersQuery = useCustomerAnalytics(range);
  const customersPerBucket = new Map(
    (customersQuery.data?.customer_count ?? []).map((point) => [
      point.name,
      (point.new_customers ?? 0) + (point.returning_customers ?? 0)
    ])
  );
  const averageSalesPerCustomerTimeline = (ordersQuery.data?.order_sales ?? []).map((point) => {
    const customersInBucket = customersPerBucket.get(point.name) ?? customersQuery.data?.total_customers ?? 0;
    return {
      name: point.name,
      value: customersInBucket > 0 ? Number((point.sales / customersInBucket).toFixed(2)) : 0
    };
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", weight: "plus", children: "Средние продажи на покупателя" }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xsmall", className: "mb-4 text-ui-fg-muted", children: "Средние продажи на покупателя за выбранный период" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics#:~:text=Sales%20Over%20Time",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ChartStateWrapper,
      {
        isLoading: ordersQuery.isLoading || customersQuery.isLoading,
        isError: ordersQuery.isError || customersQuery.isError,
        errorMessage: ordersQuery.error?.message || customersQuery.error?.message,
        isEmpty: averageSalesPerCustomerTimeline.length === 0,
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-72 mx-auto flex-1 aspect-video min-w-60", children: /* @__PURE__ */ jsxRuntime.jsx(
          LineChart,
          {
            data: averageSalesPerCustomerTimeline,
            xAxisDataKey: "name",
            yAxisDataKey: "value",
            lineColor: "#a1a1aa",
            yAxisTickFormatter: (value) => new Intl.NumberFormat("ru-RU", {
              style: "currency",
              currency: ordersQuery.data?.currency_code || "AMD",
              maximumFractionDigits: 0
            }).format(
              typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0
            ),
            hideTooltip: true
          }
        ) })
      }
    )
  ] });
};
const SelectInterval = () => {
  const { interval, onIntervalChange } = useIntervalRange();
  return /* @__PURE__ */ jsxRuntime.jsxs(
    ui.Select,
    {
      size: "small",
      value: interval,
      onValueChange: (value) => onIntervalChange(value),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { className: "w-40", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, {}) }),
        /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "30-days-ago", children: "Последние 30 дней" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "60-days-ago", children: "Последние 60 дней" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "90-days-ago", children: "Последние 90 дней" })
        ] })
      ]
    }
  );
};
const CustomerWidget = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(IntervalRangeContextProvider, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(SelectInterval, {}) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 flex-col lg:flex-row", children: [
      /* @__PURE__ */ jsxRuntime.jsx(NewVsReturningCustomers, {}),
      /* @__PURE__ */ jsxRuntime.jsx(TopCustomerGroupBySales, {}),
      /* @__PURE__ */ jsxRuntime.jsx(AverageSalesPerCustomer, {})
    ] })
  ] });
};
adminSdk.defineWidgetConfig({
  zone: "customer.list.before"
});
const KPITimelineLabel = ({ percentage }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", className: "text-ui-fg-muted", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "span",
      {
        className: ui.clx(
          percentage > 0 && "text-ui-tag-green-text",
          percentage === 0 && "text-ui-fg-muted",
          percentage < 0 && "text-ui-fg-error",
          "inline-flex items-baseline gap-0.5"
        ),
        children: [
          percentage > 0 && /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowUpMini, { className: "size-3 self-center", viewBox: "0 0 15 15" }),
          percentage === 0 && /* @__PURE__ */ jsxRuntime.jsx(icons.Equals, { className: "size-3 self-center", viewBox: "0 0 15 15" }),
          percentage < 0 && /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowDownMini, { className: "size-3 self-center", viewBox: "0 0 15 15" }),
          new Intl.NumberFormat("ru-RU", {
            style: "percent",
            maximumFractionDigits: 2
          }).format(Math.abs(percentage))
        ]
      }
    ),
    " ",
    "к предыдущему периоду"
  ] });
};
const AverageOrderValue = () => {
  const { interval, range } = useIntervalRange();
  const { data, isLoading, isError, error } = useOrderAnalytics(
    interval,
    range
  );
  const salesChange = (data?.prev_sales_percent ?? 0) / 100;
  const ordersChange = (data?.prev_orders_percent ?? 0) / 100;
  const aovChangeFormula = 1 + ordersChange === 0 ? 0 : (1 + salesChange) / (1 + ordersChange) - 1;
  const orderSales = data?.order_sales ?? [];
  const orderCount = data?.order_count ?? [];
  const aovTimeline = orderSales.map((point, index) => {
    const count = orderCount[index].count;
    const sales = point.sales;
    return {
      name: point.name,
      value: count > 0 ? sales / count : 0
    };
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", children: "Средний чек" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics?tab=orders#:~:text=Заказы%20Over%20Time",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      KPIStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 justify-between flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: new Intl.NumberFormat("ru-RU", {
              style: "currency",
              currency: (data?.currency_code || "AMD").toUpperCase()
            }).format(
              data?.total_sales && data?.total_orders ? data.total_sales / data.total_orders : 0
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(KPITimelineLabel, { percentage: aovChangeFormula })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 flex mt-2.5", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "aspect-video mt-auto w-full max-w-64 ml-auto", children: /* @__PURE__ */ jsxRuntime.jsx(
            LineChart,
            {
              data: aovTimeline,
              xAxisDataKey: "name",
              yAxisDataKey: "value",
              lineColor: "#a1a1aa",
              yAxisTickFormatter: (value) => new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: (data?.currency_code || "AMD").toUpperCase(),
                maximumFractionDigits: 0
              }).format(
                typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0
              ),
              hideTooltip: true
            }
          ) }) })
        ] })
      }
    )
  ] });
};
const TotalSales = () => {
  const { interval, range } = useIntervalRange();
  const { data, isLoading, isError, error } = useOrderAnalytics(
    interval,
    range
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", children: "Продажи за вычетом возвратов" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics#:~:text=Sales%20Over%20Time",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      KPIStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 justify-between flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: new Intl.NumberFormat("ru-RU", {
              style: "currency",
              currency: data?.currency_code || "AMD"
            }).format(data?.total_sales || 0) }),
            /* @__PURE__ */ jsxRuntime.jsx(
              KPITimelineLabel,
              {
                percentage: (data?.prev_sales_percent ?? 0) / 100
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 flex mt-2.5", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "aspect-video mt-auto w-full max-w-64 ml-auto", children: /* @__PURE__ */ jsxRuntime.jsx(
            LineChart,
            {
              data: data?.order_sales ?? [],
              xAxisDataKey: "name",
              yAxisDataKey: "sales",
              lineColor: "#a1a1aa",
              yAxisTickFormatter: (value) => new Intl.NumberFormat("ru-RU", {
                style: "currency",
                currency: data?.currency_code || "AMD",
                maximumFractionDigits: 0
              }).format(
                typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0
              ),
              hideTooltip: true
            }
          ) }) })
        ] })
      }
    )
  ] });
};
const TotalOrders = () => {
  const { interval, range } = useIntervalRange();
  const { data, isLoading, isError, error } = useOrderAnalytics(
    interval,
    range
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "large", children: "Оплаченные заказы" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href: withOptionalAnalyticsRange(
            "/app/analytics#:~:text=Заказы%20Over%20Time",
            range
          ),
          children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "transparent", className: "text-ui-fg-muted text-xs", children: "Подробнее" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      KPIStateWrapper,
      {
        isLoading,
        isError,
        errorMessage: error?.message,
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 justify-between flex-1", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: data?.total_orders || 0 }),
            /* @__PURE__ */ jsxRuntime.jsx(
              KPITimelineLabel,
              {
                percentage: (data?.prev_orders_percent ?? 0) / 100
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 flex mt-2.5", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "aspect-video mt-auto w-full max-w-64 ml-auto", children: /* @__PURE__ */ jsxRuntime.jsx(
            LineChart,
            {
              data: data?.order_count ?? [],
              xAxisDataKey: "name",
              yAxisDataKey: "count",
              lineColor: "#a1a1aa",
              hideTooltip: true
            }
          ) }) })
        ] })
      }
    )
  ] });
};
const OrderWidget = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(IntervalRangeContextProvider, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(SelectInterval, {}) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(TotalSales, {}),
      /* @__PURE__ */ jsxRuntime.jsx(TotalOrders, {}),
      /* @__PURE__ */ jsxRuntime.jsx(AverageOrderValue, {})
    ] })
  ] });
};
adminSdk.defineWidgetConfig({
  zone: "order.list.before"
});
const ProductWidget = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(IntervalRangeContextProvider, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(SelectInterval, {}) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 flex-col lg:flex-row items-stretch", children: [
      /* @__PURE__ */ jsxRuntime.jsx(TopSellingProducts, {}),
      /* @__PURE__ */ jsxRuntime.jsx(LowStockVariants, {}),
      /* @__PURE__ */ jsxRuntime.jsx(BottomSellingProducts, {})
    ] })
  ] });
};
adminSdk.defineWidgetConfig({
  zone: "product.list.before"
});
const COLORS = [
  "#3B82F6",
  // blue-500
  "#10B981",
  // emerald-500
  "#F59E0B",
  // amber-500
  "#EF4444",
  // red-500
  "#8B5CF6",
  // violet-500
  "#06B6D4",
  // cyan-500
  "#84CC16",
  // lime-500
  "#F97316"
  // orange-500
];
const DARK_COLORS = [
  "#60A5FA",
  // blue-400
  "#34D399",
  // emerald-400
  "#FBBF24",
  // amber-400
  "#F87171",
  // red-400
  "#A78BFA",
  // violet-400
  "#22D3EE",
  // cyan-400
  "#A3E635",
  // lime-400
  "#FB923C"
  // orange-400
];
const PieChart = ({
  data,
  dataKey,
  hideTooltip = false
}) => {
  const isDark = useDarkMode();
  const colors = isDark ? DARK_COLORS : COLORS;
  return /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { aspect: 16 / 9, maxHeight: 400, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.PieChart, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      recharts.Pie,
      {
        data,
        label: ({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`,
        dataKey,
        cx: "50%",
        cy: "50%",
        outerRadius: "70%",
        children: data && data.map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(
          recharts.Cell,
          {
            fill: colors[index % colors.length]
          },
          `cell-${index}`
        ))
      }
    ),
    !hideTooltip && /* @__PURE__ */ jsxRuntime.jsx(
      recharts.Tooltip,
      {
        contentStyle: {
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
          borderRadius: "0.5rem",
          color: isDark ? "#F9FAFB" : "#111827",
          boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        },
        labelStyle: {
          color: isDark ? "#F9FAFB" : "#111827",
          fontWeight: "500",
          marginBottom: "4px"
        },
        itemStyle: {
          color: isDark ? "#F9FAFB" : "#111827"
        }
      }
    )
  ] }) });
};
const columnHelper$3 = ui.createDataTableColumnHelper();
const columns$2 = [
  columnHelper$3.accessor("sku", {
    header: "SKU",
    enableSorting: true,
    sortLabel: "SKU",
    sortAscLabel: "A-Z",
    sortDescLabel: "Z-A"
  }),
  columnHelper$3.accessor("variantName", {
    header: "Товар и размер",
    enableSorting: true,
    sortLabel: "Товар и размер",
    sortAscLabel: "A-Z",
    sortDescLabel: "Z-A"
  }),
  columnHelper$3.accessor("inventoryQuantity", {
    header: "Доступно",
    enableSorting: true,
    sortLabel: "Доступно",
    sortAscLabel: "По возрастанию",
    sortDescLabel: "По убыванию",
    cell: ({ getValue }) => {
      const value = getValue();
      return /* @__PURE__ */ jsxRuntime.jsx("p", { className: cn(value === 0 && "text-ui-fg-error"), children: value === 0 ? "Нет в наличии" : value });
    }
  })
];
const PAGE_SIZE$1 = 10;
const ProductsTable = ({ products }) => {
  const [pagination, setPagination] = React__namespace.useState({
    pageSize: PAGE_SIZE$1,
    pageIndex: 0
  });
  const [search, setSearch] = React__namespace.useState("");
  const [sorting, setSorting] = React__namespace.useState(
    null
  );
  const navigate = reactRouterDom.useNavigate();
  const shownProducts = React__namespace.useMemo(() => {
    let filtered = products.filter(
      (product) => product.variantName.toLowerCase().includes(search.toLowerCase()) || product.sku.toLowerCase().includes(search.toLowerCase())
    );
    if (sorting && sorting.id) {
      filtered = filtered.slice().sort((a, b) => {
        const aVal = a[sorting.id];
        const bVal = b[sorting.id];
        if (aVal < bVal) {
          return sorting.desc ? 1 : -1;
        }
        if (aVal > bVal) {
          return sorting.desc ? -1 : 1;
        }
        return 0;
      });
    }
    return filtered.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    );
  }, [products, search, sorting, pagination]);
  const table = ui.useDataTable({
    columns: columns$2,
    data: shownProducts,
    getRowId: (product) => product.variantId,
    rowCount: products.filter(
      (product) => product.variantName.toLowerCase().includes(search.toLowerCase()) || product.sku.toLowerCase().includes(search.toLowerCase())
    ).length,
    search: {
      state: search,
      onSearchChange: (value) => {
        setSearch(value);
        setPagination((previous) => ({ ...previous, pageIndex: 0 }));
      }
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination
    },
    sorting: {
      state: sorting,
      onSortingChange: setSorting
    },
    onRowClick: (_, row) => {
      navigate(
        // @ts-expect-error - original missing in the row type
        `/products/${row.original.productId}/variants/${row.original.variantId}`
      );
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable, { instance: table, children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Toolbar, { className: "px-0 pt-0", children: /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Search, { placeholder: "Поиск…" }) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.DataTable.Table,
      {
        emptyState: {
          filtered: {
            heading: "Товары не найдены"
          },
          empty: {
            heading: "Товаров пока нет"
          }
        }
      }
    ),
    products.length > PAGE_SIZE$1 && /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Pagination, {})
  ] });
};
const dummyData$1 = [
  {
    a: "a",
    b: "b",
    c: 0
  },
  {
    a: "a",
    b: "b",
    c: 0
  },
  {
    a: "a",
    b: "b",
    c: 0
  },
  {
    a: "a",
    b: "b",
    c: 0
  },
  {
    a: "a",
    b: "b",
    c: 0
  },
  {
    a: "a",
    b: "b",
    c: 0
  }
];
const columnHelper$2 = ui.createDataTableColumnHelper();
const columns$1 = [
  columnHelper$2.accessor("a", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  }),
  columnHelper$2.accessor("b", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  }),
  columnHelper$2.accessor("c", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  })
];
const ProductsTableSkeleton = () => {
  const [search, setSearch] = React__namespace.useState("");
  const table = ui.useDataTable({
    columns: columns$1,
    data: dummyData$1,
    getRowId: (product) => product.a,
    rowCount: dummyData$1.length,
    search: {
      state: search,
      onSearchChange: setSearch
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable, { instance: table, children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Toolbar, { className: "px-0 pt-0", children: /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Search, { placeholder: "Поиск…" }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Table, {})
  ] });
};
const StackedBarChart = ({
  data,
  xAxisDataKey,
  yAxisTickFormatter,
  useStableColors = false,
  colorKeyField,
  dataKeys,
  hideTooltip = false
}) => {
  const isDark = useDarkMode();
  const colors = React__namespace.default.useMemo(() => {
    if (!useStableColors || !data || !colorKeyField) {
      return [];
    }
    return generateColorsForData(data, colorKeyField, 70, isDark ? 60 : 50);
  }, [data, useStableColors, colorKeyField, isDark]);
  return /* @__PURE__ */ jsxRuntime.jsx(recharts.ResponsiveContainer, { aspect: 16 / 9, children: /* @__PURE__ */ jsxRuntime.jsxs(recharts.BarChart, { data, margin: { left: 20 }, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      recharts.CartesianGrid,
      {
        strokeDasharray: "3 3",
        stroke: isDark ? "#374151" : "#E5E7EB"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      recharts.XAxis,
      {
        dataKey: String(xAxisDataKey),
        tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
        axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
        tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
        tickMargin: 10
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      recharts.YAxis,
      {
        tickFormatter: yAxisTickFormatter,
        allowDecimals: false,
        tick: { fill: isDark ? "#D1D5DB" : "#6B7280" },
        axisLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" },
        tickLine: { stroke: isDark ? "#4B5563" : "#D1D5DB" }
      }
    ),
    !hideTooltip && /* @__PURE__ */ jsxRuntime.jsx(
      recharts.Tooltip,
      {
        cursor: {
          fill: isDark ? "rgba(55, 65, 81, 0.2)" : "rgba(243, 244, 246, 0.5)"
        },
        formatter: yAxisTickFormatter ? yAxisTickFormatter : void 0,
        contentStyle: {
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
          borderRadius: "0.5rem",
          color: isDark ? "#F9FAFB" : "#111827",
          boxShadow: isDark ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        },
        labelStyle: {
          color: isDark ? "#F9FAFB" : "#111827",
          fontWeight: "500",
          marginBottom: "4px"
        }
      }
    ),
    dataKeys?.map((key, index) => /* @__PURE__ */ jsxRuntime.jsx(
      recharts.Bar,
      {
        dataKey: String(key),
        stackId: "a",
        fill: useStableColors && colors.length > 0 ? colors[index] : "#3B82F6"
      },
      String(key)
    ))
  ] }) });
};
const dummyData = [
  {
    a: "a1",
    b: "b",
    c: 0,
    d: 0,
    e: /* @__PURE__ */ new Date()
  },
  {
    a: "a2",
    b: "b",
    c: 0,
    d: 0,
    e: /* @__PURE__ */ new Date()
  },
  {
    a: "a3",
    b: "b",
    c: 0,
    d: 0,
    e: /* @__PURE__ */ new Date()
  },
  {
    a: "a4",
    b: "b",
    c: 0,
    d: 0,
    e: /* @__PURE__ */ new Date()
  },
  {
    a: "a5",
    b: "b",
    c: 0,
    d: 0,
    e: /* @__PURE__ */ new Date()
  },
  {
    a: "a6",
    b: "b",
    c: 0,
    d: 0,
    e: /* @__PURE__ */ new Date()
  }
];
const columnHelper$1 = ui.createDataTableColumnHelper();
const columns = [
  columnHelper$1.accessor("a", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  }),
  columnHelper$1.accessor("b", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  }),
  columnHelper$1.accessor("c", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  }),
  columnHelper$1.accessor("d", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  }),
  columnHelper$1.accessor("e", {
    header: () => null,
    cell: () => /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "w-full h-5" })
  })
];
const CustomersTableSkeleton = () => {
  const [search, setSearch] = React__namespace.useState("");
  const table = ui.useDataTable({
    columns,
    data: dummyData,
    getRowId: (customer) => customer.a,
    rowCount: dummyData.length,
    search: {
      state: search,
      onSearchChange: setSearch
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable, { instance: table, children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Toolbar, { className: "px-0 pt-0", children: /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Search, { placeholder: "Поиск…" }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Table, {})
  ] });
};
const columnHelper = ui.createDataTableColumnHelper();
const PAGE_SIZE = 10;
const CustomersTable = ({
  customers,
  currencyCode
}) => {
  const [pagination, setPagination] = React__namespace.useState({
    pageSize: PAGE_SIZE,
    pageIndex: 0
  });
  const [search, setSearch] = React__namespace.useState("");
  const [sorting, setSorting] = React__namespace.useState(
    null
  );
  const navigate = reactRouterDom.useNavigate();
  const shownCustomers = React__namespace.useMemo(() => {
    let filtered = customers.filter(
      (customer) => customer.name.toLowerCase().includes(search.toLowerCase()) || customer.email.toLowerCase().includes(search.toLowerCase())
    );
    if (sorting && sorting.id) {
      filtered = filtered.slice().sort((a, b) => {
        const aVal = a[sorting.id];
        const bVal = b[sorting.id];
        if (!aVal && !bVal) return 0;
        if (!aVal) return sorting.desc ? 1 : -1;
        if (!bVal) return sorting.desc ? -1 : 1;
        if (aVal < bVal) return sorting.desc ? 1 : -1;
        if (aVal > bVal) return sorting.desc ? -1 : 1;
        return 0;
      });
    }
    return filtered.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    );
  }, [customers, search, sorting, pagination]);
  const columns2 = React__namespace.useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Имя",
        enableSorting: true,
        sortLabel: "Имя",
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A"
      }),
      columnHelper.accessor("email", {
        header: "Email",
        enableSorting: true,
        sortLabel: "Email",
        sortAscLabel: "A-Z",
        sortDescLabel: "Z-A"
      }),
      columnHelper.accessor("order_count", {
        header: "Заказы",
        enableSorting: true,
        sortLabel: "Заказы",
        sortAscLabel: "По возрастанию",
        sortDescLabel: "По убыванию"
      }),
      columnHelper.accessor("sales", {
        header: "Продажи за вычетом возвратов",
        enableSorting: true,
        sortLabel: "Продажи за вычетом возвратов",
        sortAscLabel: "По возрастанию",
        sortDescLabel: "По убыванию",
        cell: ({ getValue }) => {
          const sales = getValue();
          return /* @__PURE__ */ jsxRuntime.jsx("p", { children: new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode || "AMD"
          }).format(sales || 0) });
        }
      }),
      columnHelper.accessor("groups", {
        header: "Группы",
        cell: ({ getValue }) => {
          const groups = getValue();
          return /* @__PURE__ */ jsxRuntime.jsx("p", { children: groups.length ? groups.join(", ") : "Без группы" });
        }
      }),
      columnHelper.accessor("last_order", {
        header: "Последний заказ",
        enableSorting: true,
        sortLabel: "Последний заказ",
        sortAscLabel: "Сначала старые",
        sortDescLabel: "Сначала новые",
        cell: ({ getValue }) => {
          const date2 = getValue();
          return /* @__PURE__ */ jsxRuntime.jsx("p", { children: date2 ? new Intl.DateTimeFormat("ru-RU").format(new Date(date2)) : "Заказов пока нет" });
        }
      })
    ],
    [currencyCode]
  );
  const table = ui.useDataTable({
    columns: columns2,
    data: shownCustomers,
    getRowId: (customer) => customer.customer_id,
    rowCount: customers.length,
    search: {
      state: search,
      onSearchChange: setSearch
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination
    },
    sorting: {
      state: sorting,
      onSortingChange: setSorting
    },
    onRowClick: (_, row) => {
      navigate(`/customers/${row.original.customer_id}`);
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.DataTable, { instance: table, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Search, { placeholder: "Поиск…" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.SortingMenu, {})
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.DataTable.Table,
      {
        emptyState: {
          filtered: {
            heading: "Покупатели не найдены"
          },
          empty: {
            heading: "Покупателей пока нет"
          }
        }
      }
    ),
    customers.length > PAGE_SIZE && /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Pagination, {})
  ] });
};
function dateToCalendarDate(date$1) {
  return new date.CalendarDate(
    date$1.getFullYear(),
    date$1.getMonth() + 1,
    date$1.getDate()
  );
}
function calendarDateToDate(calendarDate) {
  const year = "year" in calendarDate ? calendarDate.year : (/* @__PURE__ */ new Date()).getFullYear();
  const month = "month" in calendarDate ? calendarDate.month : (/* @__PURE__ */ new Date()).getMonth() + 1;
  const day = "day" in calendarDate ? calendarDate.day : (/* @__PURE__ */ new Date()).getDate();
  return new Date(year, month - 1, day);
}
function dateRangeToRangeValue(dateRange) {
  if (!dateRange?.from) return null;
  return {
    start: dateToCalendarDate(dateRange.from),
    end: dateRange.to ? dateToCalendarDate(dateRange.to) : dateToCalendarDate(dateRange.from)
  };
}
function rangeValueToDateRange(rangeValue) {
  if (!rangeValue) return void 0;
  return {
    from: calendarDateToDate(rangeValue.start),
    to: rangeValue.end ? calendarDateToDate(rangeValue.end) : void 0
  };
}
function presetToDateRange(preset) {
  const today = /* @__PURE__ */ new Date();
  if (preset === "this-month") return { from: dateFns.startOfMonth(today), to: today };
  if (preset === "last-month")
    return {
      from: dateFns.startOfMonth(dateFns.subMonths(today, 1)),
      to: dateFns.endOfMonth(dateFns.subMonths(today, 1))
    };
  return {
    from: dateFns.startOfMonth(dateFns.subMonths(today, 3)),
    to: dateFns.endOfMonth(dateFns.subMonths(today, 1))
  };
}
const DATE_RANGE_REGEX = /^(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})$/;
const AnalyticsPage = () => {
  const [searchParams, setSearchParams] = reactRouterDom.useSearchParams();
  const rangeParam = searchParams.get("range") || "this-month";
  const date2 = React__namespace.useMemo(() => {
    if (rangeParam === "this-month" || rangeParam === "last-month" || rangeParam === "last-3-months") {
      return presetToDateRange(rangeParam);
    }
    const dates = rangeParam.match(DATE_RANGE_REGEX);
    if (dates) {
      const from = dateFns.parse(dates[1], "yyyy-MM-dd", /* @__PURE__ */ new Date());
      const to = dateFns.parse(dates[2], "yyyy-MM-dd", /* @__PURE__ */ new Date());
      return { from, to };
    }
    return void 0;
  }, [rangeParam]);
  const productQuery = useProductAnalytics(date2);
  const customerQuery = useCustomerAnalytics(date2);
  const orderQuery = useOrderAnalytics(
    ["this-month", "last-month", "last-3-months"].includes(rangeParam) ? rangeParam : "custom",
    date2
  );
  const someOrderCountsGreaterThanZero = orderQuery.data?.order_count?.some(
    (item) => item.count > 0
  );
  const someOrderSalesGreaterThanZero = orderQuery.data?.order_sales?.some(
    (item) => item.sales > 0
  );
  const someTopSellingProductsGreaterThanZero = productQuery.data?.variantQuantitySold?.some((item) => item.quantity > 0);
  const someCustomerCountsGreaterThanZero = customerQuery.data?.customer_count?.some(
    (item) => (item.new_customers || 0) > 0 || (item.returning_customers || 0) > 0
  );
  const updateDatePreset = React__namespace.useCallback(
    (preset) => {
      const params = new URLSearchParams(searchParams.toString());
      switch (preset) {
        case "this-month":
          params.set("range", "this-month");
          break;
        case "last-month":
          params.set("range", "last-month");
          break;
        case "last-3-months":
          params.set("range", "last-3-months");
          break;
        case "custom":
        default:
          if (rangeParam === "this-month" || rangeParam === "last-month" || rangeParam === "last-3-months") {
            const currentDate = presetToDateRange(rangeParam);
            params.set(
              "range",
              `${dateFns.format(currentDate.from || /* @__PURE__ */ new Date(), "yyyy-MM-dd")}-${dateFns.format(
                currentDate.to || /* @__PURE__ */ new Date(),
                "yyyy-MM-dd"
              )}`
            );
          }
          break;
      }
      setSearchParams(params);
    },
    [searchParams, rangeParam, setSearchParams]
  );
  const updateUrlParams = React__namespace.useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value?.from && value?.to) {
        params.set(
          "range",
          `${dateFns.format(value.from, "yyyy-MM-dd")}-${dateFns.format(
            value.to,
            "yyyy-MM-dd"
          )}`
        );
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );
  const handleDateRangeChange = React__namespace.useCallback(
    (value) => {
      const newDateRange = rangeValueToDateRange(value);
      updateUrlParams(newDateRange);
    },
    [updateUrlParams]
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "divide-y p-0", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-x-2 gap-y-4 items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h1", children: "Аналитика" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-muted", children: "AMD · время Еревана. Продажи: товары и доставка за вычетом возвратов; выпуск подарочных карт не включён. Возвраты пересчитывают период исходного заказа." }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-[170px]", children: /* @__PURE__ */ jsxRuntime.jsxs(
          ui.Select,
          {
            disabled: orderQuery.isLoading || productQuery.isLoading,
            defaultValue: "this-month",
            value: ["this-month", "last-month", "last-3-months"].includes(
              rangeParam
            ) ? rangeParam : "custom",
            onValueChange: updateDatePreset,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, {}) }),
              /* @__PURE__ */ jsxRuntime.jsxs(ui.Select.Content, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "this-month", children: "Этот месяц" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "last-month", children: "Прошлый месяц" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "last-3-months", children: "Последние 3 месяца" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: "custom", children: "Выбрать период" })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          reactAriaComponents.DateRangePicker,
          {
            value: dateRangeToRangeValue(date2),
            onChange: handleDateRangeChange,
            isDisabled: orderQuery.isLoading || productQuery.isLoading,
            "aria-label": "Период",
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs(reactAriaComponents.Group, { className: "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive justify-start focus-visible:shadow-borders-interactive-with-active disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled bg-ui-bg-field text-ui-fg-base txt-compact-small h-8 text-left font-normal data-[state=open]:!shadow-borders-interactive-with-active shadow-buttons-neutral hover:bg-ui-bg-field-hover outline-none transition-fg disabled:cursor-not-allowed min-w-[260px] bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-ui-bg-field-component dark:border-ui-border-base dark:hover:bg-ui-bg-field-hover px-4 border cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntime.jsx(icons.Calendar, { className: "h-4 w-4 text-ui-fg-muted group-disabled:text-ui-fg-disabled flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntime.jsx(reactAriaComponents.DateInput, { slot: "start", className: "flex-1 min-w-0", children: (segment) => /* @__PURE__ */ jsxRuntime.jsx(
                  reactAriaComponents.DateSegment,
                  {
                    segment,
                    className: "outline-none rounded-sm focus:bg-ui-bg-interactive focus:text-ui-fg-on-color caret-transparent placeholder-shown:italic text-ui-fg-base data-[placeholder]:text-ui-fg-muted"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": "true", className: "text-ui-fg-muted px-1", children: "—" }),
                /* @__PURE__ */ jsxRuntime.jsx(reactAriaComponents.DateInput, { slot: "end", className: "flex-1 min-w-0", children: (segment) => /* @__PURE__ */ jsxRuntime.jsx(
                  reactAriaComponents.DateSegment,
                  {
                    segment,
                    className: "outline-none rounded-sm focus:bg-ui-bg-interactive focus:text-ui-fg-on-color caret-transparent placeholder-shown:italic text-ui-fg-base data-[placeholder]:text-ui-fg-muted"
                  }
                ) }),
                /* @__PURE__ */ jsxRuntime.jsx(reactAriaComponents.Button, { className: "text-ui-fg-muted hover:bg-ui-bg-subtle dark:hover:bg-ui-bg-subtle rounded p-1", children: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronDown, { className: "size-4" }) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(reactAriaComponents.Popover, { className: "w-auto p-0 bg-transparent z-50", children: /* @__PURE__ */ jsxRuntime.jsx(reactAriaComponents.Dialog, { className: "bg-ui-bg-base dark:bg-ui-bg-base border border-ui-border-base dark:border-ui-border-base rounded-lg shadow-lg p-6 max-w-fit", children: /* @__PURE__ */ jsxRuntime.jsxs(
                reactAriaComponents.RangeCalendar,
                {
                  className: "w-fit",
                  visibleDuration: { months: 2 },
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "flex items-center justify-between mb-4", children: [
                      /* @__PURE__ */ jsxRuntime.jsx(
                        reactAriaComponents.Button,
                        {
                          slot: "previous",
                          className: "p-2 hover:bg-ui-bg-subtle dark:hover:bg-ui-bg-subtle rounded text-ui-fg-base",
                          children: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronLeft, { className: "size-4" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsx(reactAriaComponents.Heading, { className: "font-semibold text-lg text-ui-fg-base" }),
                      /* @__PURE__ */ jsxRuntime.jsx(
                        reactAriaComponents.Button,
                        {
                          slot: "next",
                          className: "p-2 hover:bg-ui-bg-subtle dark:hover:bg-ui-bg-subtle rounded text-ui-fg-base",
                          children: /* @__PURE__ */ jsxRuntime.jsx(icons.ChevronRight, { className: "size-4" })
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-6", children: [
                      /* @__PURE__ */ jsxRuntime.jsx(reactAriaComponents.CalendarGrid, { className: "border-collapse gap-1", children: (date22) => /* @__PURE__ */ jsxRuntime.jsx(
                        reactAriaComponents.CalendarCell,
                        {
                          date: date22,
                          className: "w-9 h-9 text-sm cursor-pointer rounded flex items-center justify-center hover:bg-ui-bg-subtle dark:hover:bg-ui-bg-subtle selected:bg-ui-bg-interactive selected:text-ui-fg-on-color selection-start:bg-ui-bg-interactive selection-start:text-ui-fg-on-color selection-end:bg-ui-bg-interactive selection-end:text-ui-fg-on-color outside-month:text-ui-fg-disabled unavailable:text-ui-fg-disabled unavailable:cursor-default text-ui-fg-base data-[selected]:bg-ui-bg-interactive data-[selected]:text-ui-fg-on-color data-[selection-start]:bg-ui-bg-interactive data-[selection-start]:text-ui-fg-on-color data-[selection-end]:bg-ui-bg-interactive data-[selection-end]:text-ui-fg-on-color"
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntime.jsx(
                        reactAriaComponents.CalendarGrid,
                        {
                          offset: { months: 1 },
                          className: "border-collapse gap-1",
                          children: (date22) => /* @__PURE__ */ jsxRuntime.jsx(
                            reactAriaComponents.CalendarCell,
                            {
                              date: date22,
                              className: "w-9 h-9 text-sm cursor-pointer rounded flex items-center justify-center hover:bg-ui-bg-subtle dark:hover:bg-ui-bg-subtle selected:bg-ui-bg-interactive selected:text-ui-fg-on-color selection-start:bg-ui-bg-interactive selection-start:text-ui-fg-on-color selection-end:bg-ui-bg-interactive selection-end:text-ui-fg-on-color outside-month:text-ui-fg-disabled unavailable:text-ui-fg-disabled unavailable:cursor-default text-ui-fg-base data-[selected]:bg-ui-bg-interactive data-[selected]:text-ui-fg-on-color data-[selection-start]:bg-ui-bg-interactive data-[selection-start]:text-ui-fg-on-color data-[selection-end]:bg-ui-bg-interactive data-[selection-end]:text-ui-fg-on-color"
                            }
                          )
                        }
                      )
                    ] })
                  ]
                }
              ) }) })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntime.jsxs(
      ui.Tabs,
      {
        value: searchParams.get("tab") || "orders",
        onValueChange: (value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("tab", value);
          setSearchParams(params);
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(ui.Tabs.List, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Tabs.Trigger,
              {
                value: "orders",
                disabled: orderQuery.isLoading || productQuery.isLoading,
                children: "Заказы"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Tabs.Trigger,
              {
                value: "products",
                disabled: orderQuery.isLoading || productQuery.isLoading,
                children: "Товары"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Tabs.Trigger,
              {
                value: "customers",
                disabled: orderQuery.isLoading || productQuery.isLoading,
                children: "Покупатели"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxRuntime.jsxs(ui.Tabs.Content, { value: "orders", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex max-md:flex-col gap-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 flex-1", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(icons.ShoppingCart, { className: "absolute right-6 top-4 text-ui-fg-muted" }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Оплаченные заказы" }),
                    orderQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(SmallCardSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: orderQuery.data?.total_orders || 0 }),
                      /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "xsmall", className: "text-ui-fg-muted", children: [
                        (orderQuery.data?.prev_orders_percent || 0) > 0 && "+",
                        orderQuery.data?.prev_orders_percent || 0,
                        "% к предыдущему периоду"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "min-h-[9.375rem]", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Заказы по датам" }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Оплаченные и неотменённые заказы за период" }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ChartStateWrapper,
                      {
                        isLoading: orderQuery.isLoading,
                        isError: orderQuery.isError,
                        errorMessage: orderQuery.error?.message,
                        isEmpty: !orderQuery.data?.order_count || orderQuery.data.order_count.length === 0 || !someOrderCountsGreaterThanZero,
                        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", style: { aspectRatio: "16/9" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                          LineChart,
                          {
                            data: orderQuery.data?.order_count,
                            xAxisDataKey: "name",
                            yAxisDataKey: "count"
                          }
                        ) })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 flex-1", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChartNoAxesCombined, { className: "absolute right-6 text-ui-fg-muted top-4 size-[15px]" }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Продажи за вычетом возвратов" }),
                    orderQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(SmallCardSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: orderQuery.data?.currency_code || "AMD"
                      }).format(orderQuery.data?.total_sales || 0) }),
                      /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "xsmall", className: "text-ui-fg-muted", children: [
                        (orderQuery.data?.prev_sales_percent || 0) > 0 && "+",
                        orderQuery.data?.prev_sales_percent || 0,
                        "% к предыдущему периоду"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "min-h-[9.375rem]", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Продажи по датам" }),
                    /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: [
                      "Продажи за выбранный период (",
                      orderQuery.data?.currency_code,
                      ")"
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      ChartStateWrapper,
                      {
                        isLoading: orderQuery.isLoading,
                        isError: orderQuery.isError,
                        errorMessage: orderQuery.error?.message,
                        isEmpty: !orderQuery.data?.order_sales || orderQuery.data.order_sales.length === 0 || !someOrderSalesGreaterThanZero,
                        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", style: { aspectRatio: "16/9" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                          LineChart,
                          {
                            data: orderQuery.data?.order_sales ?? [],
                            xAxisDataKey: "name",
                            yAxisDataKey: "sales",
                            lineColor: "#82ca9d",
                            yAxisTickFormatter: (value) => new Intl.NumberFormat("ru-RU", {
                              currency: orderQuery.data?.currency_code || "AMD",
                              maximumFractionDigits: 0
                            }).format(
                              typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0
                            )
                          }
                        ) })
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex max-md:flex-col gap-4", children: [
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "min-h-[9.375rem]", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Продажи по регионам" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Продажи по регионам за выбранный период" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ChartStateWrapper,
                    {
                      isLoading: orderQuery.isLoading,
                      isError: orderQuery.isError,
                      errorMessage: orderQuery.error?.message,
                      isEmpty: !orderQuery.data?.regions || orderQuery.data.regions.length === 0,
                      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", style: { aspectRatio: "16/9" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                        BarChart,
                        {
                          data: orderQuery.data?.regions ?? [],
                          xAxisDataKey: "name",
                          yAxisDataKey: "sales",
                          lineColor: "#82ca9d",
                          useStableColors: true,
                          colorKeyField: "name",
                          yAxisTickFormatter: (value) => new Intl.NumberFormat("ru-RU", {
                            currency: orderQuery.data?.currency_code || "AMD",
                            maximumFractionDigits: 0
                          }).format(
                            typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0
                          )
                        }
                      ) })
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "min-h-[9.375rem]", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Статусы заказов" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Все заказы по статусам, включая отменённые" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ChartStateWrapper,
                    {
                      isLoading: orderQuery.isLoading,
                      isError: orderQuery.isError,
                      errorMessage: orderQuery.error?.message,
                      isEmpty: !orderQuery.data?.statuses || orderQuery.data.statuses.length === 0,
                      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", style: { aspectRatio: "16/9" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                        PieChart,
                        {
                          data: orderQuery.data?.statuses,
                          dataKey: "count"
                        }
                      ) })
                    }
                  )
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.Tabs.Content, { value: "products", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "mb-4 min-h-[9.375rem]", children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Самые продаваемые варианты" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Количество проданных единиц за вычетом возвратов" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  ChartStateWrapper,
                  {
                    isLoading: productQuery.isLoading,
                    isError: productQuery.isError,
                    errorMessage: productQuery.error?.message,
                    isEmpty: !productQuery.data?.variantQuantitySold || productQuery.data.variantQuantitySold.length === 0 || !someTopSellingProductsGreaterThanZero,
                    children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", style: { aspectRatio: "16/9" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                      BarChart,
                      {
                        data: (productQuery.data?.variantQuantitySold ?? []).slice(0, 10),
                        xAxisDataKey: "title",
                        yAxisDataKey: "quantity",
                        lineColor: "#82ca9d",
                        useStableColors: true,
                        colorKeyField: "title"
                      }
                    ) })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-4 max-xl:flex-col", children: [
                /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Нет в наличии" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Варианты с нулевым доступным остатком" }),
                  productQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(ProductsTableSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsx(
                    ProductsTable,
                    {
                      products: productQuery.data?.lowStockVariants?.filter(
                        (product) => product.inventoryQuantity === 0
                      ) || []
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Мало на складе" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Доступный остаток с учётом резервов" }),
                  productQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(ProductsTableSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsx(
                    ProductsTable,
                    {
                      products: productQuery.data?.lowStockVariants?.filter(
                        (product) => product.inventoryQuantity > 0
                      ) || []
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.Tabs.Content, { value: "customers", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex max-md:flex-col gap-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 flex-1", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(icons.User, { className: "absolute right-6 top-4 text-ui-fg-muted" }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Покупатели" }),
                    customerQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(SmallCardSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: customerQuery.data?.total_customers || 0 }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(icons.User, { className: "absolute right-6 top-4 text-ui-fg-muted" }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Новые покупатели" }),
                    customerQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(SmallCardSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: customerQuery.data?.new_customers || 0 }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 flex-1", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(icons.User, { className: "absolute right-6 text-ui-fg-muted top-4 size-[15px]" }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Повторные покупатели" }),
                    customerQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(SmallCardSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: customerQuery.data?.returning_customers || 0 }) })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChartNoAxesCombined, { className: "absolute right-6 top-4 text-ui-fg-muted" }),
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: "Средние продажи на покупателя" }),
                    customerQuery.isLoading || orderQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(SmallCardSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: new Intl.NumberFormat("ru-RU", {
                      currency: customerQuery.data?.currency_code || "AMD",
                      style: "currency"
                    }).format(
                      customerQuery.data?.total_customers && customerQuery.data.total_customers > 0 ? (orderQuery.data?.total_sales || 0) / customerQuery.data.total_customers : 0
                    ) }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex max-md:flex-col gap-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "min-h-[9.375rem]", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Новые и повторные покупатели" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Distribution of new and returning customers in the selected period" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ChartStateWrapper,
                    {
                      isLoading: customerQuery.isLoading,
                      isError: customerQuery.isError,
                      errorMessage: customerQuery.error?.message,
                      isEmpty: !customerQuery.data?.customer_count || customerQuery.data.customer_count.length === 0 || !someCustomerCountsGreaterThanZero,
                      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", style: { aspectRatio: "16/9" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                        StackedBarChart,
                        {
                          data: customerQuery.data?.customer_count ?? [],
                          xAxisDataKey: "name",
                          lineColor: "#82ca9d",
                          useStableColors: true,
                          colorKeyField: "returning_customers",
                          dataKeys: ["new_customers", "returning_customers"]
                        }
                      ) })
                    }
                  )
                ] }) }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "min-h-[9.375rem]", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Продажи по группам покупателей" }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Продажи по группам за выбранный период" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    ChartStateWrapper,
                    {
                      isLoading: customerQuery.isLoading,
                      isError: customerQuery.isError,
                      errorMessage: customerQuery.error?.message,
                      isEmpty: !customerQuery.data?.customer_group || customerQuery.data.customer_group.length === 0,
                      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", style: { aspectRatio: "16/9" }, children: /* @__PURE__ */ jsxRuntime.jsx(
                        BarChart,
                        {
                          data: customerQuery.data?.customer_group ?? [],
                          xAxisDataKey: "name",
                          lineColor: "#82ca9d",
                          useStableColors: true,
                          colorKeyField: "name",
                          yAxisDataKey: "total",
                          yAxisTickFormatter: (value) => new Intl.NumberFormat("ru-RU", {
                            currency: customerQuery.data?.currency_code || "AMD",
                            maximumFractionDigits: 0
                          }).format(
                            typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0
                          )
                        }
                      ) })
                    }
                  )
                ] }) })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-4 max-xl:flex-col", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "xlarge", weight: "plus", children: "Покупатели по сумме покупок" }),
                /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "mb-8 text-ui-fg-muted", children: "Покупатели по продажам за выбранный период" }),
                customerQuery.isLoading ? /* @__PURE__ */ jsxRuntime.jsx(CustomersTableSkeleton, {}) : /* @__PURE__ */ jsxRuntime.jsx(
                  CustomersTable,
                  {
                    customers: customerQuery.data?.customer_sales || [],
                    currencyCode: customerQuery.data?.currency_code || "AMD"
                  }
                )
              ] }) })
            ] })
          ] })
        ]
      }
    ) })
  ] });
};
const config = adminSdk.defineRouteConfig({
  label: "Аналитика",
  icon: icons.ChartBar
});
const widgetModule = { widgets: [
  {
    Component: CustomerWidget,
    zone: ["customer.list.before"],
    widgetId: "Widget-d23d"
  },
  {
    Component: OrderWidget,
    zone: ["order.list.before"],
    widgetId: "Widget-e5b8"
  },
  {
    Component: ProductWidget,
    zone: ["product.list.before"],
    widgetId: "Widget-9260"
  }
] };
const routeModule = {
  routes: [
    {
      Component: AnalyticsPage,
      path: "/analytics",
      handle: { label: config.label, translationNs: config.translationNs }
    }
  ]
};
const menuItemModule = {
  menuItems: [
    {
      label: config.label,
      icon: config.icon,
      path: "/analytics",
      nested: void 0,
      rank: void 0,
      translationNs: void 0
    }
  ]
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const i18nModule = { resources: {} };
const cellRendererModule = {};
const layoutModule = { layouts: [] };
const searchEntityModule = {};
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule,
  i18nModule,
  cellRendererModule,
  layoutModule,
  searchEntityModule
};
module.exports = plugin;
