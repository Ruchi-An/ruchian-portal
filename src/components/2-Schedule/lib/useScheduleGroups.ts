// src/components/2-Schedule/lib/useScheduleGroups.ts
// ==================== スケジュールグループ化フック ====================

import type { Event } from "../ScheduleCalendar";
import { formatDateKey } from "./dateUtils";

export function useScheduleGroups(schedules: Event[]) {
  const todayKey = formatDateKey(new Date());
  const eventsByDate: Record<string, Event[]> = {};
  const futureSchedules: Event[] = [];
  const pastSchedules: Event[] = [];
  const pendingSchedules: Event[] = [];

  schedules.forEach((schedule) => {
    if (!schedule.date || schedule.status === 'pending') {
      pendingSchedules.push(schedule);
      return;
    }

    if (schedule.date) {
      if (schedule.status === 'planned' || schedule.status === 'done') {
        if (!eventsByDate[schedule.date]) {
          eventsByDate[schedule.date] = [];
        }
        eventsByDate[schedule.date].push(schedule);
      }

      if (schedule.date < todayKey) {
        pastSchedules.push(schedule);
      } else {
        futureSchedules.push(schedule);
      }

      return;
    }

    if (schedule.status === 'planned') {
      futureSchedules.push(schedule);
    } else if (schedule.status === 'done') {
      pastSchedules.push(schedule);
    }
  });

  const sortedFuture = [...futureSchedules].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const sortedPast = [...pastSchedules].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  return { eventsByDate, futureSchedules: sortedFuture, pastSchedules: sortedPast, pendingSchedules };
}