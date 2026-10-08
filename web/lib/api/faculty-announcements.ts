import {
  announcements,
  type Announcement,
  type AnnouncementStatus,
  type Audience,
  type AudienceType,
  type Category,
} from "@/data/faculty-announcements";
import { students, type Student } from "@/data/students";
import { studentRecords } from "@/data/faculty-student-records";
import { studentAcademics } from "@/data/student-academics";
import { getYearLabel } from "@/lib/api/academics";
import { assignments, submissions } from "@/data/assignments";
import { getSubjectById } from "@/data/curriculum";

// Announcements plus the audience maths the faculty pages need, flattened so
// the client works from plain data and never pulls the data modules into the
// browser bundle.
//
// The honest bit about grouping: data/students.ts has no "class", "section" or
// "branch" field. A student carries `department` ("Computer Science"), and
// their year comes from yearOf() below ("3rd Year"), so a class here IS
// department + year, and a department is the department string on its own.
// Course membership is not stored on the student at all, so it is derived —
// see courseStudentIds below.
//
// No clock is read anywhere in this file. Whether an announcement is a draft,
// scheduled or published is stored on the record itself, so the server and the
// client always agree; comparing publishAt against the real time is Part 2's
// job, in the browser.

export interface AnnouncementFilter {
  status?: AnnouncementStatus;
  category?: Category;
  audienceType?: AudienceType;
  search?: string;
}

// id + label + how many students it reaches, for the compose form's pickers.
export interface AudienceOption {
  id: string;
  label: string;
  studentCount: number;
}

export interface StudentOption {
  id: string;
  name: string;
  rollNumber: string | null;
  // "Priya Rao · CSE23B0631", ready to drop into a picker.
  label: string;
}

export interface AudienceOptions {
  classes: AudienceOption[];
  courses: AudienceOption[];
  departments: AudienceOption[];
  students: StudentOption[];
}

export interface AnnouncementRecipient {
  id: string;
  name: string;
  rollNumber: string | null;
}

export interface AnnouncementStats {
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
  readPercent: number;
  readStudents: AnnouncementRecipient[];
  unreadStudents: AnnouncementRecipient[];
}

export interface AnnouncementsOverview {
  published: number;
  scheduled: number;
  drafts: number;
  // Mean read percentage across published announcements, rounded. 0 when
  // nothing is published.
  averageReadPercent: number;
}

// Short forms for the labels. Anything not listed falls back to initials, so a
// new department in the data still gets a sensible code rather than breaking.
const DEPARTMENT_SHORT: Record<string, string> = {
  "Computer Science": "CSE",
  "Information Technology": "IT",
  Electronics: "ECE",
  "Data Science": "DS",
};

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initials(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function shortDepartment(department: string): string {
  return DEPARTMENT_SHORT[department] ?? initials(department);
}

export function departmentId(department: string): string {
  return slug(department);
}

export function classId(department: string, year: string): string {
  return `${slug(department)}-${slug(year)}`;
}

// The year a student is in now. The in-progress semester in
// data/student-academics.ts wins; the static Student.year is only a fallback
// for students with no semester record. Every class is built and matched
// through this, so pickers, recipients and labels always agree.
function yearOf(student: Student): string {
  return getYearLabel(student.id) ?? student.year;
}

function rollNumberOf(studentId: string): string | null {
  return (
    studentRecords.find((r) => r.studentId === studentId)?.rollNumber ?? null
  );
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

// Who takes a subject now. Nothing on the student says so directly, so it is
// taken from the two places the data does record it: the subject being listed
// in the student's in-progress semester in data/student-academics.ts, or a
// submission against one of the subject's assignments. The union of the two
// is the class list.
function courseStudentIds(courseId: string): string[] {
  const fromMarks = studentAcademics
    .filter((academics) =>
      academics.semesters.some(
        (semester) =>
          semester.status === "In Progress" &&
          semester.subjects.some((s) => s.subjectId === courseId),
      ),
    )
    .map((academics) => academics.studentId);

  const courseAssignments = new Set(
    assignments.filter((a) => a.subjectId === courseId).map((a) => a.id),
  );
  const fromSubmissions = submissions
    .filter((s) => courseAssignments.has(s.assignmentId))
    .map((s) => s.studentId);

  return unique([...fromMarks, ...fromSubmissions]);
}

// Every id is checked against the real student list, so a stale id in the seed
// data can never inflate a recipient count.
function knownStudentIds(ids: string[]): string[] {
  const known = new Set(students.map((s) => s.id));
  return unique(ids).filter((id) => known.has(id));
}

export async function resolveRecipients(audience: Audience): Promise<string[]> {
  switch (audience.type) {
    case "class":
      return students
        .filter((s) => classId(s.department, yearOf(s)) === audience.classId)
        .map((s) => s.id);

    case "course":
      return audience.courseId
        ? knownStudentIds(courseStudentIds(audience.courseId))
        : [];

    case "department":
      return students
        .filter((s) => departmentId(s.department) === audience.departmentId)
        .map((s) => s.id);

    case "selected":
    case "individual":
      return knownStudentIds(audience.studentIds ?? []);
  }
}

// "CSE 3rd Year • 3 students". The count is always resolved from the student
// data, never stored alongside the announcement.
export async function getAudienceLabel(audience: Audience): Promise<string> {
  const count = (await resolveRecipients(audience)).length;
  const plural = `${count} student${count === 1 ? "" : "s"}`;

  switch (audience.type) {
    case "class": {
      const match = students.find(
        (s) => classId(s.department, yearOf(s)) === audience.classId,
      );
      const name = match
        ? `${shortDepartment(match.department)} ${yearOf(match)}`
        : (audience.classId ?? "Class");
      return `${name} • ${plural}`;
    }

    case "course": {
      const subject = audience.courseId
        ? getSubjectById(audience.courseId)
        : undefined;
      const name = subject
        ? `${subject.code} ${subject.name}`
        : (audience.courseId ?? "Course");
      return `${name} • ${plural}`;
    }

    case "department": {
      const match = students.find(
        (s) => departmentId(s.department) === audience.departmentId,
      );
      return `${match?.department ?? audience.departmentId ?? "Department"} • ${plural}`;
    }

    case "selected":
      return `${plural} selected`;

    case "individual": {
      const id = audience.studentIds?.[0];
      const student = students.find((s) => s.id === id);
      if (!student) return plural;
      const roll = rollNumberOf(student.id);
      return roll ? `${student.name} • ${roll}` : student.name;
    }
  }
}

// The two helpers below are the client-side twins of resolveRecipients() and
// getAudienceLabel(). They are pure and take the already-resolved option lists
// as an argument rather than reaching into the data modules, so the compose
// form can show a live "will reach N students" count without the browser
// needing the student data — and both sides count the same way, because the
// studentCount on each option came from resolveRecipients() in the first place.

export function countAudience(
  audience: Audience,
  options: AudienceOptions,
): number {
  switch (audience.type) {
    case "class":
      return (
        options.classes.find((c) => c.id === audience.classId)?.studentCount ?? 0
      );
    case "course":
      return (
        options.courses.find((c) => c.id === audience.courseId)?.studentCount ??
        0
      );
    case "department":
      return (
        options.departments.find((d) => d.id === audience.departmentId)
          ?.studentCount ?? 0
      );
    case "selected":
    case "individual": {
      const known = new Set(options.students.map((s) => s.id));
      return new Set((audience.studentIds ?? []).filter((id) => known.has(id)))
        .size;
    }
  }
}

export function audienceLabelFrom(
  audience: Audience,
  options: AudienceOptions,
): string {
  const count = countAudience(audience, options);
  const plural = `${count} student${count === 1 ? "" : "s"}`;

  switch (audience.type) {
    case "class": {
      const option = options.classes.find((c) => c.id === audience.classId);
      return `${option?.label ?? "Class"} • ${plural}`;
    }
    case "course": {
      const option = options.courses.find((c) => c.id === audience.courseId);
      return `${option?.label ?? "Course"} • ${plural}`;
    }
    case "department": {
      const option = options.departments.find(
        (d) => d.id === audience.departmentId,
      );
      return `${option?.label ?? "Department"} • ${plural}`;
    }
    case "selected":
      return `${plural} selected`;
    case "individual": {
      const id = audience.studentIds?.[0];
      const student = options.students.find((s) => s.id === id);
      return student?.label ?? plural;
    }
  }
}

// Pinned first, then newest first. Drafts have no publishAt, so they fall back
// to when they were created — otherwise they would all sort to the bottom
// together regardless of age.
function sortKey(announcement: Announcement): string {
  return announcement.publishAt ?? announcement.createdAt;
}

export async function getAnnouncements(
  filter?: AnnouncementFilter,
): Promise<Announcement[]> {
  const search = filter?.search?.trim().toLowerCase() ?? "";

  return announcements
    .filter((a) => {
      if (filter?.status && a.status !== filter.status) return false;
      if (filter?.category && a.category !== filter.category) return false;
      if (filter?.audienceType && a.audience.type !== filter.audienceType) {
        return false;
      }
      if (search === "") return true;
      return (
        a.title.toLowerCase().includes(search) ||
        a.body.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return sortKey(b).localeCompare(sortKey(a));
    });
}

export async function getAnnouncementById(
  id: string,
): Promise<Announcement | null> {
  return announcements.find((a) => a.id === id) ?? null;
}

export async function getAudienceOptions(): Promise<AudienceOptions> {
  // Classes: every department-and-year pairing that actually has students in
  // it, so the picker can never offer an empty class.
  const classMap = new Map<string, AudienceOption>();
  for (const student of students) {
    const year = yearOf(student);
    const id = classId(student.department, year);
    const entry = classMap.get(id) ?? {
      id,
      label: `${shortDepartment(student.department)} ${year}`,
      studentCount: 0,
    };
    entry.studentCount += 1;
    classMap.set(id, entry);
  }

  const departmentMap = new Map<string, AudienceOption>();
  for (const student of students) {
    const id = departmentId(student.department);
    const entry = departmentMap.get(id) ?? {
      id,
      label: student.department,
      studentCount: 0,
    };
    entry.studentCount += 1;
    departmentMap.set(id, entry);
  }

  // Courses: the subjects this faculty member teaches, from data/curriculum.ts.
  const courseIds = unique(assignments.map((a) => a.subjectId));
  const courses: AudienceOption[] = courseIds.flatMap((id) => {
    const subject = getSubjectById(id);
    if (!subject) return [];
    return [
      {
        id,
        label: `${subject.code} ${subject.name}`,
        studentCount: knownStudentIds(courseStudentIds(id)).length,
      },
    ];
  });

  return {
    classes: [...classMap.values()].sort((a, b) =>
      a.label.localeCompare(b.label),
    ),
    courses: courses.sort((a, b) => a.label.localeCompare(b.label)),
    departments: [...departmentMap.values()].sort((a, b) =>
      a.label.localeCompare(b.label),
    ),
    students: students
      .map((student) => {
        const rollNumber = rollNumberOf(student.id);
        return {
          id: student.id,
          name: student.name,
          rollNumber,
          label: rollNumber ? `${student.name} · ${rollNumber}` : student.name,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function toRecipient(studentId: string): AnnouncementRecipient {
  const student = students.find((s) => s.id === studentId);
  return {
    id: studentId,
    name: student?.name ?? studentId,
    rollNumber: rollNumberOf(studentId),
  };
}

export async function getAnnouncementStats(
  id: string,
): Promise<AnnouncementStats | null> {
  const announcement = announcements.find((a) => a.id === id);
  if (!announcement) return null;

  const recipients = await resolveRecipients(announcement.audience);
  // Intersected on purpose: a read from someone no longer in the audience must
  // not push the read count above the recipient count.
  const readIds = new Set(
    announcement.readBy.filter((studentId) => recipients.includes(studentId)),
  );

  const readStudents = recipients.filter((s) => readIds.has(s)).map(toRecipient);
  const unreadStudents = recipients
    .filter((s) => !readIds.has(s))
    .map(toRecipient);

  return {
    totalRecipients: recipients.length,
    readCount: readStudents.length,
    unreadCount: unreadStudents.length,
    readPercent: recipients.length
      ? Math.round((readStudents.length / recipients.length) * 100)
      : 0,
    readStudents,
    unreadStudents,
  };
}

export async function getAnnouncementsOverview(): Promise<AnnouncementsOverview> {
  const published = announcements.filter((a) => a.status === "published");

  const percents = await Promise.all(
    published.map(async (a) => {
      const recipients = await resolveRecipients(a.audience);
      if (recipients.length === 0) return 0;
      const read = a.readBy.filter((id) => recipients.includes(id)).length;
      return (read / recipients.length) * 100;
    }),
  );

  return {
    published: published.length,
    scheduled: announcements.filter((a) => a.status === "scheduled").length,
    drafts: announcements.filter((a) => a.status === "draft").length,
    averageReadPercent: percents.length
      ? Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length)
      : 0,
  };
}
