// ================================================
// ListDown.tsx - 日程未定リストダウン（1200px以下用）
// ================================================
import React, { useState } from "react";
import { type Event } from "./ScheduleCalendar";
import { ScheduleCategoryBadge } from "./lib/ScheduleCategoryBadge";
import styles from "./css/ListDown.module.css";

interface ListDownProps {
  schedules: Event[];
  onEventClick: (event: Event) => void;
}

export const ListDown: React.FC<ListDownProps> = ({ schedules, onEventClick }) => {
  const undated = schedules.filter(e => e.status === 'pending');
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.listDownContainer}>
      <button
        className={styles.listDownToggle}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={open ? "リストを閉じる" : "リストを開く"}
      >
        {open ? "▼ 日程未定の予定を閉じる" : "▲ 日程未定の予定を開く"}
      </button>
      {open && (
        <>
          <h3 className={styles.listDownTitle}>日程未定の予定</h3>
          {undated.length === 0 ? (
            <div className={styles.listDownEmpty}>未定の予定はありません</div>
          ) : (
            <ul className={styles.listDownList}>
              {undated.map((event, i) => (
                <li key={event.id || i} className={styles.listDownItem} onClick={() => onEventClick(event)}>
                  <span className={styles.listDownTitleText}>{event.title || "(タイトル未定)"}</span>
                  <ScheduleCategoryBadge
                    category={event.category}
                    className={styles.listDownCategory}
                    iconClassName={styles.listDownCategoryIcon}
                    labelClassName={styles.listDownCategoryLabel}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
