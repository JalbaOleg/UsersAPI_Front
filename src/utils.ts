export function formatDate(value: string): string {
  if (!value) return "";
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : value + "Z";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" });
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "A apărut o eroare necunoscută.";
}
