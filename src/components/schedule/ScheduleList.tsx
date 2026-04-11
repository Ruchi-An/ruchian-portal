// ================================================
// ScheduleList.tsx - リスト表示コンポーネント
// ================================================
// 【役割】
// - 過去または未来のスケジュールをリスト形式で表示
// - カテゴリフィルターに対応
// - 日付と時刻でソート
// ================================================

import { type Event } from './ScheduleCalendar';
import { BookOpenText, Gamepad2, Globe, Shapes, type LucideIcon } from 'lucide-react';
import { DataTableList, type ColumnDef } from '../common/DataTableList';
import listStyles from '../common/DataTableList.module.css';
import calendarStyles from './css/ScheduleCalendar.module.css';

type ScheduleCategoryMeta = {
  label: string;
  Icon: LucideIcon;
};

function getScheduleCategoryMeta(category?: string | null): ScheduleCategoryMeta {
  if (category === '🎮') return { label: 'ゲーム', Icon: Gamepad2 };
  if (category === '📚') return { label: 'シナリオ', Icon: BookOpenText };
  if (category === '🌏') return { label: 'リアル', Icon: Globe };
  return { label: '未分類', Icon: Shapes };
}

type ScheduleCategoryBadgeProps = {
  category?: string | null;
  showLabel?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

function ScheduleCategoryBadge({
  category,
  showLabel = true,
  className,
  iconClassName,
  labelClassName,
}: ScheduleCategoryBadgeProps) {
  const { label, Icon } = getScheduleCategoryMeta(category);

  return (
    <span className={className} title={label} aria-label={label}>
      <Icon className={iconClassName} size={16} strokeWidth={2} aria-hidden="true" />
      {showLabel && <span className={labelClassName}>{label}</span>}
    </span>
  );
}

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

function formatDateWithWeekday(date?: string | null): string {
  if (!date) return "未定";
  const dateValue = new Date(`${date}T00:00:00`);
  const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(dateValue);
  return `${date}（${weekday}）`;
}

function formatDateTime(event: Event): string {
  const dateLabel = formatDateWithWeekday(event.date);
  const timeLabel = event.startTime || "未定";
  if (dateLabel === "未定" && timeLabel === "未定") return "未定";
  if (dateLabel === "未定") return timeLabel;
  return `${dateLabel} ${timeLabel}`;
}

function getTitleIcon(event: Event) {
  if (event.contentType === "game") return Gamepad2;
  if (event.contentType === "scenario") return BookOpenText;
  if (event.contentType === "real") return Globe;
  return null;
}

function formatTitle(event: Event): string {
  const baseTitle = event.title?.trim() || event.label?.trim() || "-";
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
      align: 'left',
      headerAlign: 'left',
      className: calendarStyles.tableCellDate, // 既存のdate用スタイルを流用
      headerClassName: calendarStyles.tableHeaderDate, // 既存のdate用スタイルを流用
      render: (event) => formatDateTime(event)
    },
    {
      key: 'title',
      header: 'タイトル',
      align: 'left',
      headerAlign: 'left',
      className: calendarStyles.tableCellTitle,
      headerClassName: `${calendarStyles.tableHeaderTitle} ${listStyles.headerTitleOffset}`,
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
    },
    {
      key: 'category',
      header: 'カテゴリ',
      align: 'center',
      headerAlign: 'center',
      className: calendarStyles.tableCellCategory,
      headerClassName: calendarStyles.tableHeaderCategory,
      render: (event) => (
        <ScheduleCategoryBadge
          category={event.category}
          showLabel={false}
          className={listStyles.categoryBadge}
          iconClassName={listStyles.categoryIcon}
        />
      )
    }
  ];

  return (
    <DataTableList
      columns={columns}
      data={allEvents}
      onRowClick={onEventClick}
      emptyMessage="該当する予定がありません"
      getRowKey={(event, index) => `${event.id}-${index}`}
      gridTemplateColumns="clamp(96px, 18vw, 220px) minmax(0, 1fr) clamp(48px, 7vw, 92px)"
    />
  );
}
