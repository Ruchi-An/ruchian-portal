// ================================================
// ScheduleList.tsx - リスト表示コンポーネント
// ================================================
// 【役割】
// - 過去または未来のスケジュールをリスト形式で表示
// - カテゴリフィルターに対応
// - 日付と時刻でソート
// ================================================

import { type Event } from './ScheduleCalendar';
import { BookOpenText, Gamepad2, Globe } from 'lucide-react';
import type { ReactNode } from 'react';
import { DataTableList, type ColumnDef } from '../common/DataTableList';
import listStyles from '../common/DataTableList.module.css';
import calendarStyles from './css/ScheduleCalendar.module.css';

// ==================== ユーティリティ関数 ====================

/**
 * 時刻文字列から分単位の数値を取得（ソート用）
 * @param timeStr - 時刻文字列（例: "21:00"）
 * @returns 分単位の数値（例: 21*60+0=1260）
 */

// ==================== Props定義 ====================

interface ScheduleListProps {
  schedules: Event[]; // 表示するスケジュール一覧
  categoryFilter: string; // カテゴリフィルター（"all", "🎮", "📚"）
  onEventClick: (event: Event) => void; // イベントクリック時のコールバック
}

// ==================== コンポーネント ====================

/**
 * スケジュールリスト表示コンポーネント
 * 過去または未来のスケジュールをテーブル形式で表示する
 */

function getStartMinutes(timeStr: string | null | undefined): number {
  if (!timeStr || timeStr === "未定") return Number.POSITIVE_INFINITY;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  return hour * 60 + minute;
}

function formatDateWithWeekday(date?: string | null): ReactNode {
  if (!date) return '未定';
  const dateValue = new Date(`${date}T00:00:00`);
  const weekday = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(dateValue);

  return (
    <span className={listStyles.dateLabel}>
      {date}（{weekday}）
    </span>
  );
}

function formatDateTime(event: Event): ReactNode {
  const dateLabel = formatDateWithWeekday(event.date);
  const timeLabel = event.startTime || '未定';

  if (!event.date && timeLabel === '未定') return '未定';
  if (!event.date) return <span className={listStyles.timeText}>{timeLabel}</span>;

  return (
    <span className={listStyles.dateTimeLabel}>
      {dateLabel}
      <span className={listStyles.timeText}>{timeLabel}</span>
    </span>
  );
}

function getTitleIcon(event: Event) {
  if (event.contentType === "game") return Gamepad2;
  if (event.contentType === "scenario") return BookOpenText;
  if (event.contentType === "real") return Globe;
  return null;
}

function formatTitle(event: Event): string {
  const baseTitle = event.honmyo?.trim() || event.title?.trim() || event.label?.trim() || "-";
  if (event.contentType === "scenario") return `『${baseTitle}』`;
  return baseTitle;
}

export function ScheduleList({ schedules, categoryFilter, onEventClick }: ScheduleListProps) {
  // ==================== カテゴリフィルター適用 ====================
  const filteredSchedules = schedules.filter(event => {
    if (event.contentType === "real") return false;
    if (event.category === "🌏") return false;
    if (categoryFilter === "all") return true;
    if (categoryFilter === "🎮") return event.category === "🎮";
    if (categoryFilter === "📚") return event.category === "📚";
    return true;
  });

  // ==================== 日付でグループ化してソート ====================
  const groupedByDate: Record<string, Event[]> = {};
  filteredSchedules.forEach(event => {
    const dateKey = event.date || "未定";
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(event);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    if (a === "未定") return 1;
    if (b === "未定") return -1;
    return a.localeCompare(b);
  });

  // 全てのイベントをフラット化して時刻順にソート
  const allEvents = sortedDates.flatMap(dateKey => 
    groupedByDate[dateKey].sort((a, b) => 
      getStartMinutes(a.startTime) - getStartMinutes(b.startTime)
    )
  );

  // ==================== テーブルカラム定義 ====================
  const columns: ColumnDef<Event>[] = [
    {
      key: 'datetime',
      header: '日程',
      align: 'center',
      headerAlign: 'center',
      className: calendarStyles.tableCellDate,
      headerClassName: calendarStyles.tableHeaderDate,
      divider: true,
      render: (event) => formatDateTime(event)
    },
    {
      key: 'title',
      header: 'タイトル',
      align: 'left',
      headerAlign: 'center',
      className: calendarStyles.tableCellTitle,
      headerClassName: calendarStyles.tableHeaderTitle,
      render: (event) => {
        const TitleIcon = getTitleIcon(event);
        const isGameTitle = event.contentType === "game";
        return (
          <span className={isGameTitle ? listStyles.titleWithIconGame : listStyles.titleWithIcon}>
            {TitleIcon && <TitleIcon className={listStyles.titleIcon} aria-hidden="true" />}
            <span className={listStyles.titleText}>{formatTitle(event)}</span>
          </span>
        );
      }
    }
  ];

  return (
    <DataTableList
      columns={columns}
      data={allEvents}
      onRowClick={onEventClick}
      emptyMessage="該当する予定がありません"
      getRowKey={(event, index) => `${event.id}-${index}`}
      gridTemplateColumns="clamp(125px, 28vw, 240px) minmax(0, 1fr)"
    />
  );
}
