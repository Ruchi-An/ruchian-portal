import { useMemo } from 'react';
import styles from './HeroSection.module.css';
import { useData } from '../../lib/DataContext';
import type { ScheduleData } from 'types/database';

type ScheduleItem = ScheduleData;

function formatTodayKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTimeCategory(timeStr: string | null | undefined): 'morning' | 'afternoon' | 'evening' | 'late-night' | 'undefined' {
  if (!timeStr || timeStr === '未定') return 'undefined';
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 'undefined';
  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  if (hour >= 24 && hour < 30) return 'late-night';
  return 'undefined';
}

export default function HeroSection() {
  const { schedules, loading } = useData();

  // 今日のスケジュールをフィルタリング
  const todaySchedules = useMemo(() => {
    const todayKey = formatTodayKey(new Date());
    return schedules
      .filter((schedule: ScheduleItem) => schedule.date === todayKey)
      .filter((schedule: ScheduleItem) => schedule.status === 'planned' || schedule.status === 'done')
      .sort((a: ScheduleItem, b: ScheduleItem) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [schedules]);

  const getDisplays = (it: ScheduleItem) => {
    const startLabel = it.startTime || '未定';
    const timeDisplay = it.endTime ? `${startLabel}-${it.endTime}` : startLabel;
    const categoryDisplay = it.category || '';
    const titleDisplay = categoryDisplay ? `${categoryDisplay} ${it.title}` : it.title;
    return { timeDisplay, titleDisplay };
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroImageWrap}>
        <img
          src="/サムネ-準備中.png"
          alt="トップページサムネイル"
          className={styles.topHeroImage}
        />

        <div className={styles.overlay}>
          <div className={styles.scheduleLabel}>
            <span className={styles.scheduleIcon}>✦</span>
            <span className={styles.scheduleLabelText}>Today's Schedule</span>
            <span className={styles.scheduleIcon}>✦</span>
          </div>

          <div className={styles.scheduleCard}>
            {loading.schedules ? (
              <div className={styles.emptyState}>読み込み中...</div>
            ) : todaySchedules.length === 0 ? (
              <div className={styles.emptyState}>本日の予定はありません</div>
            ) : (
              <ul className={styles.scheduleList}>
                {todaySchedules.map((it: ScheduleItem) => {
                  const { timeDisplay, titleDisplay } = getDisplays(it);
                  const timeCategory = getTimeCategory(it.startTime);
                  return (
                    <li key={it.id} className={styles.scheduleItem}>
                      <div className={styles.itemBody}>
                        <div className={`${styles.itemTime} ${styles[`time-${timeCategory}`]}`}>{timeDisplay}</div>
                        <div className={styles.itemTitle}>{titleDisplay}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
