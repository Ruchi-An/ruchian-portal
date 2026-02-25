// ================================================
// ScheduleCalendar.tsx - カレンダー表示コンポーネント
// ================================================
// 【役割】
// - 指定された年月のカレンダーを表示
// - 各日に予定されたイベントを表示
// - 配信休み、仕事休みなどのバッジを表示
// - 管理画面では日付セルをクリック可能に
// ================================================

import type { ScheduleData } from "types/database";
import Holidays from "date-holidays";
import { BedSingle, MonitorOff, Pin, Gamepad2, BookOpenText, Globe, type LucideIcon } from "lucide-react";
import sharedStyles from "./css/ScheduleCalendar.module.css";

// ==================== 型定義 ====================

/** イベント型（ScheduleDataの部分的なデータ） */
export type Event = Partial<ScheduleData> & { title?: string };

/** カレンダーの1日分のセル情報 */
type CalendarCell = {
  label: string; // 日付表示（例: "1", "2", ...）
  key: string; // 一意なkey（日付キーまたは"empty-N"）
  isToday: boolean; // 今日かどうか
  events: Event[]; // その日のイベント一覧
  isEmpty: boolean; // 空セル（月の範囲外）かどうか
  weekday?: number; // 曜日（0=日曜, 6=土曜）
  isWeekend?: boolean; // 週末かどうか
  isHoliday?: boolean; // 祝日かどうか
  badgeTypes?: Array<'stream-off' | 'work-off' | 'tentative'>; // バッジタイプ
};

// ==================== 定数 ====================

/** 曜日ラベル */
const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const REAL_ICON = "🌏";
const GENRE_ICON_FALLBACK = "✨";

// ==================== ユーティリティ関数 ====================

/**
 * 時刻文字列から時間帯カテゴリを取得
 * @param timeStr - 時刻文字列（例: "21:00", "25:30"）
 * @returns 時間帯カテゴリ（morning, afternoon, evening, late-night, undefined）
 */
function getTimeCategory(timeStr: string | null | undefined): string {
  if (!timeStr || timeStr === "未定") return "undefined";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "undefined";
  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour < 12) return "morning"; // 朝: 6:00-11:59
  if (hour >= 12 && hour < 18) return "afternoon"; // 昼: 12:00-17:59
  if (hour >= 18 && hour < 24) return "evening"; // 夜: 18:00-23:59
  if (hour >= 24 && hour < 30) return "late-night"; // 深夜: 24:00-29:59
  return "undefined";
}

/**
 * 時刻文字列から分単位の数値を取得（ソート用）
 * @param timeStr - 時刻文字列（例: "21:00"）
 * @returns 分単位の数値（例: 21*60+0=1260）
 */
function getStartMinutes(timeStr: string | null | undefined): number {
  if (!timeStr || timeStr === "未定") return Number.POSITIVE_INFINITY;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  return hour * 60 + minute;
}

function extractGenreEmoji(genre: string | null | undefined): string {
  if (!genre) return GENRE_ICON_FALLBACK;
  const trimmedGenre = genre.trim();
  const match = trimmedGenre.match(/^[\p{Extended_Pictographic}\uFE0F]+/u);
  return match?.[0] || GENRE_ICON_FALLBACK;
}

function getEventIcon(event: Event): string {
  if (event.contentType === "real" || event.category === "🌏") return REAL_ICON;
  return extractGenreEmoji(event.genre);
}

function getCategoryIcon(event: Event): LucideIcon | null {
  if (event.contentType === "real" || event.category === "🌏") return Globe;
  if (event.category === "🎮") return Gamepad2;
  if (event.category === "📚") return BookOpenText;
  return null;
}

// ==================== Props定義 ====================

interface ScheduleCalendarProps {
  year: number; // 表示する年
  monthIndex: number; // 表示する月（0-11）
  todayKey: string; // 今日の日付キー（YYYY-MM-DD形式）
  eventsByDate: Record<string, Event[]>; // 日付ごとのイベント
  onEventClick: (event: Event) => void; // イベントクリック時のコールバック
  streamOffDays?: Set<string>; // 配信休みの日付セット
  workOffDays?: Set<string>; // 仕事休みの日付セット
  tentativeDays?: Set<string>; // 予定未定の日付セット
  onCellClick?: (dateKey: string) => void; // セルクリック時のコールバック（管理画面用）
  onCellRightClick?: (dateKey: string, e: React.MouseEvent) => void; // セル右クリック時のコールバック（管理画面用）
  isClickable?: boolean; // セルをクリック可能にするか（管理画面用）
}

// ==================== コンポーネント ====================

/**
 * カレンダー表示コンポーネント
 * 指定された年月のカレンダーを表示し、各日のイベントとバッジを表示する
 */
export function ScheduleCalendar({ 
  year, 
  monthIndex, 
  todayKey, 
  eventsByDate, 
  onEventClick,
  streamOffDays = new Set(),
  workOffDays = new Set(),
  tentativeDays = new Set(),
  onCellClick,
  onCellRightClick,
  isClickable = false,
}: ScheduleCalendarProps) {
  // 日本の祝日判定用
  const holidays = new Holidays('JP');
  
  // カレンダーの計算
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 月初の曜日（0-6）
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // その月の日数
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7; // グリッド全体のセル数（7の倍数）

  // カレンダーセルを生成
  const calendarCells: CalendarCell[] = Array.from({ length: totalCells }, (_, index) => {
    const dateNumber = index - firstDayOfMonth + 1; // 日付番号（1始まり）
    
    // 月の範囲外のセル
    if (dateNumber < 1 || dateNumber > daysInMonth) {
      return {
        key: `empty-${index}`,
        label: "",
        isToday: false,
        events: [],
        isEmpty: true,
      };
    }
    
    // 有効な日付セル
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(dateNumber).padStart(2, "0")}`;
    const dateObj = new Date(year, monthIndex, dateNumber);
    const weekday = dateObj.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const isHoliday = Boolean(holidays.isHoliday(dateObj));
    
    // バッジ情報を配列化
    const badgeTypes: Array<'stream-off' | 'work-off' | 'tentative'> = [];
    if (streamOffDays.has(dateKey)) badgeTypes.push('stream-off');
    if (workOffDays.has(dateKey)) badgeTypes.push('work-off');
    if (tentativeDays.has(dateKey)) badgeTypes.push('tentative');
    
    return {
      key: dateKey,
      label: String(dateNumber),
      isToday: dateKey === todayKey,
      events: eventsByDate[dateKey] ?? [],
      isEmpty: false,
      weekday,
      isWeekend,
      isHoliday,
      badgeTypes,
    };
  });

  // バッジ情報（アイコンとラベル）
  const badgeInfo: Record<'stream-off' | 'work-off' | 'tentative', { icon: LucideIcon; label: string }> = {
    'stream-off': { icon: MonitorOff, label: '配信休み' },
    'work-off': { icon: BedSingle, label: '仕事休み' },
    'tentative': { icon: Pin, label: '予定入るかも' },
  };

  return (
    <>
      {/* 時間帯の凡例 */}
      <div className={sharedStyles.legendContainer}>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendMorning}`} />
            <span className={sharedStyles.legendText}>朝</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendAfternoon}`} />
            <span className={sharedStyles.legendText}>昼</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendEvening}`} />
            <span className={sharedStyles.legendText}>夜</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendLateNight}`} />
            <span className={sharedStyles.legendText}>深夜</span>
          </div>
        </div>
        <div className={sharedStyles.legend}>
          <div className={sharedStyles.legendItem}>
            <span className={`${sharedStyles.legendDot} ${sharedStyles.legendUndefined}`} />
            <span className={sharedStyles.legendText}>時間未定</span>
          </div>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className={sharedStyles.weekRow}>
        {weekdayLabels.map((day) => (
          <span key={day} className={sharedStyles.weekLabel}>{day}</span>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className={sharedStyles.calendarGrid}>
        {calendarCells.map((cell) => {
          // セルのクラス名を組み立て
          const classNames = [sharedStyles.dayCell];
          if (cell.isToday) classNames.push(sharedStyles.today);
          if (cell.events.length > 0) classNames.push(sharedStyles.hasEvent);
          if (cell.isEmpty) classNames.push(sharedStyles.empty);
          if (cell.badgeTypes?.includes('stream-off')) classNames.push(sharedStyles.streamOffDay);
          
          return (
            <div 
              key={cell.key} 
              className={classNames.join(" ")}
              onClick={() => !cell.isEmpty && onCellClick && onCellClick(cell.key)}
              onContextMenu={(e) => !cell.isEmpty && onCellRightClick && onCellRightClick(cell.key, e)}
              title={isClickable ? "右クリックでバッジを追加/削除" : undefined}
              style={isClickable && !cell.isEmpty ? { cursor: 'pointer' } : undefined}
            >
              {/* 日付とバッジの行 */}
              <div className={sharedStyles.dateRow}>
                {(() => {
                  // 日付の色を曜日や祝日によって変更
                  const dateClasses = [sharedStyles.dateNumber];
                  if (cell.isHoliday) {
                    dateClasses.push(sharedStyles.holidayDate);
                  } else if (cell.weekday === 0) {
                    dateClasses.push(sharedStyles.sundayDate);
                  } else if (cell.weekday === 6) {
                    dateClasses.push(sharedStyles.saturdayDate);
                  }
                  return <span className={dateClasses.join(' ')}>{cell.label}</span>;
                })()}

                {/* バッジ表示 */}
                {cell.badgeTypes && cell.badgeTypes.length > 0 && (
                  <div className={sharedStyles.badgeContainer}>
                    {cell.badgeTypes.map((badgeType) => (
                      <span
                        key={badgeType}
                        className={`${sharedStyles.badgeMarker} ${sharedStyles[`badge-${badgeType}`]}`}
                        title={badgeInfo[badgeType].label}
                      >
                        {(() => {
                          const Icon = badgeInfo[badgeType].icon;
                          return <Icon className={sharedStyles.badgeIcon} aria-hidden="true" />;
                        })()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* イベント一覧 */}
              {cell.events.length > 0 && (
                <ul className={sharedStyles.eventList}>
                  {[...cell.events]
                    .sort((a, b) => getStartMinutes(a.startTime) - getStartMinutes(b.startTime)) // 時刻順にソート
                    .map((event) => {
                    const timeCategory = getTimeCategory(event.startTime); // 時間帯カテゴリ
                    const startLabel = event.startTime || "未定";
                    const eventIcon = getEventIcon(event);
                    const shortTitle = event.label?.trim() || event.title || "-";
                    const CategoryIcon = getCategoryIcon(event);
                    const isIconTimeOnly = Boolean(CategoryIcon);

                    return (
                      <li
                        key={`${event.id}-${event.title}`}
                        className={`${sharedStyles.eventChip} ${sharedStyles[`event-${timeCategory}`]}`}
                        onClick={(e) => {
                          e.stopPropagation(); // セルのクリックイベントに伝播させない
                          onEventClick(event);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            onEventClick(event);
                          }
                        }}
                      >
                        <div className={sharedStyles.eventText}>
                          {isIconTimeOnly ? (
                            <span className={sharedStyles.eventCompactRow}>
                              <span className={sharedStyles.eventIconLine} aria-hidden="true">
                                {CategoryIcon && <CategoryIcon className={sharedStyles.eventCategoryIcon} />}
                              </span>
                              <span className={sharedStyles.eventCompactTime}>{startLabel}</span>
                            </span>
                          ) : (
                            <>
                              <span className={sharedStyles.eventIconLine} aria-hidden="true">{eventIcon}</span>
                              <span className={sharedStyles.eventTitleRow} title={shortTitle}>{shortTitle}</span>
                              <span className={sharedStyles.eventTime}>（{startLabel}）</span>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
