export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (4 - i), 12);
    return d;
  });
}

export function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}