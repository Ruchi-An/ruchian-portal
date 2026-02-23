// src/components/2-Schedule/lib/calendarUtils.ts
// ==================== カレンダー関連ユーティリティ関数 ====================

export function getYearOptions(currentYear: number, range: number = 3): number[] {
  // 過去range年～未来range年まで
  return Array.from({ length: range * 2 + 1 }, (_, i) => currentYear - range + i);
}

// 年を変更
export function changeYear(displayDate: { year: number; month: number }, newYear: number) {
  return { ...displayDate, year: newYear };
}

// 月を変更
export function changeMonth(displayDate: { year: number; month: number }, newMonth: number) {
  return { ...displayDate, month: newMonth };
}

// 前月へ
export function prevMonth(displayDate: { year: number; month: number }) {
  if (displayDate.month === 0) {
    return { year: displayDate.year - 1, month: 11 };
  }
  return { year: displayDate.year, month: displayDate.month - 1 };
}

// 次月へ
export function nextMonth(displayDate: { year: number; month: number }) {
  if (displayDate.month === 11) {
    return { year: displayDate.year + 1, month: 0 };
  }
  return { year: displayDate.year, month: displayDate.month + 1 };
}