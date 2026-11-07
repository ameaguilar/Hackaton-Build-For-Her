/** Utilidades de fecha en hora local (sin depender de UTC). */

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

export function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function plusDaysISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** "18 de noviembre de 2026" (sin año si es el año en curso). */
export function longDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1);
  return y === new Date().getFullYear()
    ? new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long" }).format(date)
    : new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(
        date,
      );
}

/** "Hoy", "Ayer" o el día con formato corto ("12 nov"). */
export function relativeDayLabel(iso: string): string {
  if (iso === todayISO()) return "Hoy";
  if (iso === plusDaysISO(-1)) return "Ayer";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(
    new Date(y ?? 2000, (m ?? 1) - 1, d ?? 1),
  );
}
