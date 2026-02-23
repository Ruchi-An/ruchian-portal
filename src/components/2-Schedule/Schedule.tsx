// ================================================
// Schedule.tsx - スケジュールページ（一般ユーザー用）
// ================================================
// 役割:
// - カレンダー表示、過去/未来リスト表示の切り替え
// - イベント詳細モーダルの表示
// - データのフィルタリングと整理
// ================================================

// React・外部フック
import { useState } from "react";
import { useData } from "../../lib/DataContext";
// 共通UIコンポーネント
import { TabBar } from "../common/TabBar";
// Schedule関連コンポーネント
import { EventDetailModal } from "./EventDetailModal"; // イベント詳細モーダルコンポーネント
import { CalendarNavigation } from "./CalendarNavigation";
import { ScheduleCalendar, type Event } from "./ScheduleCalendar";
import { ScheduleList } from "./ScheduleList";
import { ScheduleSidePanel } from "./ScheduleSidePanel";
import { ScheduleCommonHeader } from "./ScheduleCommonHeader";
import { ListDown } from "./ListDown";
// CSSモジュール
import calendarStyles from "./css/ScheduleCalendar.module.css";
// カスタムフック・ユーティリティ
import { getYearOptions, prevMonth, nextMonth, changeYear, changeMonth } from "./lib/calendarUtils";
import { formatDateKey } from "./lib/dateUtils";
import { VIEW_MODE_TABS, CATEGORY_TABS } from "./lib/tabDefs";
import { useBadgeSets } from "./lib/useBadgeSets";
import { useIsNarrowScreen } from "./lib/useIsNarrowScreen";
import { useScheduleGroups } from "./lib/useScheduleGroups";

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
  const [displayDate, setDisplayDate] = useState({ year: now.getFullYear(), month: now.getMonth() });
  // モーダルで表示する選択中イベント
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // モーダル表示状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 表示モード（カレンダー/未来リスト/過去リスト）
  const [viewMode, setViewMode] = useState<"calendar" | "future" | "past">("calendar");
  // カテゴリフィルター（リスト表示時のみ使用）
  const [categoryFilter, setCategoryFilter] = useState<"all" | "🎮" | "📚" | "🌏">("all");
  // 画面幅判定
  const isNarrowScreen = useIsNarrowScreen();
  const isWide = window.innerWidth > 1200;

  // バッジデータの整理
  const { streamOffDays, workOffDays, tentativeDays } = useBadgeSets(badges);
  // スケジュールデータの整理
  const { eventsByDate, futureSchedules, pastSchedules } = useScheduleGroups(schedules);

  // カレンダー表示用の年月データ
  const year = displayDate.year;
  const monthIndex = displayDate.month;
  const currentYear = now.getFullYear();
  const yearOptions = getYearOptions(currentYear);
  const handlePrevMonth = () => setDisplayDate(prev => prevMonth(prev));
  const handleNextMonth = () => setDisplayDate(prev => nextMonth(prev));
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setDisplayDate(prev => changeYear(prev, parseInt(e.target.value, 10)));
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setDisplayDate(prev => changeMonth(prev, parseInt(e.target.value, 10)));

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

  // サイドパネル開閉状態を親で管理
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  // 画面描画
  return (
    <main className="commonPage">
      <ScheduleCommonHeader
        title="SCHEDULE"
        className="commonHero commonHero--schedule"
      />

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
            onTabChange={tabKey => setViewMode(tabKey as "calendar" | "future" | "past")}
            isNarrowScreen={isNarrowScreen}
          />

          {/* 第二タブ: カテゴリフィルター（リスト表示時のみ表示） */}
          {(viewMode === "future" || viewMode === "past") && (
            <TabBar
              variant="secondary"
              spacing="compact"
              tabs={CATEGORY_TABS}
              activeTab={categoryFilter}
              onTabChange={tabKey => setCategoryFilter(tabKey as "all" | "🎮" | "📚" | "🌏")}
              isNarrowScreen={isNarrowScreen}
            />
          )}

          <div>
            {/* カレンダー表示 */}
            {viewMode === "calendar" && (
              <div
                className="calendarWithPanel"
                style={{
                  display: 'flex',
                  flexDirection: isNarrowScreen ? 'column' : 'row',
                  alignItems: 'flex-start',
                  gap: isNarrowScreen ? 0 : 24,
                  width: '100%',
                  position: 'relative',
                }}
              >
                <div style={{ flex: 1, minWidth: 0, position: 'relative', width: '100%' }}>
                  <header className={calendarStyles.calendarHeader}>
                    <CalendarNavigation
                      year={year}
                      monthIndex={monthIndex}
                      yearOptions={yearOptions}
                      onPrevMonth={handlePrevMonth}
                      onNextMonth={handleNextMonth}
                      onYearChange={handleYearChange}
                      onMonthChange={handleMonthChange}
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
                    workOffDays={workOffDays}
                    tentativeDays={tentativeDays}
                  />
                  {/* サイドパネル開くボタンをカレンダーの右上に絶対配置 */}
                  <ScheduleSidePanel
                    schedules={schedules}
                    onEventClick={handleEventClick}
                    panelMode="buttonOnly"
                    open={sidePanelOpen}
                    setOpen={setSidePanelOpen}
                  />
                </div>
                {/* サイドパネル本体（開いているときのみ横に表示） */}
                {sidePanelOpen && (
                  <div style={{ width: isNarrowScreen ? '100%' : undefined }}>
                    <ScheduleSidePanel
                      schedules={schedules}
                      onEventClick={handleEventClick}
                      panelMode="panelOnly"
                      open={sidePanelOpen}
                      setOpen={setSidePanelOpen}
                    />
                  </div>
                )}
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

          {/* 1200px以下で日程未定リストダウンをカレンダー下に表示 */}
          {!isWide && (
            <div style={{ width: '100%', margin: '32px 0 0 0' }}>
              <ListDown
                schedules={schedules}
                onEventClick={handleEventClick}
              />
            </div>
          )}
        </div>
      )}

      {/* イベント詳細モーダル */}
      <EventDetailModal event={selectedEvent!} isOpen={isModalOpen && !!selectedEvent} onClose={handleCloseModal} />
    </main>
  );
}
