import { getFacultyProfile } from "@/lib/api/analytics";
import {
  getAllSubjectAnalyses,
  getCurriculumOverview,
  getSkillDemandCount,
} from "@/lib/api/curriculum";
import { getMyCohort } from "@/lib/api/faculty-students";
import { getStudentsWorkspace } from "@/lib/api/faculty-students-workspace";
import { getTimetableView } from "@/lib/api/timetable";
import { getAssignmentsWithStats } from "@/lib/api/assignments";
import { getPlannerSubjects } from "@/lib/api/lecture-planner";
import {
  getCourseMaterialTree,
  getMaterialCourses,
} from "@/lib/api/faculty-materials";
import {
  getAnnouncements,
  getAnnouncementStats,
  getAudienceLabel,
} from "@/lib/api/faculty-announcements";
import { getConversations } from "@/lib/api/faculty-messages";
import { getProgramsWithImpact } from "@/lib/api/faculty-programs";
import { getSkillById } from "@/data/skills";
import { weekdays } from "@/data/timetable";
import {
  makeTopicKey,
  type DashboardAnnouncementSummary,
  type DashboardAssignmentSummary,
  type DashboardConversationSummary,
  type DashboardMaterialsCoverage,
  type DashboardMissingSkill,
  type DashboardPlannerProgress,
  type DashboardRecommendation,
  type DashboardStudentSkillGap,
  type DashboardSubjectAlignment,
  type DashboardTimetableSlot,
  type FacultyDashboardData,
} from "@/lib/api/faculty-dashboard-meta";

// Server-side collector for the faculty dashboard.
//
// Every figure is taken from the lib/api function that already powers the
// matching faculty page, so the dashboard can never disagree with the page it
// links to. Nothing new is computed here except where a page has no existing
// function (the cohort skill-gap count), and that is called out below.
//
// No clock is read in this file. What counts as "today" or "overdue" is decided
// in the browser.

const RECENT_ANNOUNCEMENTS = 5;
const TOP_MISSING_SKILLS = 3;
const TOP_STUDENT_GAPS = 3;

// A skill score below this is the "To learn" band in lib/api/faculty-roster.ts
// (planStatus) and the danger tone on the faculty student pages. A skill with
// no score at all is null ("Not assessed") on the student pages, but the
// dashboard still counts it as struggling here: nothing has been shown yet.
const STRUGGLING_BELOW = 40;

export async function getFacultyDashboardData(): Promise<FacultyDashboardData> {
  const [
    profile,
    overview,
    analyses,
    cohort,
    timetableView,
    assignments,
    plannerSubjects,
    materialCourses,
    announcements,
    conversations,
    programs,
    studentsWorkspace,
  ] = await Promise.all([
    getFacultyProfile(),
    getCurriculumOverview(),
    getAllSubjectAnalyses(),
    getMyCohort(),
    getTimetableView(),
    getAssignmentsWithStats(),
    getPlannerSubjects(),
    getMaterialCourses(),
    getAnnouncements(),
    getConversations(),
    getProgramsWithImpact(),
    // The same rows the My Students page reads, so the dashboard's "need
    // attention" count always matches that page.
    getStudentsWorkspace(),
  ]);

  const cohortIds = new Set(cohort.students.map((s) => s.id));

  // --- Timetable -----------------------------------------------------------
  // The resolved week from /faculty/timetable, ordered by day then start time.
  const timetable: DashboardTimetableSlot[] = timetableView.slots
    .map((slot) => ({
      id: slot.id,
      day: slot.day,
      startTime: slot.start,
      endTime: slot.end,
      // Only a subject the curriculum really has gets an id, so a link built
      // from it always resolves.
      subjectId: slot.subjectInCurriculum ? slot.subjectId : null,
      subjectCode: slot.subjectCode,
      subjectName: slot.subjectName,
      title: slot.subjectName ?? slot.title ?? slot.type,
      room: slot.room,
      className: slot.section,
      type: slot.type,
    }))
    .sort(
      (a, b) =>
        weekdays.indexOf(a.day) - weekdays.indexOf(b.day) ||
        a.startTime.localeCompare(b.startTime),
    );

  // Sections each subject is timetabled for. Assignments carry no section of
  // their own, so this is where their class name comes from.
  const sectionsBySubject = new Map<string, Set<string>>();
  for (const slot of timetableView.slots) {
    if (!slot.subjectId || !slot.section) continue;
    const sections = sectionsBySubject.get(slot.subjectId) ?? new Set<string>();
    sections.add(slot.section);
    sectionsBySubject.set(slot.subjectId, sections);
  }
  const classNameOf = (subjectId: string): string | null => {
    const sections = sectionsBySubject.get(subjectId);
    return sections && sections.size > 0 ? [...sections].sort().join(", ") : null;
  };

  // --- Assignments ---------------------------------------------------------
  // Same counts as /faculty/assignments: awaiting evaluation is submitted minus
  // evaluated. The list keeps that page's order (published first, then due
  // date). Overdue is not worked out on the server: it depends on today's date,
  // so the browser decides it (see app/faculty/assignments/overdue.ts).
  const assignmentSummaries: DashboardAssignmentSummary[] = assignments.map(
    (a) => ({
      id: a.id,
      title: a.title,
      subjectCode: a.subjectCode,
      className: classNameOf(a.subjectId),
      dueDate: a.dueDate,
      status: a.status,
      totalStudents: a.totalStudents,
      totalSubmissions: a.submittedCount,
      pendingEvaluation: a.submittedCount - a.evaluatedCount,
    }),
  );

  // --- Lecture planner -----------------------------------------------------
  // Delivered topics live only in localStorage, so the base count is 0 and the
  // keys let the client add the browser's progress on top.
  const plannerProgress: DashboardPlannerProgress[] = plannerSubjects.map(
    (subject) => ({
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      coveredTopics: 0,
      totalTopics: subject.topics.length,
      totalHours: subject.totalHours,
      topicKeys: subject.topics.map((t) => makeTopicKey(subject.id, t.id)),
      topics: subject.topics.map((t) => ({
        key: makeTopicKey(subject.id, t.id),
        hours: t.hours,
      })),
    }),
  );

  // --- Materials coverage --------------------------------------------------
  // Built from the same course → unit → topic tree the materials pages use, so
  // every topic is matched on courseId and topicId together. Hidden material
  // counts as well as published, exactly as /faculty/materials counts it; the
  // client adds this browser's uploads on top.
  const trees = await Promise.all(
    materialCourses.map((course) => getCourseMaterialTree(course.id)),
  );
  const materialsCoverage: DashboardMaterialsCoverage[] = trees.flatMap(
    (tree) => {
      if (!tree) return [];
      const topics = tree.units.flatMap((node) => node.topics);
      return [
        {
          courseId: tree.course.id,
          courseCode: tree.course.code,
          courseName: tree.course.name,
          totalTopics: topics.length,
          topicKeys: topics.map((topic) =>
            makeTopicKey(tree.course.id, topic.topicId),
          ),
          topicKeysWithMaterials: topics
            .filter((topic) => topic.materials.length > 0)
            .map((topic) => makeTopicKey(tree.course.id, topic.topicId)),
        },
      ];
    },
  );

  // --- Announcements -------------------------------------------------------
  // Latest five that are not drafts, newest by send time (creation time as the
  // fallback, as the announcements list sorts). Drafts are only counted. Label
  // and read counts come from the same two functions
  // /faculty/announcements/[id] calls.
  const sendTime = (a: (typeof announcements)[number]) =>
    a.publishAt ?? a.createdAt;
  const drafts = announcements.filter((a) => a.status === "draft");
  const latest = announcements
    .filter((a) => a.status !== "draft")
    .sort((a, b) => sendTime(b).localeCompare(sendTime(a)))
    .slice(0, RECENT_ANNOUNCEMENTS);

  const recentAnnouncements: DashboardAnnouncementSummary[] = await Promise.all(
    latest.map(async (announcement) => {
      const [audienceLabel, stats] = await Promise.all([
        getAudienceLabel(announcement.audience),
        getAnnouncementStats(announcement.id),
      ]);
      const summary: DashboardAnnouncementSummary = {
        id: announcement.id,
        title: announcement.title,
        status: announcement.status,
        audienceLabel,
        createdAt: announcement.createdAt,
        publishAt: announcement.publishAt,
        readCount: stats?.readCount ?? 0,
        totalRecipients: stats?.totalRecipients ?? 0,
      };
      return summary;
    }),
  );

  // --- Messages ------------------------------------------------------------
  // getConversations() is already newest first. A thread with no messages has
  // no time to show, so it is left out.
  const conversationSummaries: DashboardConversationSummary[] =
    conversations.flatMap((c) => {
      if (c.lastMessageAt === null) return [];
      const summary: DashboardConversationSummary = {
        id: c.id,
        subject: c.subject,
        isGroup: c.isGroup,
        participantName: c.participantNames.join(", "),
        lastMessagePreview: c.lastMessagePreview,
        lastMessageAt: c.lastMessageAt,
        baseUnreadCount: c.unreadCount,
        unreadMessageIds: c.unreadMessageIds,
      };
      const onlyId = c.participantIds.length === 1 ? c.participantIds[0] : null;
      if (!c.isGroup && onlyId !== null && cohortIds.has(onlyId)) {
        summary.participantStudentId = onlyId;
      }
      return [summary];
    });

  // --- Curriculum alignment ------------------------------------------------
  // Straight from the analyses behind /faculty/subjects.
  const subjectAlignment: DashboardSubjectAlignment[] = analyses.map((a) => ({
    id: a.subject.id,
    code: a.subject.code,
    name: a.subject.name,
    scorePct: a.alignmentScore,
  }));

  const topMissingSkills: DashboardMissingSkill[] = overview.topMissingSkills
    .slice(0, TOP_MISSING_SKILLS)
    .map((s) => ({
      skill: s.name,
      postingsCount: s.demandCount,
      totalPostings: overview.totalPostings,
    }));

  // --- Student skill gaps --------------------------------------------------
  // No existing function counts students per skill, so this is the one count
  // made here: for every skill any cohort student is scored on, how many
  // cohort students score below STRUGGLING_BELOW or have no score. Ties go to
  // the skill more postings ask for, then by name.
  const cohortSize = cohort.students.length;
  const scoredSkillIds = new Set(
    cohort.students.flatMap((s) => s.skills.map((k) => k.skillId)),
  );
  const studentSkillGaps: DashboardStudentSkillGap[] = [...scoredSkillIds]
    .map((skillId) => {
      const struggling = cohort.students.filter((student) => {
        const score = student.skills.find((k) => k.skillId === skillId)?.score;
        return score === undefined || score < STRUGGLING_BELOW;
      }).length;
      return {
        skillId,
        name: getSkillById(skillId)?.name ?? skillId,
        struggling,
        demand: getSkillDemandCount(skillId),
      };
    })
    .filter((row) => row.struggling > 0)
    .sort(
      (a, b) =>
        b.struggling - a.struggling ||
        b.demand - a.demand ||
        a.name.localeCompare(b.name),
    )
    .slice(0, TOP_STUDENT_GAPS)
    .map((row) => ({
      skill: row.name,
      studentsStruggling: row.struggling,
      cohortSize,
    }));

  // --- Recommendation ------------------------------------------------------
  // The top of /faculty/programs, which ranks programmes by how much of the
  // syllabus gap they close. Only offered when it closes at least one gap.
  const best = programs[0];
  const recommendation: DashboardRecommendation | null =
    best && best.gapImpact > 0
      ? {
          id: best.id,
          title: best.title,
          duration: `${best.durationWeeks} week${best.durationWeeks === 1 ? "" : "s"}`,
          outcome: `Closes ${best.gapSkills.length} syllabus ${
            best.gapSkills.length === 1 ? "gap" : "gaps"
          }: ${best.gapSkills.map((s) => s.name).join(", ")}`,
          href: "/faculty/programs",
        }
      : null;

  return {
    faculty: { name: profile.name, department: profile.department },
    stats: {
      subjectsCount: overview.subjectCount,
      cohortStudentsCount: cohortSize,
      curriculumAlignmentPct: overview.overallAlignment,
      topicsWithoutDemandCount: overview.outdatedTopicCount,
    },
    timetable,
    assignments: assignmentSummaries,
    plannerProgress,
    materialsCoverage,
    recentAnnouncements,
    draftAnnouncementsCount: drafts.length,
    conversations: conversationSummaries,
    subjectAlignment,
    totalPostings: overview.totalPostings,
    topMissingSkills,
    studentSkillGaps,
    recommendation,
    attentionStudents: studentsWorkspace.students,
  };
}
