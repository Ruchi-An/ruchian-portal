// ==============================================
// CalendarNavigation.tsx - 年月ナビゲーションUIコンポーネント
// ================================================

// 年月ナビゲーションUIコンポーネント
import React from "react";
import styles from "../2-Schedule/css/ScheduleCalendar.module.css";

// ==================== Props型定義 ====================
interface CalendarNavigationProps {
  year: number;
  monthIndex: number; // 0-11
  yearOptions: number[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMonthChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onToday: () => void;
}

// ==================== コンポーネント本体 ====================
export const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  year,
  monthIndex,
  yearOptions,
  onPrevMonth,
  onNextMonth,
  onYearChange,
  onMonthChange,
  onToday,
}) => {
  return (
    <div className={styles.dateNavigationContainer}>
      <button
        className={styles.navButton}
        onClick={onPrevMonth}
        aria-label="前月"
      >
        ←
      </button>
      <select
        value={year}
        onChange={onYearChange}
        className={styles.dateSelector}
        aria-label="年を選択"
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}年
          </option>
        ))}
      </select>
      <select
        value={monthIndex}
        onChange={onMonthChange}
        className={styles.dateSelector}
        aria-label="月を選択"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>
            {String(i + 1).padStart(2, "0")}月
          </option>
        ))}
      </select>
      <button
        className={styles.navButton}
        onClick={onNextMonth}
        aria-label="次月"
      >
        →
      </button>
      <button
        className={styles.todayButton}
        onClick={onToday}
        aria-label="今日に戻る"
      >
        今日
      </button>
    </div>
  );
};
