export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function dayKeysForLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => isoDaysAgo(n - 1 - i).slice(0, 10));
}
