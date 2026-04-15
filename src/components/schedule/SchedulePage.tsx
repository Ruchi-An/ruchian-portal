// ================================================
// SchedulePage.tsx - スケジュールページ（一般ユーザー用）
// ================================================
// 役割:
// - カレンダー表示、過去/未来リスト表示の切り替え
// - イベント詳細モーダルの表示
// - データのフィルタリングと整理
// ================================================

import { BookOpenText, CalendarDays, Clock3, Gamepad2, History, Shapes } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import type { ScheduleBadge } from 'types/database';
import { useData } from '../../lib/DataContext';
import { useIsNarrowScreen } from '../../lib/useIsNarrowScreen';
import { PageHero } from '../common/PageHero';
import { TabBar, type TabItem } from '../common/TabBar';
import { EventDetailModal } from './EventDetailModal';
import { ScheduleCalendar, type Event } from './ScheduleCalendar';
import { ScheduleList } from './ScheduleList';
import calendarStyles from './css/ScheduleCalendar.module.css';

type DisplayDate = {
  year: number;
  month: number;
};

type ViewMode = 'calendar' | 'future' | 'past';
type CategoryFilter = 'all' | '🎮' | '📚';

const VIEW_MODE_TABS: TabItem[] = [
  { key: 'past', label: 'リスト -過去-', shortLabel: '-過去-', icon: History },
  { key: 'calendar', label: 'カレンダー', shortLabel: 'カレンダー', icon: CalendarDays },
  { key: 'future', label: 'リスト -未来-', shortLabel: '-未来-', icon: Clock3 },
];

const CATEGORY_TABS: TabItem[] = [
  { key: 'all', label: 'すべて', shortLabel: 'すべて', icon: Shapes },
  { key: '🎮', label: 'ゲーム', shortLabel: 'ゲーム', icon: Gamepad2 },
  { key: '📚', label: 'シナリオ', shortLabel: 'シナリオ', icon: BookOpenText },
];

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getYearOptions(currentYear: number, range = 3): number[] {
  return Array.from({ length: range * 2 + 1 }, (_, index) => currentYear - range + index);
}

function changeYear(displayDate: DisplayDate, newYear: number): DisplayDate {
  return { ...displayDate, year: newYear };
}

function changeMonth(displayDate: DisplayDate, newMonth: number): DisplayDate {
  return { ...displayDate, month: newMonth };
}

function prevMonth(displayDate: DisplayDate): DisplayDate {
  if (displayDate.month === 0) {
    return { year: displayDate.year - 1, month: 11 };
  }

  return { year: displayDate.year, month: displayDate.month - 1 };
}

function nextMonth(displayDate: DisplayDate): DisplayDate {
  if (displayDate.month === 11) {
    return { year: displayDate.year + 1, month: 0 };
  }

  return { year: displayDate.year, month: displayDate.month + 1 };
}

function getBadgeSets(badges: ScheduleBadge[]) {
  return {
    streamOffDays: new Set(badges.filter((badge) => badge.streamOff).map((badge) => badge.date)),
  };
}

function getScheduleGroups(schedules: Event[]) {
  const todayKey = formatDateKey(new Date());
  const eventsByDate: Record<string, Event[]> = {};
  const futureSchedules: Event[] = [];
  const pastSchedules: Event[] = [];

  schedules.forEach((schedule) => {
    if (schedule.contentType === 'real' || schedule.category === '🌏') return;
    if (!schedule.date) return;

    if (!eventsByDate[schedule.date]) {
      eventsByDate[schedule.date] = [];
    }
    eventsByDate[schedule.date].push(schedule);

    if (schedule.date < todayKey) {
      pastSchedules.push(schedule);
    } else {
      futureSchedules.push(schedule);
    }
  });

  return {
    eventsByDate,
    futureSchedules: [...futureSchedules].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')),
    pastSchedules: [...pastSchedules].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
  };
}

type ScheduleCalendarNavigationProps = {
  year: number;
  monthIndex: number;
  yearOptions: number[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onYearChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onMonthChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onToday: () => void;
};

function ScheduleCalendarNavigation({
  year,
  monthIndex,
  yearOptions,
  onPrevMonth,
  onNextMonth,
  onYearChange,
  onMonthChange,
  onToday,
}: ScheduleCalendarNavigationProps) {
  return (
    <div className={calendarStyles.dateNavigationContainer}>
      <button type="button" className={calendarStyles.navButton} onClick={onPrevMonth} aria-label="前月">
        ←
      </button>
      <select value={year} onChange={onYearChange} className={calendarStyles.dateSelector} aria-label="年を選択">
        {yearOptions.map((optionYear) => (
          <option key={optionYear} value={optionYear}>
            {optionYear}年
          </option>
        ))}
      </select>
      <select value={monthIndex} onChange={onMonthChange} className={calendarStyles.dateSelector} aria-label="月を選択">
        {Array.from({ length: 12 }, (_, index) => (
          <option key={index} value={index}>
            {String(index + 1).padStart(2, '0')}月
          </option>
        ))}
      </select>
      <button type="button" className={calendarStyles.navButton} onClick={onNextMonth} aria-label="次月">
        →
      </button>
      <button type="button" className={calendarStyles.todayButton} onClick={onToday} aria-label="今日に戻る">
        今日
      </button>
    </div>
  );
}

// ================================================
// スケジュールページコンポーネント本体
// ================================================
export function SchedulePage() {
  // 現在日時
  const now = new Date();
  // 今日の日付キー（YYYY-MM-DD形式）
  const todayKey = formatDateKey(now);
  // データコンテキストから取得
  const { schedules, loading, badges } = useData();

  // カレンダー表示中の年月
  const [displayDate, setDisplayDate] = useState<DisplayDate>({ year: now.getFullYear(), month: now.getMonth() });
  // モーダルで表示する選択中イベント
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // モーダル表示状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 表示モード（カレンダー/未来リスト/過去リスト）
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  // カテゴリフィルター（リスト表示時のみ使用）
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  // 画面幅判定
  const isNarrowScreen = useIsNarrowScreen();

  // バッジデータの整理
  const { streamOffDays } = getBadgeSets(badges);
  // スケジュールデータの整理
  const { eventsByDate, futureSchedules, pastSchedules } = getScheduleGroups(schedules);

  // カレンダー表示用の年月データ
  const year = displayDate.year;
  const monthIndex = displayDate.month;
  const currentYear = now.getFullYear();
  const yearOptions = getYearOptions(currentYear);
  const handlePrevMonth = () => setDisplayDate(prev => prevMonth(prev));
  const handleNextMonth = () => setDisplayDate(prev => nextMonth(prev));
  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setDisplayDate((prev) => changeYear(prev, parseInt(event.target.value, 10)));
  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) =>
    setDisplayDate((prev) => changeMonth(prev, parseInt(event.target.value, 10)));
  const handleToday = () => {
    setDisplayDate({ year: currentYear, month: now.getMonth() });
  };

  // イベントクリック時のモーダル表示処理
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // データ読み込み中フラグ
  const isLoading = loading.schedules;

  // 画面描画
  return (
    <main className="commonPage">
      <PageHero title="すけじゅーる" className="commonHero commonHero--schedule" />

      {isLoading ? (
        <div className="commonContainer commonContainer--schedule">
          <div className={calendarStyles.calendarCard}>
            {/* 読み込み中メッセージ */}
            <p className={calendarStyles.loadingMessage}>読み込み中...</p>
          </div>
        </div>
      ) : (
        <div className="commonContainer commonContainer--schedule">
          {/* 第一タブ: 表示モード切り替え（カレンダー/リスト） */}
          <TabBar
            tabs={VIEW_MODE_TABS}
            activeTab={viewMode}
            onTabChange={(tabKey) => setViewMode(tabKey as ViewMode)}
            isNarrowScreen={isNarrowScreen}
          />

          {/* 第二タブ: カテゴリフィルター（リスト表示時のみ表示） */}
          {(viewMode === "future" || viewMode === "past") && (
            <TabBar
              variant="secondary"
              spacing="compact"
              tabs={CATEGORY_TABS}
              activeTab={categoryFilter}
              onTabChange={(tabKey) => setCategoryFilter(tabKey as CategoryFilter)}
              isNarrowScreen={isNarrowScreen}
            />
          )}

          <div>
            {/* カレンダー表示 */}
            {viewMode === "calendar" && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  position: 'relative',
                }}
              >
                <header className={calendarStyles.calendarHeader}>
                  <ScheduleCalendarNavigation
                    year={year}
                    monthIndex={monthIndex}
                    yearOptions={yearOptions}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onYearChange={handleYearChange}
                    onMonthChange={handleMonthChange}
                    onToday={handleToday}
                  />
                </header>
                {/* カレンダー本体 */}
                <ScheduleCalendar
                  year={year}
                  monthIndex={monthIndex}
                  todayKey={todayKey}
                  eventsByDate={eventsByDate}
                  onEventClick={handleEventClick}
                  streamOffDays={streamOffDays}
                />
              </div>
            )}

            {/* リスト表示 -未来- */}
            {viewMode === "future" && (
              <ScheduleList
                schedules={futureSchedules}
                categoryFilter={categoryFilter}
                onEventClick={handleEventClick}
              />
            )}

            {/* リスト表示 -過去- */}
            {viewMode === "past" && (
              <ScheduleList
                schedules={pastSchedules}
                categoryFilter={categoryFilter}
                onEventClick={handleEventClick}
              />
            )}
          </div>


        </div>
      )}

      {/* イベント詳細モーダル */}
      <EventDetailModal event={selectedEvent} isOpen={isModalOpen && !!selectedEvent} onClose={handleCloseModal} />
    </main>
  );
}
