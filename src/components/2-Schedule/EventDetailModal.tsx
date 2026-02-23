// src/components/2-Schedule/EventDetailModal.tsx
// ================================================
// EventDetailModal.tsx - イベント詳細モーダルコンポーネント
// ================================================

import type { Event } from "./ScheduleCalendar";
import {
  BookOpen,
  CalendarDays,
  Disc3,
  FileText,
  Folder,
  Gamepad2,
  Link as LinkIcon,
  MonitorPlay,
} from "lucide-react";
import styles from "./css/EventDetailModal.module.css";

// ==================== Props型定義 ====================
type Props = {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
};

// ==================== イベント詳細モーダルコンポーネント ====================
export function EventDetailModal({ event, isOpen, onClose }: Props) {
  if (!isOpen || !event) return null;
  const title = event.label?.trim() || event.title || "-";
  const dateLabel = (() => {
    if (!event.date) return "未定";
    const dateValue = new Date(`${event.date}T00:00:00`);
    const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(dateValue);
    return `${event.date}（${weekday}）`;
  })();
  const dateTimeLabel = event.startTime ? `${dateLabel} ${event.startTime}` : dateLabel;
  const streamLabel = event.isStream ? "有" : "無";
  const genreLabel = event.genre?.trim() || "-";
  const memoLabel = event.memo?.trim() || "-";
  const urlLabel = event.officialUrl?.trim() || "-";
  const roleLabel = event.role || "-";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseButton} onClick={onClose} aria-label="閉じる">
          ✕
        </button>
        <h2 className={styles.modalTitle}>
          <span className={styles.modalTitleText}>{title}</span>
        </h2>
        <div className={styles.modalBody}>
          {(event.contentType === "game" || event.contentType === "scenario") && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <CalendarDays className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>日程:</span>
                </span>
                <span className={styles.modalValue}>{dateTimeLabel}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <Folder className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>ジャンル:</span>
                </span>
                <span className={styles.modalValue}>{genreLabel}</span>
              </div>
            </>
          )}
          {event.contentType === "game" && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <Gamepad2 className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>タイトル:</span>
                </span>
                <span className={styles.modalValue}>
                  {event.title || "-"}
                  {urlLabel !== "-" && (
                    <a
                      className={styles.modalLinkInline}
                      href={urlLabel}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="公式URLを開く"
                    >
                      <LinkIcon className={styles.modalLinkIcon} aria-hidden="true" />
                    </a>
                  )}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <MonitorPlay className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>配信:</span>
                </span>
                <span className={styles.modalValue}>
                  {streamLabel}
                  {event.streamUrl && (
                    <a
                      className={styles.modalLinkInline}
                      href={event.streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="配信URLを開く"
                    >
                      <LinkIcon className={styles.modalLinkIcon} aria-hidden="true" />
                    </a>
                  )}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <FileText className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>メモ:</span>
                </span>
                <span className={styles.modalValue}>{memoLabel}</span>
              </div>
            </>
          )}
          {event.contentType === "scenario" && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <Disc3 className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>ロール:</span>
                </span>
                <span className={styles.modalValue}>{roleLabel}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <BookOpen className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>タイトル:</span>
                </span>
                <span className={styles.modalValue}>
                  {event.title || "-"}
                  {urlLabel !== "-" && (
                    <a
                      className={styles.modalLinkInline}
                      href={urlLabel}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="公式URLを開く"
                    >
                      <LinkIcon className={styles.modalLinkIcon} aria-hidden="true" />
                    </a>
                  )}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <MonitorPlay className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>配信:</span>
                </span>
                <span className={styles.modalValue}>
                  {streamLabel}
                  {event.streamUrl && (
                    <a
                      className={styles.modalLinkInline}
                      href={event.streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="配信URLを開く"
                    >
                      <LinkIcon className={styles.modalLinkIcon} aria-hidden="true" />
                    </a>
                  )}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <FileText className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>メモ:</span>
                </span>
                <span className={styles.modalValue}>{memoLabel}</span>
              </div>
            </>
          )}
          {event.contentType === "real" && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <CalendarDays className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>日程:</span>
                </span>
                <span className={styles.modalValue}>{dateTimeLabel}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <FileText className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>メモ:</span>
                </span>
                <span className={styles.modalValue}>{memoLabel}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}