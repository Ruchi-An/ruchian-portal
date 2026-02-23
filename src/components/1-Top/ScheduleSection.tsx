import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useData } from "../../lib/DataContext";
import type { ScheduleBadge, ScheduleData } from "types/database";

export function ScheduleSection() {
  const sectionStyle = { '--float-delay': '0.1s' } as CSSProperties;
  const { schedules, badges, loading } = useData();

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const todaySchedules = (schedules as ScheduleData[])
    .filter((item: ScheduleData) => item.date === todayKey)
    .filter((item: ScheduleData) => item.status === 'planned' || item.status === 'done')
    .sort((a: ScheduleData, b: ScheduleData) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'));

  const todayBadge = (badges as ScheduleBadge[]).find((badge: ScheduleBadge) => badge.date === todayKey);

  return (
    <section
      className="floatingSection cardSection"
      style={sectionStyle}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div className="sectionLabelRow">
          <span className="sectionLabelIcon">✦</span>
          <span className="sectionLabelText">Schedule</span>
          <span className="sectionLabelIcon">✦</span>
        </div>
        <p className="sectionDescription">
          今日の予定を表示します。
        </p>
        <div className="todayScheduleWrap">
          {loading.schedules ? (
            <p className="todayScheduleEmpty">読み込み中...</p>
          ) : todaySchedules.length === 0 ? (
            <p className="todayScheduleEmpty">本日の予定はありません</p>
          ) : (
            <ul className="todayScheduleList">
              {todaySchedules.map((event: ScheduleData) => (
                <li key={event.id} className="todayScheduleItem">
                  <span className="todayScheduleTime">{event.startTime || '未定'}</span>
                  <span className="todayScheduleTitle">{event.title}</span>
                  <span className="todayScheduleRole">{event.role || '-'}</span>
                  {event.isStream ? (
                    event.streamUrl ? (
                      <a href={event.streamUrl} target="_blank" rel="noopener noreferrer" className="todayScheduleLink">
                        配信
                      </a>
                    ) : (
                      <span className="todayScheduleLink">配信</span>
                    )
                  ) : (
                    <span className="todayScheduleLinkOff">-</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {todayBadge && (
            <div className="todayBadgeRow">
              {todayBadge.workOff && <span className="todayBadge">仕事休み</span>}
              {todayBadge.streamOff && <span className="todayBadge">配信休み</span>}
            </div>
          )}
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/schedule" className="detailButton">
            CALENDAR
          </Link>
        </div>
      </div>
    </section>
  );
}
