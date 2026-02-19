export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("ko-KR").format(value ?? 0);
}

export function formatNumberString(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("ko-KR").format(Number(digits));
}
