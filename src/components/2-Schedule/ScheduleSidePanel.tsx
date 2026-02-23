// ================================================
// ScheduleSidePanel.tsx - カレンダー横サイドパネル
// ================================================
// 役割:
// - 日程未定の予定リストを表示
// - PCではカレンダー横、スマホでは下部に表示
// - 折りたたみ可能
// ================================================

import React from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Event } from "./ScheduleCalendar";
import { ScheduleCategoryBadge } from "./lib/ScheduleCategoryBadge";
import listStyles from "./css/ScheduleList.module.css";

interface ScheduleSidePanelProps {
  schedules: Event[];
  onEventClick: (event: Event) => void;
  panelMode?: 'buttonOnly' | 'panelOnly'; // 追加: 表示モード
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ScheduleSidePanel: React.FC<ScheduleSidePanelProps> = ({ schedules, onEventClick, panelMode, open, setOpen }) => {
  // 日程未定のみ抽出
  const undated = schedules.filter(e => e.status === 'pending');

  // panelModeで分岐
  if (panelMode === 'buttonOnly') {
    // サイドパネルが閉じているときだけボタンを表示
    if (!open) {
      return (
        <button
          className={listStyles.sidePanelOpenButton}
          onClick={() => setOpen(true)}
          aria-label="未定リストを開く"
        >
          未定 <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      );
    }
    return null;
  }
  if (panelMode === 'panelOnly') {
    // サイドパネル本体のみ表示
    return (
      <aside className={listStyles.sidePanel + (open ? "" : " " + listStyles.sidePanelClosed)}>
        {open && (
          <>
            <button className={listStyles.sidePanelToggle} onClick={() => setOpen(false)}>
              <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" /> 閉じる
            </button>
            <div className={listStyles.sidePanelContent}>
              <h3 className={listStyles.sidePanelTitle}>日程未定の予定</h3>
              {undated.length === 0 ? (
                <div className={listStyles.emptyMessage}>未定の予定はありません</div>
              ) : (
                <ul className={listStyles.undatedList}>
                  {undated.map((event, i) => (
                    <li key={event.id || i} className={listStyles.undatedItem} onClick={() => onEventClick(event)}>
                      <span className={listStyles.undatedTitle}>{event.title || "(タイトル未定)"}</span>
                      <ScheduleCategoryBadge
                        category={event.category}
                        className={listStyles.undatedCategory}
                        iconClassName={listStyles.undatedCategoryIcon}
                        labelClassName={listStyles.undatedCategoryLabel}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    );
  }

  // デフォルト（従来通り）
  return (
    <>
      {/* サイドパネル開くボタン（閉時のみ表示、カレンダー右上に絶対配置） */}
      {!open && (
        <button
          className={listStyles.sidePanelOpenButton}
          onClick={() => setOpen(true)}
          aria-label="未定リストを開く"
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}
      <aside className={listStyles.sidePanel + (open ? "" : " " + listStyles.sidePanelClosed)}>
        {open && (
          <>
            <button className={listStyles.sidePanelToggle} onClick={() => setOpen(false)}>
              <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" /> 閉じる
            </button>
            <div className={listStyles.sidePanelContent}>
              <h3 className={listStyles.sidePanelTitle}>日程未定の予定</h3>
              {undated.length === 0 ? (
                <div className={listStyles.emptyMessage}>未定の予定はありません</div>
              ) : (
                <ul className={listStyles.undatedList}>
                  {undated.map((event, i) => (
                    <li key={event.id || i} className={listStyles.undatedItem} onClick={() => onEventClick(event)}>
                      <span className={listStyles.undatedTitle}>{event.title || "(タイトル未定)"}</span>
                      <ScheduleCategoryBadge
                        category={event.category}
                        className={listStyles.undatedCategory}
                        iconClassName={listStyles.undatedCategoryIcon}
                        labelClassName={listStyles.undatedCategoryLabel}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
};
