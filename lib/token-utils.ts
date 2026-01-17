export function roundToUsdc(amount: number): number {
  return Math.floor(amount * 1_000_000) / 1_000_000
}

