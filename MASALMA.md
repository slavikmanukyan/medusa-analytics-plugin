# Masalma fork

Upstream: https://github.com/Agilo/medusa-analytics-plugin (MIT).
Maintained fork: https://github.com/slavikmanukyan/medusa-analytics-plugin.

This fork is specific to Masalma's Paid Order metadata contract and Russian Admin.
It targets Medusa 2.22.1. It is not a generic replacement for every Medusa store.

- Only Orders with `metadata.payment.status=success` and `paid_at` enter sales/order KPIs.
- Both Medusa `canceled` and `metadata.lifecycle=cancelled` exclude an Order from those KPIs; cancellations remain visible in the status chart.
- Sales are goods + shipping, minus goods Returns. Gift Card issuance is prepayment and excluded; redeeming a Gift Card is payment and does not reduce sales. This is an operational dashboard, not fiscal accounting.
- Returns restate the original Order cohort. These charts do not report cash movement by refund date. Paid Order count includes subsequently returned and digital Gift Card Orders; average sales per Order uses that same count.
- Each report uses the store's default currency only. No exchange API, currency conversion or cache module is needed.
- Report date boundaries are Asia/Yerevan. Queries are paginated explicitly; custom periods are limited to three years.
- Variant ranking subtracts returned units, excludes newly issued Gift Cards, and uses the Order's title snapshot even if the catalog changed.
- Low stock is current available Inventory after reservations, respects component quantities, excludes unmanaged Inventory and Gift Cards, and works without a SKU. The configurable threshold defaults to 5 and accepts 0.
- All report screens, widgets and empty/error states are Russian.

## Validate and update

```
pnpm install --frozen-lockfile
pnpm test:reporting
pnpm exec tsc --noEmit
pnpm exec medusa plugin:build
```

The consuming app pins a full Git commit. The compiled `.medusa/server` files
are committed alongside source so pnpm/Docker can install this maintained fork
without running untrusted install scripts or requiring an npm publication.
After source changes, rebuild and `git add -f .medusa/server` before committing;
update the full commit in the consuming app and refresh its lockfile. Never edit
compiled files by hand. The original upstream README describes upstream behavior.
