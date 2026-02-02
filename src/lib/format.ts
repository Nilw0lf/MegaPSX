export const formatCurrency = (value: number, currency = "PKR") => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercent = (value: number) =>
  `${value.toFixed(2).replace(/\.00$/, "")}%`;
