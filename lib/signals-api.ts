export function formatNumber(num: number, decimals: number = 2): string {
  if (typeof num !== "number" || isNaN(num)) {
    return (0).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function createTradingSignal() {
  return { success: true }
}
