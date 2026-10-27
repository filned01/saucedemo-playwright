/** SauceDemo applies 8% tax to the item subtotal and rounds to the nearest cent. */
export function taxFor(subtotal: number): number {
  const subtotalCents = Math.round(subtotal * 100);
  return Math.round(subtotalCents * 0.08) / 100;
}

export function sumPrices(prices: number[]): number {
  const cents = prices.reduce((total, price) => total + Math.round(price * 100), 0);
  return cents / 100;
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Item total renders a bare `$0`. Tax and the grand total always use two decimals. */
function formatItemTotal(amount: number): string {
  if (amount === 0) {
    return '$0';
  }
  return formatUsd(amount);
}

export function orderTotals(prices: number[]): { subtotal: string; tax: string; total: string } {
  const subtotal = sumPrices(prices);
  const tax = taxFor(subtotal);
  const total = Math.round((subtotal + tax) * 100) / 100;
  return {
    subtotal: `Item total: ${formatItemTotal(subtotal)}`,
    tax: `Tax: ${formatUsd(tax)}`,
    total: `Total: ${formatUsd(total)}`,
  };
}
