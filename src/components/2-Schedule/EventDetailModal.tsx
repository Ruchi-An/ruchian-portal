// src/components/2-Schedule/EventDetailModal.tsx
// ================================================
// EventDetailModal.tsx - イベント詳細モーダルコンポーネント
// ================================================

import { useLayoutEffect, useRef } from "react";
import type { Event } from "./ScheduleCalendar";
import {
  BookOpenText,
  CalendarDays,
  Disc3,
  FileText,
  Folder,
  Gamepad2,
  Globe,
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
  const titleTextRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!isOpen || !event) return;

    const fitTitle = () => {
      const titleElement = titleTextRef.current;
      if (!titleElement) return;

      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      let fontSize = isMobile ? 22 : 28;
      const minFontSize = isMobile ? 9 : 12;

      titleElement.style.fontSize = `${fontSize}px`;

      while (titleElement.scrollWidth > titleElement.clientWidth && fontSize > minFontSize) {
        fontSize -= 1;
        titleElement.style.fontSize = `${fontSize}px`;
      }
    };

    const rafId = requestAnimationFrame(fitTitle);
    window.addEventListener("resize", fitTitle);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", fitTitle);
    };
  }, [isOpen, event?.contentType, event?.title, event?.label]);

  if (!isOpen || !event) return null;
  const title = event.title?.trim() || event.label?.trim() || "-";
  const label = event.label?.trim() || event.title?.trim() || "-";
  const isGame = event.contentType === "game";
  const isScenario = event.contentType === "scenario";
  const isReal = event.contentType === "real";

  const headerIcon = isGame ? Gamepad2 : isScenario ? BookOpenText : Globe;
  const headerTitle = isScenario ? `『${title}』` : isReal ? label : title;

  const dateLabel = (() => {
    if (!event.date) return "未定";
    const dateValue = new Date(`${event.date}T00:00:00`);
    const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(dateValue);
    return `${event.date}（${weekday}）`;
  })();
  const timeLabel = event.startTime || "未定";
  const dateTimeLabel = `${dateLabel} ${timeLabel}`;
  const streamLabel = event.isStream ? "あり" : "なし";
  const genreLabel = event.genre?.trim() || "-";
  const memoLabel = event.memo?.trim() || "-";
  const urlLabel = event.officialUrl?.trim() || "-";
  const roleLabel = event.role || "-";
  const HeaderIcon = headerIcon;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalCloseButton} onClick={onClose} aria-label="閉じる">
          ✕
        </button>
        <h2 className={styles.modalTitle}>
          <HeaderIcon className={styles.modalHeaderIcon} aria-hidden="true" />
          <span ref={titleTextRef} className={styles.modalTitleText}>{headerTitle}</span>
          <span className={styles.modalTitleRight}>
            {!isReal && urlLabel !== "-" && (
              <a
                className={styles.modalTitleLink}
                href={urlLabel}
                target="_blank"
                rel="noreferrer"
                aria-label="公式URLを開く"
              >
                <LinkIcon className={styles.modalTitleIcon} aria-hidden="true" />
              </a>
            )}
          </span>
        </h2>
        <div className={styles.modalBody}>
          {(isGame || isScenario || isReal) && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <CalendarDays className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>日程</span>
                </span>
                <span className={styles.modalValue}>{dateTimeLabel}</span>
              </div>
            </>
          )}
          {isGame && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <Folder className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>ジャンル</span>
                </span>
                <span className={styles.modalValue}>{genreLabel}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <MonitorPlay className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>配信</span>
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
                  <span>メモ</span>
                </span>
                <span className={styles.modalValue}>{memoLabel}</span>
              </div>
            </>
          )}
          {isScenario && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <Folder className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>ジャンル</span>
                </span>
                <span className={styles.modalValue}>{genreLabel}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <Disc3 className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>ロール</span>
                </span>
                <span className={styles.modalValue}>{roleLabel}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <MonitorPlay className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>配信</span>
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
                  <span>メモ</span>
                </span>
                <span className={styles.modalValue}>{memoLabel}</span>
              </div>
            </>
          )}
          {isReal && (
            <>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>
                  <FileText className={styles.modalLabelIcon} aria-hidden="true" />
                  <span>メモ</span>
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