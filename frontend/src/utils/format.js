/** Storefront prices (US locale). Catalog values are shown as USD. */
export function formatUSD(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return "$0.00"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
