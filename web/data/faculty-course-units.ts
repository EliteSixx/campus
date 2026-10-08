import { subjects } from "@/data/curriculum";

// Teaching units for the four subjects in data/curriculum.ts.
//
// The curriculum has topics but no unit or module layer — nothing anywhere in
// data/ or lib/api/ groups topics, so this file adds that grouping and nothing
// else. It invents no topics and renames none: every id below is an existing
// CurriculumTopic id, each appears in exactly one unit, and the unit titles are
// the standard ones for each subject.
//
// IMPORTANT: topic ids are only unique *within* a subject. cs301 has t1–t6 and
// the other three each have t1–t5, so "t3" means different things in different
// courses. Anything resolving a topic must key on (courseId, topicId); the
// helpers at the bottom all do.

export interface Unit {
  id: string;
  courseId: string;
  // Teaching order within the course, starting at 1.
  number: number;
  title: string;
  // CurriculumTopic ids, in the order they are taught.
  topicIds: string[];
}

export const courseUnits: Unit[] = [
  // ---------------------------------------------------------------- cs301
  // Database Management Systems — t1..t6
  {
    id: "cs301-u1",
    courseId: "cs301",
    number: 1,
    title: "Data Models & Database Design",
    topicIds: ["t1", "t5"],
  },
  {
    id: "cs301-u2",
    courseId: "cs301",
    number: 2,
    title: "Relational Query Languages",
    topicIds: ["t2"],
  },
  {
    id: "cs301-u3",
    courseId: "cs301",
    number: 3,
    title: "Storage, Indexing & Query Processing",
    topicIds: ["t6", "t4"],
  },
  {
    id: "cs301-u4",
    courseId: "cs301",
    number: 4,
    title: "Transactions & Concurrency Control",
    topicIds: ["t3"],
  },

  // ---------------------------------------------------------------- cs302
  // Computer Networks — t1..t5
  {
    id: "cs302-u1",
    courseId: "cs302",
    number: 1,
    title: "Network Models & Layered Architecture",
    topicIds: ["t1"],
  },
  {
    id: "cs302-u2",
    courseId: "cs302",
    number: 2,
    title: "Network Layer & Routing",
    topicIds: ["t2"],
  },
  {
    id: "cs302-u3",
    courseId: "cs302",
    number: 3,
    title: "Transport Layer & Congestion Control",
    topicIds: ["t3"],
  },
  {
    id: "cs302-u4",
    courseId: "cs302",
    number: 4,
    title: "Network Security",
    topicIds: ["t4"],
  },
  {
    id: "cs302-u5",
    courseId: "cs302",
    number: 5,
    title: "Legacy Network Technologies",
    topicIds: ["t5"],
  },

  // ---------------------------------------------------------------- cs303
  // Operating Systems — t1..t5. Synchronisation is unit 3 so the numbering
  // agrees with the existing "Unit 3 lab manual (process synchronisation)"
  // announcement in data/faculty-announcements.ts.
  {
    id: "cs303-u1",
    courseId: "cs303",
    number: 1,
    title: "Process Management",
    topicIds: ["t1"],
  },
  {
    id: "cs303-u2",
    courseId: "cs303",
    number: 2,
    title: "Memory Management",
    topicIds: ["t2"],
  },
  {
    id: "cs303-u3",
    courseId: "cs303",
    number: 3,
    title: "Process Synchronization & Deadlocks",
    topicIds: ["t3"],
  },
  {
    id: "cs303-u4",
    courseId: "cs303",
    number: 4,
    title: "File Systems & System Interface",
    topicIds: ["t4", "t5"],
  },

  // ---------------------------------------------------------------- cs304
  // Web Technologies — t1..t5
  {
    id: "cs304-u1",
    courseId: "cs304",
    number: 1,
    title: "Markup & Responsive Layout",
    topicIds: ["t1"],
  },
  {
    id: "cs304-u2",
    courseId: "cs304",
    number: 2,
    title: "Client-side Scripting",
    topicIds: ["t2"],
  },
  {
    id: "cs304-u3",
    courseId: "cs304",
    number: 3,
    title: "Server-side Development",
    topicIds: ["t3"],
  },
  {
    id: "cs304-u4",
    courseId: "cs304",
    number: 4,
    title: "Web Services & APIs",
    topicIds: ["t4", "t5"],
  },
];

export function getUnit(unitId: string) {
  return courseUnits.find((unit) => unit.id === unitId);
}

// Units of one course, in teaching order.
export function unitsForCourse(courseId: string): Unit[] {
  return courseUnits
    .filter((unit) => unit.courseId === courseId)
    .sort((a, b) => a.number - b.number);
}

// The unit a topic belongs to. Both arguments are required because a bare
// topic id is ambiguous across courses.
export function unitForTopic(
  courseId: string,
  topicId: string,
): Unit | undefined {
  return courseUnits.find(
    (unit) => unit.courseId === courseId && unit.topicIds.includes(topicId),
  );
}

// True when every topic of every subject sits in exactly one unit. Exported so
// the shape of this file can be checked rather than assumed.
export function everyTopicIsMappedOnce(): boolean {
  return subjects.every((subject) => {
    const mapped = unitsForCourse(subject.id).flatMap((u) => u.topicIds);
    const unique = new Set(mapped);
    return (
      mapped.length === unique.size &&
      unique.size === subject.topics.length &&
      subject.topics.every((topic) => unique.has(topic.id))
    );
  });
}
