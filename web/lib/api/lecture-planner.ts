import { subjects } from "@/data/curriculum";
import { unitsForCourse } from "@/data/faculty-course-units";
import { timetable, weekdays } from "@/data/timetable";
import { academicCalendar } from "@/data/faculty-academic-calendar";
import { getFacultyProfile } from "@/lib/api/analytics";
import { analyzeSubject, type TopicStatus } from "@/lib/api/curriculum";
import { getCourseMaterialTree } from "@/lib/api/faculty-materials";
import {
  makePlanTopicKey,
  type PlannerCalendar,
  type PlannerClassSlot,
  type PlannerMaterialRef,
  type PlannerSubjectWorkspace,
  type PlannerUnitInfo,
  type PlannerWorkspace,
} from "@/lib/api/lecture-planner-meta";

// Everything the lecture planner needs about the subjects the logged-in
// faculty member teaches, flattened so the client board can work from plain
// data and never pull the curriculum modules into the browser bundle.
//
// No new data: the hours, topics and skill ids all come from the syllabus in
// data/curriculum.ts, and the statuses are the same Foundational /
// Industry-current / Outdated classification the alignment pages already use.

export interface PlannerTopic {
  id: string;
  name: string;
  hours: number;
  status: TopicStatus;
  demandCount: number;
  skillNames: string[];
}

export interface PlannerMissingSkill {
  name: string;
  demandCount: number;
}

export interface PlannerSubject {
  id: string;
  code: string;
  name: string;
  semester: number;
  alignmentScore: number;
  totalHours: number;
  // In syllabus order, which is the order they are taught in.
  topics: PlannerTopic[];
  // The most-demanded skill this syllabus never teaches, for the industry
  // check on the board. null when the syllabus covers everything.
  topMissingSkill: PlannerMissingSkill | null;
  totalPostings: number;
}

export async function getPlannerSubjects(): Promise<PlannerSubject[]> {
  const { department } = await getFacultyProfile();
  const mine = subjects.filter((s) => s.department === department);

  const analyses = await Promise.all(mine.map((s) => analyzeSubject(s.id)));

  return analyses.flatMap((analysis) => {
    if (!analysis) return [];
    const { subject, alignmentScore, topics, missingSkills, totalPostings } =
      analysis;

    return [
      {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        semester: subject.semester,
        alignmentScore,
        totalHours: topics.reduce((sum, t) => sum + t.topic.hours, 0),
        topics: topics.map((t) => ({
          id: t.topic.id,
          name: t.topic.name,
          hours: t.topic.hours,
          status: t.status,
          demandCount: t.demandCount,
          skillNames: t.skillNames,
        })),
        // missingSkills is already sorted most-demanded first.
        topMissingSkill: missingSkills[0]
          ? {
              name: missingSkills[0].name,
              demandCount: missingSkills[0].demandCount,
            }
          : null,
        totalPostings,
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Planner workspace
//
// Everything the lecture-plan designer needs, per subject: the syllabus in
// units and topics, the timetable slots that decide which weekdays carry a
// lecture, the topic-level materials a lecture can link to, and the calendar
// that decides which dates are teaching days. Built on getPlannerSubjects()
// so topics, hours, statuses and the department filter stay identical.
//
// Topics are always identified by `${subjectId}:${topicId}`. No clock is read.

const MISSING_SKILL_LIMIT = 3;

// Returned as a copy, so a caller can never edit the shared seed object.
export async function getAcademicCalendar(): Promise<PlannerCalendar> {
  return {
    ...academicCalendar,
    holidays: academicCalendar.holidays.map((h) => ({ ...h })),
    examPeriods: academicCalendar.examPeriods.map((p) => ({ ...p })),
  };
}

// Lecture and Lab slots for one subject, Monday first, then by start time.
// Office Hours and Meetings carry no subject and are never included.
function classSlotsFor(subjectId: string): PlannerClassSlot[] {
  return timetable
    .flatMap((slot): PlannerClassSlot[] => {
      if (slot.subjectId !== subjectId) return [];
      if (slot.type !== "Lecture" && slot.type !== "Lab") return [];
      return [
        {
          weekday: slot.day,
          start: slot.start,
          end: slot.end,
          room: slot.room,
          section: slot.section,
          type: slot.type,
        },
      ];
    })
    .sort(
      (a, b) =>
        weekdays.indexOf(a.weekday) - weekdays.indexOf(b.weekday) ||
        a.start.localeCompare(b.start),
    );
}

async function buildSubjectWorkspace(
  subject: PlannerSubject,
): Promise<PlannerSubjectWorkspace> {
  const [tree, analysis] = await Promise.all([
    getCourseMaterialTree(subject.id),
    analyzeSubject(subject.id),
  ]);

  // Units, with their topic ids turned into full keys.
  const courseUnits = unitsForCourse(subject.id);
  const units: PlannerUnitInfo[] = courseUnits.map((unit) => ({
    id: unit.id,
    number: unit.number,
    title: unit.title,
    topicKeys: unit.topicIds.map((id) => makePlanTopicKey(subject.id, id)),
  }));
  const unitOfTopic = new Map(
    courseUnits.flatMap((unit) => unit.topicIds.map((id) => [id, unit.id] as const)),
  );

  // Timetable slots and the weekdays lectures fall on.
  const slots = classSlotsFor(subject.id);
  const lectureSlots = slots.filter((s) => s.type === "Lecture");
  const lectureDays = new Set(lectureSlots.map((s) => s.weekday));

  // Topic-level materials only. The tree already matches on course + topic.
  const materials: PlannerMaterialRef[] = (tree?.units ?? []).flatMap((node) =>
    node.topics.flatMap((topic) =>
      topic.materials.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        topicKey: makePlanTopicKey(subject.id, topic.topicId),
        visibility: m.visibility,
      })),
    ),
  );

  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    semester: subject.semester,
    alignmentScore: subject.alignmentScore,
    totalHours: subject.totalHours,
    units,
    topics: subject.topics.map((topic) => ({
      key: makePlanTopicKey(subject.id, topic.id),
      topicId: topic.id,
      name: topic.name,
      hours: topic.hours,
      status: topic.status,
      skillNames: [...topic.skillNames],
      unitId: unitOfTopic.get(topic.id) ?? null,
    })),
    lectureSlots,
    labSlots: slots.filter((s) => s.type === "Lab"),
    lectureWeekdays: weekdays.filter((day) => lectureDays.has(day)),
    materials,
    // missingSkills is already sorted most-demanded first.
    missingSkills: (analysis?.missingSkills ?? [])
      .slice(0, MISSING_SKILL_LIMIT)
      .map((s) => ({ name: s.name, demandCount: s.demandCount })),
    totalPostings: subject.totalPostings,
  };
}

export async function getPlannerWorkspace(): Promise<PlannerWorkspace> {
  const [profile, plannerSubjects, calendar] = await Promise.all([
    getFacultyProfile(),
    getPlannerSubjects(),
    getAcademicCalendar(),
  ]);

  return {
    faculty: { name: profile.name, department: profile.department },
    calendar,
    subjects: await Promise.all(plannerSubjects.map(buildSubjectWorkspace)),
  };
}
