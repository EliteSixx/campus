"use client";

import { useMemo } from "react";
import {
  getPercent,
  getTodaySlots,
  makeTopicKey,
  timeToMinutes,
  getMinutesFromDate,
  type FacultyDashboardData,
} from "@/lib/api/faculty-dashboard-meta";
import { needsAttention } from "@/lib/api/faculty-students-meta";
import { useDashboardLocalData } from "./useDashboardLocalData";
import {
  addDaysISO,
  effectiveStatusOf,
  isTeachingSlot,
  isoDateInZone,
  type AnnouncementRow,
  type AttentionAssignment,
  type CoverageRow,
  type MessageRow,
  type PlannerRow,
} from "./utils";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStatCards, type ClassesToday } from "./DashboardStatCards";
import { TodaySchedule } from "./TodaySchedule";
import { NeedsAttention } from "./NeedsAttention";
import { PlannerProgressCard } from "./PlannerProgressCard";
import { MaterialsCoverageCard } from "./MaterialsCoverageCard";
import { RecentAnnouncements } from "./RecentAnnouncements";
import { RecentMessages } from "./RecentMessages";

// Rows 1–5 of the dashboard: everything that changes with this browser's
// storage or the clock. The hook is called once here; each card below gets
// plain props and calls no hooks of its own.
//
// Every merge follows the page the card links to, so the dashboard and that
// page always show the same number.

export type FacultyDashboardClientData = Pick<
  FacultyDashboardData,
  | "faculty"
  | "stats"
  | "timetable"
  | "assignments"
  | "plannerProgress"
  | "materialsCoverage"
  | "recentAnnouncements"
  | "draftAnnouncementsCount"
  | "conversations"
  | "attentionStudents"
>;

const RECENT_LIMIT = 3;
const DUE_SOON_DAYS = 7;

export function FacultyDashboardClient({
  data,
}: {
  data: FacultyDashboardClientData;
}) {
  const local = useDashboardLocalData();
  const { now } = local;
  const nowISO = now ? now.toISOString() : null;
  const todayIST = now ? isoDateInZone(now) : null;

  // --- Messages: seed unread ids minus what this browser marked read, the
  // same subtraction MessagesClient makes.
  const messageRows = useMemo<MessageRow[]>(() => {
    const read = new Set(local.readIds);
    return data.conversations.map((c) => ({
      id: c.id,
      participantName: c.participantName,
      participantStudentId: c.participantStudentId,
      isGroup: c.isGroup,
      subject: c.subject,
      preview: c.lastMessagePreview,
      lastMessageAt: c.lastMessageAt,
      unreadCount: local.loaded
        ? c.unreadMessageIds.filter((id) => !read.has(id)).length
        : c.baseUnreadCount,
    }));
  }, [data.conversations, local.readIds, local.loaded]);

  const unreadMessages = messageRows.reduce((sum, r) => sum + r.unreadCount, 0);

  // --- Planner: delivered hours over total hours, as the planner board shows.
  const plannerRows = useMemo<PlannerRow[]>(() => {
    const delivered = new Set(local.deliveredKeys);
    return data.plannerProgress.map((subject) => {
      const done = subject.topics.filter((t) => delivered.has(t.key));
      const hours = done.reduce((sum, t) => sum + t.hours, 0);
      return {
        subjectId: subject.subjectId,
        code: subject.subjectCode,
        name: subject.subjectName,
        deliveredTopics: done.length,
        totalTopics: subject.totalTopics,
        hoursPct: getPercent(hours, subject.totalHours),
      };
    });
  }, [data.plannerProgress, local.deliveredKeys]);

  // --- Materials: seed coverage plus local uploads, keyed on course + topic
  // and counted only for topics the course really has.
  const coverageRows = useMemo<CoverageRow[]>(() => {
    return data.materialsCoverage.map((course) => {
      const covered = new Set(course.topicKeysWithMaterials);
      for (const m of local.localMaterials) {
        if (m.courseId === course.courseId && m.topicId !== null) {
          covered.add(makeTopicKey(m.courseId, m.topicId));
        }
      }
      const coveredTopics = course.topicKeys.filter((k) => covered.has(k)).length;
      return {
        courseId: course.courseId,
        code: course.courseCode,
        name: course.courseName,
        coveredTopics,
        totalTopics: course.topicKeys.length,
        pct: getPercent(coveredTopics, course.topicKeys.length),
      };
    });
  }, [data.materialsCoverage, local.localMaterials]);

  const topicsWithoutMaterials = coverageRows.reduce(
    (sum, r) => sum + (r.totalTopics - r.coveredTopics),
    0,
  );

  // --- Announcements: server list plus local non-drafts, newest first.
  const announcementRows = useMemo<AnnouncementRow[]>(() => {
    const server: AnnouncementRow[] = data.recentAnnouncements.map((a) => ({
      id: a.id,
      title: a.title,
      status: effectiveStatusOf(a, nowISO),
      audienceLabel: a.audienceLabel,
      at: a.publishAt ?? a.createdAt,
      readCount: a.readCount,
      totalRecipients: a.totalRecipients,
      isLocal: false,
    }));
    const locals: AnnouncementRow[] = local.localAnnouncements
      .filter((a) => a.status !== "draft")
      .map((a) => ({
        id: a.id,
        title: a.title,
        status: effectiveStatusOf(a, nowISO),
        audienceLabel: a.audienceLabel,
        at: a.publishAt ?? a.createdAt,
        // Nothing created in this browser has been read by anyone.
        readCount: 0,
        totalRecipients: a.recipientCount,
        isLocal: true,
      }));
    return [...server, ...locals]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, RECENT_LIMIT);
  }, [data.recentAnnouncements, local.localAnnouncements, nowISO]);

  const draftsCount =
    data.draftAnnouncementsCount +
    local.localAnnouncements.filter((a) => a.status === "draft").length;

  // --- Assignments: the server's awaiting-evaluation figures, as
  // /faculty/assignments totals them.
  const pendingEvaluation = data.assignments.reduce(
    (sum, a) => sum + a.pendingEvaluation,
    0,
  );

  const toEvaluate = useMemo<AttentionAssignment[]>(
    () =>
      data.assignments
        .filter((a) => a.pendingEvaluation > 0)
        .sort((a, b) => b.pendingEvaluation - a.pendingEvaluation)
        .map(toAttention),
    [data.assignments],
  );

  // Published and due between today and a week from today, inclusive. Plain
  // string comparison is correct for YYYY-MM-DD.
  const dueSoon = useMemo<AttentionAssignment[]>(() => {
    if (todayIST === null) return [];
    const last = addDaysISO(todayIST, DUE_SOON_DAYS);
    return data.assignments
      .filter(
        (a) =>
          a.status === "Published" && a.dueDate >= todayIST && a.dueDate <= last,
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .map(toAttention);
  }, [data.assignments, todayIST]);

  // --- Students: the same rule and rows as the My Students page, so the two
  // counts always match. null until the clock is known.
  const attentionCount = useMemo<number | null>(
    () =>
      todayIST === null
        ? null
        : data.attentionStudents.filter((row) => needsAttention(row, todayIST))
            .length,
    [data.attentionStudents, todayIST],
  );

  // --- Classes today: Lecture and Lab only; null until the clock is known.
  const classesToday = useMemo<ClassesToday | null>(() => {
    if (now === null) return null;
    const teaching = getTodaySlots(data.timetable, now).filter(isTeachingSlot);
    const minutes = getMinutesFromDate(now);
    const next =
      minutes === null
        ? null
        : (teaching.find((s) => timeToMinutes(s.startTime) > minutes) ?? null);
    return { count: teaching.length, next };
  }, [data.timetable, now]);

  return (
    <>
      <DashboardHeader faculty={data.faculty} now={now} />

      <DashboardStatCards
        classesToday={classesToday}
        unreadMessages={unreadMessages}
        pendingEvaluation={pendingEvaluation}
        alignmentPct={data.stats.curriculumAlignmentPct}
        subjectsCount={data.stats.subjectsCount}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TodaySchedule slots={data.timetable} now={now} />
        <NeedsAttention
          attentionCount={attentionCount}
          unreadMessages={unreadMessages}
          toEvaluate={toEvaluate}
          dueSoon={dueSoon}
          todayIST={todayIST}
          draftsCount={draftsCount}
          topicsWithoutMaterials={topicsWithoutMaterials}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PlannerProgressCard rows={plannerRows} />
        <MaterialsCoverageCard rows={coverageRows} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentAnnouncements rows={announcementRows} />
        <RecentMessages rows={messageRows.slice(0, RECENT_LIMIT)} />
      </div>
    </>
  );
}

function toAttention(
  a: FacultyDashboardData["assignments"][number],
): AttentionAssignment {
  return {
    id: a.id,
    title: a.title,
    subjectCode: a.subjectCode,
    pendingEvaluation: a.pendingEvaluation,
    dueDate: a.dueDate,
  };
}
