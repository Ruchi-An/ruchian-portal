// ================================================
// ScheduleCommonHeader.tsx - スケジュール共通ヘッダー
// ================================================
// 役割:
// - タイトル行（アイコン・タイトル）
// - サブタイトル（必要な場合のみ）
// ================================================
import React from "react";
import { Star } from 'lucide-react';

interface ScheduleCommonHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const ScheduleCommonHeader: React.FC<ScheduleCommonHeaderProps> = ({ title, subtitle, className }) => (
  <section className={className}>
    <div className="commonTitleRow">
      <Star className="commonTitleIcon" size={28} strokeWidth={2} aria-hidden="true" />
      <h1 className="commonTitle">{title}</h1>
      <Star className="commonTitleIcon" size={28} strokeWidth={2} aria-hidden="true" />
    </div>
    {subtitle && <p className="commonSubtitle">{subtitle}</p>}
  </section>
);
