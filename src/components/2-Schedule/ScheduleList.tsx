// ================================================
// ScheduleList.tsx - リスト表示コンポーネント
// ================================================
// 【役割】
// - 過去または未来のスケジュールをリスト形式で表示
// - カテゴリフィルターに対応
// - 日付と時刻でソート
// ================================================

import { type Event } from "./ScheduleCalendar";
import { ScheduleCategoryBadge } from "./lib/ScheduleCategoryBadge";
import calendarStyles from "./css/ScheduleCalendar.module.css";
import listStyles from './css/ScheduleList.module.css';

// ==================== テーブル実装 ====================

/**
 * カラム定義
 */
interface ColumnDef<T = unknown> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  headerAlign?: 'left' | 'center' | 'right';
}

/**
 * テーブルリストのProps
 */
interface TableListProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  getRowKey: (item: T, index: number) => string | number;
  gridTemplateColumns?: string;
}

/**
 * 汎用テーブルリストコンポーネント
 */
function TableList<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = '該当するデータがありません',
  getRowKey,
  gridTemplateColumns
}: TableListProps<T>) {
  if (data.length === 0) {
    return (
      <div className={listStyles.container}>
        <p className={listStyles.emptyMessage}>{emptyMessage}</p>
      </div>
    );
  }

  const gridStyle = gridTemplateColumns ? { gridTemplateColumns } : undefined;

  return (
    <div className={listStyles.container}>
      <div className={listStyles.wrapper}>
        {/* ヘッダー行 */}
        <div className={listStyles.header} style={gridStyle}>
          {columns.map((column) => (
            <span
              key={column.key}
              className={`${listStyles.headerCell} ${listStyles[`align-${column.headerAlign || 'center'}`]} ${column.headerClassName || ''}`}
            >
              {column.header}
            </span>
          ))}
        </div>

        {/* データ行 */}
        <div className={listStyles.rows}>
          {data.map((item, index) => (
            <div
              key={getRowKey(item, index)}
              className={listStyles.row}
              style={gridStyle}
              onClick={() => onRowClick?.(item)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyPress={(e) => {
                if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                  onRowClick(item);
                }
              }}
            >
              {columns.map((column) => (
                <span
                  key={column.key}
                  className={`${listStyles.cell} ${listStyles[`align-${column.align || 'left'}`]} ${column.className || ''}`}
                >
                  {column.render(item)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
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
  categoryFilter: string; // カテゴリフィルター（"all", "🎮", "📚", "🌏"）
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

export function ScheduleList({ schedules, categoryFilter, onEventClick }: ScheduleListProps) {
  // ==================== カテゴリフィルター適用 ====================
  const filteredSchedules = schedules.filter(event => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "🎮") return event.category === "🎮";
    if (categoryFilter === "📚") return event.category === "📚";
    if (categoryFilter === "🌏") return event.category === "🌏";
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
      headerAlign: 'center',
      className: calendarStyles.tableCellDate, // 既存のdate用スタイルを流用
      headerClassName: calendarStyles.tableHeaderDate, // 既存のdate用スタイルを流用
      render: (event) => {
        const date = event.date || "未定";
        const start = event.startTime || "未定";
        const end = event.endTime ? `-${event.endTime}` : '';
        if (date === "未定" && start === "未定") return "未定";
        if (date === "未定") return `${start}${end}`;
        if (start === "未定") return date;
        return `${date} ${start}${end}`;
      }
    },
    {
      key: 'title',
      header: 'タイトル',
      align: 'left',
      headerAlign: 'center',
      className: calendarStyles.tableCellTitle,
      headerClassName: calendarStyles.tableHeaderTitle,
      render: (event) => event.title || "-"
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
    <TableList
      columns={columns}
      data={allEvents}
      onRowClick={onEventClick}
      emptyMessage="該当する予定がありません"
      getRowKey={(event, index) => `${event.id}-${index}`}
      gridTemplateColumns="clamp(100px, 20vw, 250px) minmax(0, 1fr) clamp(20px, 8vw, 100px)"
    />
  );
}
