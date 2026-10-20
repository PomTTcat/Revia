export const REVIEW_OFFSETS = [1, 3, 7, 14, 30] as const;
export function dateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseDay(key: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('日期格式应为 YYYY-MM-DD');
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (dateKey(date) !== key) throw new Error('请输入有效日期');
  return date;
}
export function addDays(key: string, days: number): string {
  const date = parseDay(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}
export function reviewDates(key: string): string[] {
  const initial = REVIEW_OFFSETS.map((offset) => addDays(key, offset));
  const anchor = parseDay(initial[4]);
  const monthly = Array.from({ length: 10 }, (_, index) => {
    const month = anchor.getMonth() + index + 1;
    const lastDay = new Date(anchor.getFullYear(), month + 1, 0, 12).getDate();
    return dateKey(new Date(anchor.getFullYear(), month, Math.min(anchor.getDate(), lastDay), 12));
  });
  return [...initial, ...monthly];
}
export function prettyDay(key: string): string {
  const date = parseDay(key);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
