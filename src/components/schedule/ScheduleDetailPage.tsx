import { useMemo, useState } from 'react';
import { BookOpenText, ChevronLeft, ChevronRight, Gamepad2, Link, Undo2, Video } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { ScheduleData } from 'types/database';
import { useData } from '../../lib/DataContext';
import { PageHero } from '../common/PageHero';
import styles from './css/ScheduleDetailPage.module.css';

type ViewMode = 'calendar' | 'future' | 'past';
type CategoryFilter = 'all' | '🎮' | '📚';

function formatDateTime(date?: string | null, startTime?: string | null): string {
  const dateLabel = (() => {
    if (!date) return '未定';
    const dateValue = new Date(`${date}T00:00:00`);
    const weekday = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(dateValue);
    return `${date}（${weekday}）`;
  })();

  const timeLabel = startTime || '未定';
  if (!date && !startTime) return '未定';
  if (!date) return timeLabel;
  return `${dateLabel} ${timeLabel}`;
}

function formatTitle(schedule: ScheduleData): string {
  const baseTitle = schedule.honmyo?.trim() || schedule.title?.trim() || schedule.label?.trim() || '-';
  return schedule.contentType === 'scenario' ? `『${baseTitle}』` : baseTitle;
}

function formatGenre(schedule: ScheduleData): string {
  const icon = schedule.icon?.trim();
  const label = schedule.label?.trim();

  if (icon && label) return `${icon}${label}`;
  if (label) return label;
  if (icon) return icon;

  return schedule.genre?.trim() || schedule.gameSystem?.trim() || '-';
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStartMinutes(timeStr: string | null | undefined): number {
  if (!timeStr || timeStr === '未定') return Number.POSITIVE_INFINITY;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  return hour * 60 + minute;
}

function matchesCategoryFilter(schedule: ScheduleData, categoryFilter: CategoryFilter): boolean {
  if (categoryFilter === 'all') return true;
  return schedule.category === categoryFilter;
}

function compareScheduleOrder(a: ScheduleData, b: ScheduleData, viewMode: ViewMode): number {
  const dateA = a.date ?? '';
  const dateB = b.date ?? '';
  const dateResult = viewMode === 'past' ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB);
  if (dateResult !== 0) return dateResult;
  return getStartMinutes(a.startTime) - getStartMinutes(b.startTime);
}

function splitMemberNames(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[\n,、，/／]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { schedules, loading } = useData();
  const [showImageModal, setShowImageModal] = useState(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const viewModeParam = params.get('view');
  const categoryParam = params.get('category');
  const viewMode: ViewMode = viewModeParam === 'future' || viewModeParam === 'past' || viewModeParam === 'calendar'
    ? viewModeParam
    : 'calendar';
  const categoryFilter: CategoryFilter = categoryParam === '🎮' || categoryParam === '📚' ? categoryParam : 'all';
  const todayKey = formatDateKey(new Date());

  const schedule = useMemo<ScheduleData | null>(() => {
    if (!id || loading.schedules) return null;
    return schedules.find((item) => item.id === id) ?? null;
  }, [id, loading.schedules, schedules]);

  const navigableSchedules = useMemo(() => {
    return schedules
      .filter((item) => item.contentType !== 'real' && item.category !== '🌏')
      .filter((item) => Boolean(item.date))
      .filter((item) => matchesCategoryFilter(item, categoryFilter))
      .filter((item) => {
        if (!item.date) return false;
        if (viewMode === 'past') return item.date < todayKey;
        if (viewMode === 'future') return item.date >= todayKey;
        return true;
      })
      .sort((a, b) => compareScheduleOrder(a, b, viewMode));
  }, [categoryFilter, schedules, todayKey, viewMode]);

  const currentIndex = useMemo(() => {
    if (!schedule) return -1;
    return navigableSchedules.findIndex((item) => item.id === schedule.id);
  }, [navigableSchedules, schedule]);

  const previousSchedule = currentIndex > 0 ? navigableSchedules[currentIndex - 1] : null;
  const nextSchedule = currentIndex >= 0 && currentIndex < navigableSchedules.length - 1
    ? navigableSchedules[currentIndex + 1]
    : null;

  const backTarget = location.search ? `/schedule${location.search}` : '/schedule';
  const title = schedule ? formatTitle(schedule) : '-';
  const baseMembers = schedule?.members?.filter(Boolean) ?? [];
  const isScenario = schedule?.contentType === 'scenario';
  const isPassedScenario = Boolean(
    isScenario
    && schedule
    && (schedule.status === 'done' || (schedule.date ? schedule.date < todayKey : false)),
  );
  const members = useMemo(() => {
    if (!schedule) return [];
    if (schedule.contentType !== 'scenario') return baseMembers;

    const gmstMembers = splitMemberNames(schedule.gmstName);
    return Array.from(new Set([...gmstMembers, ...baseMembers]));
  }, [baseMembers, schedule]);
  const hasMembers = members.length > 0;
  const scenarioDetailTarget = useMemo(() => {
    if (!schedule || schedule.contentType !== 'scenario' || !schedule.contentId) return null;
    const tab = isPassedScenario ? 'passed' : 'planned';
    const scenarioDetailId = `${schedule.id}:${schedule.contentId}`;
    return `/scenario/detail/${encodeURIComponent(scenarioDetailId)}?tab=${tab}`;
  }, [isPassedScenario, schedule]);
  const displayImage = useMemo(() => {
    if (!schedule) return null;
    return schedule.thumbnailImage ?? null;
  }, [schedule]);
  const titleIcon = schedule?.contentType === 'game' ? Gamepad2 : BookOpenText;
  const TitleIcon = titleIcon;
  const handleMoveSchedule = (scheduleId: string | null) => {
    if (!scheduleId) return;
    navigate(`/schedule/detail/${encodeURIComponent(scheduleId)}${location.search}`);
  };

  if (loading.schedules) {
    return (
      <main className="commonPage">
        <div className="commonContainer" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <p>読み込み中...</p>
        </div>
      </main>
    );
  }

  if (!schedule) {
    return (
      <main className="commonPage">
        <div className="commonContainer" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <p>予定が見つかりませんでした。</p>
          <button type="button" onClick={() => navigate(backTarget)} className={styles.backButton}>
            <Undo2 size={18} aria-hidden="true" />
            スケジュール一覧に戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="commonPage">
      <PageHero title="よてい詳細" className="commonHero commonHero--schedule" />

      <div className="commonContainer commonContainer--schedule" style={{ paddingBottom: '40px' }}>
        <button type="button" onClick={() => navigate(backTarget)} className={styles.backButton}>
          <Undo2 size={18} aria-hidden="true" />
          一覧に戻る
        </button>

        <div className={styles.navigationRow}>
          <button
            type="button"
            className={`${styles.navigationButton} ${styles.navigationButtonPrev} ${!previousSchedule ? styles.navigationButtonDisabled : ''}`}
            onClick={() => handleMoveSchedule(previousSchedule?.id ?? null)}
            disabled={!previousSchedule}
          >
            <ChevronLeft size={18} aria-hidden="true" />
            前のよてい
          </button>
          <button
            type="button"
            className={`${styles.navigationButton} ${styles.navigationButtonNext} ${!nextSchedule ? styles.navigationButtonDisabled : ''}`}
            onClick={() => handleMoveSchedule(nextSchedule?.id ?? null)}
            disabled={!nextSchedule}
          >
            次のよてい
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>
                  <TitleIcon size={20} aria-hidden="true" className={styles.titleIcon} />
                  <span>{title}</span>
                </h2>
              </div>
              <div className={styles.headerActions}>
                {schedule.officialUrl ? (
                  <a
                    href={schedule.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.iconLinkButton}
                    aria-label="コンテンツURLを開く"
                    title="コンテンツURL"
                  >
                    <Link size={17} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className={`${styles.iconLinkButton} ${styles.iconLinkButtonDisabled}`}
                    aria-label="コンテンツURL未設定"
                    title="コンテンツURL未設定"
                  >
                    <Link size={17} aria-hidden="true" />
                  </span>
                )}
                {schedule.streamUrl ? (
                  <a
                    href={schedule.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.iconLinkButton}
                    aria-label="配信URLを開く"
                    title="配信URL"
                  >
                    <Video size={17} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className={`${styles.iconLinkButton} ${styles.iconLinkButtonDisabled}`}
                    aria-label="配信URL未設定"
                    title="配信URL未設定"
                  >
                    <Video size={17} aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>

            {scenarioDetailTarget && (
              <button
                type="button"
                onClick={() => navigate(scenarioDetailTarget)}
                className={styles.scenarioDetailButton}
              >
                しなりお詳細を見る
              </button>
            )}
          </div>

          <div className={styles.cardImage} onClick={() => displayImage && setShowImageModal(true)}>
            {displayImage ? (
              <img src={displayImage} alt={title} />
            ) : (
              <div className={styles.imagePlaceholder}>画像なし</div>
            )}
          </div>

          <div className={styles.cardContent}>
            <div className={styles.column}>
              <div className={styles.infoItem}>
                <span className={styles.label}>日程：</span>
                <span className={styles.value}>{formatDateTime(schedule.date, schedule.startTime)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>ジャンル：</span>
                <span className={styles.value}>{formatGenre(schedule)}</span>
              </div>

              <div className={styles.notesSection}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>メモ：</span>
                  <p className={styles.notes}>{schedule.memo?.trim() || '-'}</p>
                </div>
              </div>

              <div className={styles.sectionDivider} aria-hidden="true" />

              <div className={`${styles.infoItem} ${styles.infoItemWide}`}>
                <span className={styles.label}>メンバー：</span>
                {hasMembers ? (
                  <div className={styles.tagList}>
                    {members.map((member, index) => (
                      <span key={`${member}-${index}`} className={styles.memberTag}>
                        {member}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.value}>-</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && displayImage && (
        <div className={styles.imageModal} onClick={() => setShowImageModal(false)}>
          <img
            src={displayImage}
            alt={title}
            className={styles.imageModalContent}
          />
        </div>
      )}
    </main>
  );
}