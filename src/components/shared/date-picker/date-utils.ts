export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function isSameDay(
  d1?: Date | null,
  d2?: Date | null,
): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isBeforeDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 < t2;
}

export function isAfterDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 > t2;
}

export function isDateInRange(
  date: Date,
  start?: Date | null,
  end?: Date | null,
): boolean {
  if (!start || !end) return false;
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const tStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const tEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  const min = Math.min(tStart, tEnd);
  const max = Math.max(tStart, tEnd);
  return t >= min && t <= max;
}

export function formatDate(
  date: Date | null | undefined,
  format: string = "YYYY-MM-DD",
): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours24 >= 12 ? "PM" : "AM";

  const pad = (n: number) => String(n).padStart(2, "0");

  return format
    .replace(/YYYY/g, String(year))
    .replace(/YY/g, String(year).slice(-2))
    .replace(/MMMM/g, MONTH_NAMES[month] ?? "")
    .replace(/MMM/g, SHORT_MONTH_NAMES[month] ?? "")
    .replace(/MM/g, pad(month + 1))
    .replace(/\bM\b/g, String(month + 1))
    .replace(/DD|dd/g, pad(day))
    .replace(/\b(D|d)\b/g, String(day))
    .replace(/HH/g, pad(hours24))
    .replace(/\bH\b/g, String(hours24))
    .replace(/hh/g, pad(hours12))
    .replace(/\bh\b/g, String(hours12))
    .replace(/mm/g, pad(minutes))
    .replace(/\bm\b/g, String(minutes))
    .replace(/ss/g, pad(seconds))
    .replace(/\bs\b/g, String(seconds))
    .replace(/A/g, ampm)
    .replace(/a/g, ampm.toLowerCase());
}

export interface CalendarDayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateCalendarDays(year: number, month: number): CalendarDayInfo[] {
  const days: CalendarDayInfo[] = [];
  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfWeek(year, month); // 0 (Sun) to 6 (Sat)
  const today = new Date();

  // Days from previous month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, day);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
    });
  }

  // Days in next month to complete 6 weeks (42 days) or 5 weeks
  const totalDays = days.length <= 35 ? 35 : 42;
  const remaining = totalDays - days.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let d = 1; d <= remaining; d++) {
    const date = new Date(nextYear, nextMonth, d);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
    });
  }

  return days;
}
