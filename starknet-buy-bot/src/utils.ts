export const shortHash = (hash: string): string =>
  hash.slice(0, 6) + '…' + hash.slice(-4);

export function usd(n: number): string {
  if (n >= 1000) {
    // $1,000+
    return Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
  }
  if (n >= 1) {
    // $1.00 – $999.99
    return Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }
  // Very small values (< $1)
  const fixed = n.toFixed(12);       // e.g. "0.000000002619000"
  return fixed.replace(/\.?0+$/, ''); // trim trailing zeros & optional dot
}
