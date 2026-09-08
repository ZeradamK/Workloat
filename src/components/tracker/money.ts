/** Currency string matching the iOS app's Double.money: whole dollars stay
    clean ("$89"), cents always show both digits ("$72.40"). */
export function money(value: number): string {
  const isWhole = value % 1 === 0;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  });
}
