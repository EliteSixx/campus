// Announcements the logged-in faculty member has sent, scheduled or drafted.
//
// Audiences are stored as a reference (a class, a course, a department, a
// hand-picked list) rather than a frozen list of student ids, so the recipient
// list is always resolved from the live student data in lib/api. That way a
// student joining a course is reached by an old announcement too.
//
// Every id referenced here is real: student ids come from data/students.ts and
// course ids from data/curriculum.ts. readBy only ever contains students who
// are actually in that announcement's audience.

export type AudienceType =
  | "class" // a year group within a department, e.g. CSE 3rd Year
  | "course" // everyone taking one subject, e.g. cs301
  | "department" // every student in a department
  | "selected" // a hand-picked list of students
  | "individual"; // exactly one student

// Only the field belonging to `type` is filled in. The compose form builds
// this up a piece at a time, which is why the rest stay optional rather than
// this being a discriminated union.
export interface Audience {
  type: AudienceType;
  // For "class": `${department-slug}-${year-slug}`, e.g. "computer-science-3rd-year".
  classId?: string;
  // For "course": a subject id from data/curriculum.ts, e.g. "cs301".
  courseId?: string;
  // For "department": a department slug, e.g. "computer-science".
  departmentId?: string;
  // For "selected" (many) and "individual" (exactly one).
  studentIds?: string[];
}

export type Priority = "normal" | "important" | "urgent";

export type Category = "exam" | "assignment" | "schedule" | "event" | "general";

// Metadata only — there are no real files behind these.
export interface Attachment {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
}

export type AnnouncementStatus = "draft" | "scheduled" | "published";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  priority: Priority;
  category: Category;
  attachments: Attachment[];
  status: AnnouncementStatus;
  createdAt: string;
  // null for drafts, which have no send time chosen yet. For "scheduled" this
  // is in the future relative to REFERENCE_NOW; for "published", the past.
  publishAt: string | null;
  pinned: boolean;
  // Student ids that have opened it. Always a subset of the resolved audience.
  readBy: string[];
}

// The moment the seed data is written around. Everything below is placed
// relative to this, so shifting the demo forward is a matter of moving these
// dates together rather than hunting for "now" in the code.
export const REFERENCE_NOW = "2026-09-16T09:00:00.000Z";

const PDF = "application/pdf";
const XLSX =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const announcements: Announcement[] = [
  {
    id: "an1",
    title: "Mid-semester exam schedule updated",
    body: "The mid-semester timetable has been revised. The Operating Systems paper moves from Tuesday to Thursday, 10:00–12:00, in LT-3. Please check the attached schedule carefully — no further changes will be made. Bring your hall ticket and college ID to every paper.",
    audience: { type: "class", classId: "computer-science-3rd-year" },
    priority: "important",
    category: "exam",
    attachments: [
      {
        id: "att1",
        name: "MidSem_Schedule.pdf",
        sizeBytes: 184320,
        mimeType: PDF,
      },
    ],
    status: "published",
    createdAt: "2026-09-07T11:20:00.000Z",
    publishAt: "2026-09-07T12:00:00.000Z",
    pinned: true,
    readBy: ["s1", "s14"],
  },
  {
    id: "an2",
    title: "Operating Systems: Unit 3 lab manual uploaded",
    body: "The lab manual for Unit 3 (process synchronisation) is attached. Work through exercises 1 to 4 before Tuesday's lab — we will build on them in the session rather than starting from scratch.",
    audience: { type: "course", courseId: "cs303" },
    priority: "normal",
    category: "general",
    attachments: [
      {
        id: "att2",
        name: "Lab_Manual.pdf",
        sizeBytes: 612940,
        mimeType: PDF,
      },
    ],
    status: "published",
    createdAt: "2026-09-09T08:40:00.000Z",
    publishAt: "2026-09-09T09:00:00.000Z",
    pinned: false,
    readBy: ["s1", "s2"],
  },
  {
    id: "an3",
    title: "Deadlock case study due Saturday",
    body: "A reminder that the deadlock detection case study closes at 23:59 on Saturday. Show your working for the Banker's algorithm — answers on their own carry no marks. Late submissions lose 2 marks per day.",
    audience: { type: "course", courseId: "cs303" },
    priority: "important",
    category: "assignment",
    attachments: [],
    status: "published",
    createdAt: "2026-09-11T15:10:00.000Z",
    publishAt: "2026-09-11T15:30:00.000Z",
    pinned: false,
    readBy: ["s2", "s14"],
  },
  {
    id: "an4",
    title: "Department seminar: careers in cloud security",
    body: "The department is hosting a seminar on cloud security careers this Friday at 14:00 in the seminar hall. Two alumni now working in the field will talk about what they actually do day to day and take questions. Open to all years — no registration needed.",
    audience: { type: "department", departmentId: "computer-science" },
    priority: "normal",
    category: "event",
    attachments: [],
    status: "published",
    createdAt: "2026-09-12T10:05:00.000Z",
    publishAt: "2026-09-12T10:30:00.000Z",
    pinned: false,
    readBy: ["s2", "s10"],
  },
  {
    id: "an5",
    title: "Thursday's Computer Networks lecture moved to LT-1",
    body: "Thursday's 11:00 lecture has been moved from LT-5 to LT-1 as LT-5 is being used for an exam. Same time, same day — only the room changes. Please pass this on to anyone who misses it.",
    audience: { type: "course", courseId: "cs302" },
    priority: "urgent",
    category: "schedule",
    attachments: [],
    status: "published",
    createdAt: "2026-09-14T07:45:00.000Z",
    publishAt: "2026-09-14T08:00:00.000Z",
    pinned: false,
    readBy: ["s1", "s2"],
  },
  {
    id: "an6",
    title: "Re-evaluation window opens Monday",
    body: "Applications for re-evaluation of internal marks open on Monday and close the following Friday. Apply through the department office, not by email. You will need your mark sheet and a short written reason for each paper you are querying.",
    audience: { type: "department", departmentId: "computer-science" },
    priority: "important",
    category: "exam",
    attachments: [],
    status: "published",
    createdAt: "2026-09-15T09:15:00.000Z",
    publishAt: "2026-09-15T09:30:00.000Z",
    pinned: true,
    readBy: ["s1", "s2", "s6"],
  },
  {
    id: "an7",
    title: "Web Technologies mini-project — team allocation",
    body: "You three are Team 4 for the mini-project. The brief is attached. Decide among yourselves who takes the front end, the API and the data layer, and send me one line naming each owner by Thursday.",
    audience: { type: "selected", studentIds: ["s6", "s10", "s18"] },
    priority: "normal",
    category: "assignment",
    attachments: [
      {
        id: "att3",
        name: "Project_Brief.pdf",
        sizeBytes: 241664,
        mimeType: PDF,
      },
    ],
    status: "published",
    createdAt: "2026-09-15T16:00:00.000Z",
    publishAt: "2026-09-15T16:20:00.000Z",
    pinned: false,
    readBy: ["s10"],
  },
  {
    id: "an8",
    title: "Attendance shortfall — please come and see me",
    body: "Your attendance in Operating Systems has dropped below the 75% needed to sit the end-semester exam. This is fixable, but not if we leave it. Come to my office hours on Monday between 14:00 and 16:00 and we will work out a plan.",
    audience: { type: "individual", studentIds: ["s14"] },
    priority: "urgent",
    category: "general",
    attachments: [],
    status: "published",
    createdAt: "2026-09-16T06:30:00.000Z",
    publishAt: "2026-09-16T07:00:00.000Z",
    pinned: false,
    readBy: [],
  },
  {
    id: "an9",
    title: "End-semester practical exam slots",
    body: "Practical exam slots for Database Management Systems are attached, along with the seating plan. Slots are allotted by roll number and cannot be swapped. Report fifteen minutes before your slot with your lab record signed and up to date.",
    audience: { type: "course", courseId: "cs301" },
    priority: "important",
    category: "exam",
    attachments: [
      {
        id: "att4",
        name: "Practical_Slots.pdf",
        sizeBytes: 156672,
        mimeType: PDF,
      },
      {
        id: "att5",
        name: "Seating_Plan.xlsx",
        sizeBytes: 38912,
        mimeType: XLSX,
      },
    ],
    status: "scheduled",
    createdAt: "2026-09-15T12:00:00.000Z",
    publishAt: "2026-09-22T04:00:00.000Z",
    pinned: false,
    readBy: [],
  },
  {
    id: "an10",
    title: "Guest lecture: distributed systems in production",
    body: "An engineer from a payments company will talk about what breaks in distributed systems once real traffic arrives, and how it gets found. Thursday, 15:00, seminar hall. Worth attending if you are heading towards backend work.",
    audience: { type: "department", departmentId: "computer-science" },
    priority: "normal",
    category: "event",
    attachments: [],
    status: "scheduled",
    createdAt: "2026-09-16T08:10:00.000Z",
    publishAt: "2026-09-25T05:30:00.000Z",
    pinned: false,
    readBy: [],
  },
  {
    id: "an11",
    title: "Revised lab rubric for Web Technologies",
    body: "Draft: splitting the accessibility criterion into two so it carries the weight it should, and dropping the neatness marks. Needs checking against last year's totals before this goes out.",
    audience: { type: "course", courseId: "cs304" },
    priority: "normal",
    category: "assignment",
    attachments: [],
    status: "draft",
    createdAt: "2026-09-16T08:30:00.000Z",
    publishAt: null,
    pinned: false,
    readBy: [],
  },
  {
    id: "an12",
    title: "Semester feedback form reminder",
    body: "Draft: reminder that the anonymous course feedback form closes at the end of the month. Needs the actual closing date adding before sending.",
    audience: { type: "class", classId: "computer-science-3rd-year" },
    priority: "normal",
    category: "general",
    attachments: [],
    status: "draft",
    createdAt: "2026-09-16T08:45:00.000Z",
    publishAt: null,
    pinned: false,
    readBy: [],
  },
];

export function getAnnouncement(id: string) {
  return announcements.find((a) => a.id === id);
}
