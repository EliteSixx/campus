export type AssignmentStatus = "Draft" | "Published" | "Closed";

export type SubmissionStatus =
  | "Not Submitted"
  | "Submitted"
  | "Late"
  | "Evaluated"
  | "Returned";

export interface RubricCriterion {
  label: string;
  maxMarks: number;
}

export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  submissionFormat: string;
  status: AssignmentStatus;
  attachments: string[];
  rubric: RubricCriterion[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  status: SubmissionStatus;
  submittedOn: string | null;
  fileName: string | null;
  marks: number | null;
  rubricScores: { label: string; awarded: number }[];
  comments: string | null;
  feedback: string | null;
  returnedOn: string | null;
}

export const assignments: Assignment[] = [
  {
    id: "a1",
    subjectId: "cs303",
    title: "Process Scheduling Simulator",
    description:
      "Implement FCFS, SJF and Round Robin schedulers in C. Produce a Gantt chart and compare average waiting time across all three for the given workload.",
    dueDate: "2026-09-05",
    maxMarks: 20,
    submissionFormat: "Source code (.c) + 2-page report (PDF)",
    status: "Closed",
    attachments: ["workload-dataset.txt", "report-template.pdf"],
    rubric: [
      { label: "Correctness of all three algorithms", maxMarks: 8 },
      { label: "Gantt chart and metrics", maxMarks: 5 },
      { label: "Code quality and comments", maxMarks: 4 },
      { label: "Report clarity", maxMarks: 3 },
    ],
  },
  {
    id: "a2",
    subjectId: "cs303",
    title: "Deadlock Detection Case Study",
    description:
      "Given four resource-allocation scenarios, determine whether deadlock occurs and justify using the Banker's algorithm. Submit worked steps, not just answers.",
    dueDate: "2026-09-26",
    maxMarks: 15,
    submissionFormat: "Handwritten or typed PDF",
    status: "Published",
    attachments: ["scenarios.pdf"],
    rubric: [
      { label: "Correct safe-sequence derivation", maxMarks: 7 },
      { label: "Justification and reasoning", maxMarks: 5 },
      { label: "Presentation", maxMarks: 3 },
    ],
  },
  {
    id: "a3",
    subjectId: "cs301",
    title: "Normalization and Schema Design",
    description:
      "Normalise the supplied university schema to 3NF. Show each intermediate stage, identify all functional dependencies, and justify any denormalisation you keep.",
    dueDate: "2026-09-12",
    maxMarks: 25,
    submissionFormat: "PDF with ER diagram + SQL DDL file",
    status: "Closed",
    attachments: ["raw-schema.sql"],
    rubric: [
      { label: "Functional dependency identification", maxMarks: 6 },
      { label: "1NF to 3NF steps", maxMarks: 9 },
      { label: "ER diagram", maxMarks: 5 },
      { label: "SQL DDL correctness", maxMarks: 5 },
    ],
  },
  {
    id: "a4",
    subjectId: "cs302",
    title: "Subnetting and Routing Worksheet",
    description:
      "Plan an address scheme for a five-department campus network, compute subnet masks and usable host ranges, and produce the routing table for the core router.",
    dueDate: "2026-10-09",
    maxMarks: 20,
    submissionFormat: "PDF",
    status: "Published",
    attachments: ["campus-topology.png"],
    rubric: [
      { label: "Address plan and masks", maxMarks: 8 },
      { label: "Usable host ranges", maxMarks: 5 },
      { label: "Routing table", maxMarks: 5 },
      { label: "Neatness", maxMarks: 2 },
    ],
  },
  {
    id: "a5",
    subjectId: "cs304",
    title: "Responsive Portfolio Page",
    description:
      "Build a single-page responsive portfolio using semantic HTML and CSS Grid or Flexbox. No frameworks. Must pass basic accessibility checks and work down to 360px width.",
    dueDate: "2026-10-10",
    maxMarks: 20,
    submissionFormat: "ZIP of source + hosted link",
    status: "Published",
    attachments: ["accessibility-checklist.pdf"],
    rubric: [
      { label: "Semantic HTML", maxMarks: 5 },
      { label: "Responsive layout", maxMarks: 7 },
      { label: "Accessibility", maxMarks: 4 },
      { label: "Code organisation", maxMarks: 4 },
    ],
  },
];

// Only the students taking each subject this semester appear: CS301, CS302 and
// CS303 are semester 5 (s1, s2, s14); CS304 is semester 7 (s6, s10, s18).
// No submission is dated after 2026-09-16, the day the seed data is written
// around, and anything submitted after its due date is marked "Late".
export const submissions: Submission[] = [
  {
    id: "sub1",
    assignmentId: "a1",
    studentId: "s1",
    studentName: "Rudy Sharma",
    status: "Returned",
    submittedOn: "2026-09-05",
    fileName: "s1_a1_submission.pdf",
    marks: 18,
    rubricScores: [
      { label: "Correctness of all three algorithms", awarded: 8 },
      { label: "Gantt chart and metrics", awarded: 4 },
      { label: "Code quality and comments", awarded: 3 },
      { label: "Report clarity", awarded: 3 },
    ],
    comments: "Evaluated against the published rubric.",
    feedback:
      "Strong, well-structured work. Push further on edge cases next time.",
    returnedOn: "2026-09-11",
  },
  {
    id: "sub2",
    assignmentId: "a1",
    studentId: "s2",
    studentName: "Ananya Nair",
    status: "Returned",
    submittedOn: "2026-09-05",
    fileName: "s2_a1_submission.pdf",
    marks: 14,
    rubricScores: [
      { label: "Correctness of all three algorithms", awarded: 6 },
      { label: "Gantt chart and metrics", awarded: 3 },
      { label: "Code quality and comments", awarded: 3 },
      { label: "Report clarity", awarded: 2 },
    ],
    comments: "Evaluated against the published rubric.",
    feedback:
      "The basics are there, but several steps are unexplained. Come to office hours and we'll work through it.",
    returnedOn: "2026-09-11",
  },
  {
    id: "sub5",
    assignmentId: "a1",
    studentId: "s14",
    studentName: "Tanvi Pillai",
    status: "Returned",
    submittedOn: "2026-09-04",
    fileName: "s14_a1_submission.pdf",
    marks: 10,
    rubricScores: [
      { label: "Correctness of all three algorithms", awarded: 4 },
      { label: "Gantt chart and metrics", awarded: 2 },
      { label: "Code quality and comments", awarded: 2 },
      { label: "Report clarity", awarded: 2 },
    ],
    comments: "Evaluated against the published rubric.",
    feedback:
      "The basics are there, but several steps are unexplained. Come to office hours and we'll work through it.",
    returnedOn: "2026-09-11",
  },
  {
    id: "sub7",
    assignmentId: "a2",
    studentId: "s1",
    studentName: "Rudy Sharma",
    status: "Submitted",
    submittedOn: "2026-09-14",
    fileName: "s1_a2_submission.pdf",
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub8",
    assignmentId: "a2",
    studentId: "s2",
    studentName: "Ananya Nair",
    status: "Submitted",
    submittedOn: "2026-09-16",
    fileName: "s2_a2_submission.pdf",
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub11",
    assignmentId: "a2",
    studentId: "s14",
    studentName: "Tanvi Pillai",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub22",
    assignmentId: "a3",
    studentId: "s1",
    studentName: "Rudy Sharma",
    status: "Returned",
    submittedOn: "2026-09-11",
    fileName: "s1_a3_submission.pdf",
    marks: 21,
    rubricScores: [
      { label: "Functional dependency identification", awarded: 5 },
      { label: "1NF to 3NF steps", awarded: 8 },
      { label: "ER diagram", awarded: 4 },
      { label: "SQL DDL correctness", awarded: 4 },
    ],
    comments: "Evaluated against the published rubric.",
    feedback:
      "Strong, well-structured work. Push further on edge cases next time.",
    returnedOn: "2026-09-15",
  },
  {
    id: "sub23",
    assignmentId: "a3",
    studentId: "s2",
    studentName: "Ananya Nair",
    status: "Late",
    submittedOn: "2026-09-14",
    fileName: "s2_a3_submission.pdf",
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub24",
    assignmentId: "a3",
    studentId: "s14",
    studentName: "Tanvi Pillai",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub25",
    assignmentId: "a4",
    studentId: "s1",
    studentName: "Rudy Sharma",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub26",
    assignmentId: "a4",
    studentId: "s2",
    studentName: "Ananya Nair",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub27",
    assignmentId: "a4",
    studentId: "s14",
    studentName: "Tanvi Pillai",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub19",
    assignmentId: "a5",
    studentId: "s6",
    studentName: "Ishita Das",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub20",
    assignmentId: "a5",
    studentId: "s10",
    studentName: "Priya Rao",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
  {
    id: "sub21",
    assignmentId: "a5",
    studentId: "s18",
    studentName: "Simran Chatterjee",
    status: "Not Submitted",
    submittedOn: null,
    fileName: null,
    marks: null,
    rubricScores: [],
    comments: null,
    feedback: null,
    returnedOn: null,
  },
];

export function getAssignment(id: string) {
  return assignments.find((a) => a.id === id);
}

export function submissionsFor(assignmentId: string) {
  return submissions.filter((s) => s.assignmentId === assignmentId);
}
