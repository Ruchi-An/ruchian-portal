// src/components/2-Schedule/lib/dateUtils.ts
// ==================== 日付ユーティリティ関数 ====================

/**
 * 日付をYYYY-MM-DD形式の文字列に変換
 * @param date 日付オブジェクト
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
