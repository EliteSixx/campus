// Course materials the logged-in faculty member has uploaded, for the four
// subjects in data/curriculum.ts.
//
// This file deliberately imports nothing: it is pure seed data plus its own
// types, which keeps it cheap to pull in and lets it be compiled and checked on
// its own. Ids referenced here are real — courseId from data/curriculum.ts,
// unitId from data/faculty-course-units.ts, topicId a CurriculumTopic id.
//
// Topic ids are only unique within a course, so a topicId here is meaningless
// without its courseId. Every topic-level entry below carries both, plus the
// unitId of the unit that topic belongs to.
//
// Nothing is uploaded anywhere: files are described by name, size and type
// only, and no file content exists.

export type MaterialType =
  | "pdf"
  | "ppt"
  | "notes"
  | "pyq"
  | "link"
  | "video"
  | "lab-manual"
  | "question-bank";

// Every type, in the order a picker should offer them.
export const MATERIAL_TYPES: MaterialType[] = [
  "pdf",
  "ppt",
  "notes",
  "pyq",
  "lab-manual",
  "question-bank",
  "link",
  "video",
];

// Where a material is pinned: to the whole course, to one unit, or to one topic.
export type MaterialLevel = "course" | "unit" | "topic";

// Metadata only — there is no file behind this.
export interface MaterialFile {
  name: string;
  sizeBytes: number;
  mimeType: string;
}

// "hidden" means saved but not yet shown to students.
export type MaterialVisibility = "published" | "hidden";

export type ExamType = "mid-sem" | "end-sem" | "quiz";

export interface Material {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  courseId: string;
  // null for course-level material.
  unitId: string | null;
  // null for course- and unit-level material.
  topicId: string | null;
  // Set for every type except link and video, which carry a url instead.
  file: MaterialFile | null;
  // Set only for link and video.
  url: string | null;
  // Set only for type "pyq".
  pyq: { year: number; examType: ExamType } | null;
  tags: string[];
  visibility: MaterialVisibility;
  uploadedBy: string;
  uploadedAt: string;
  // Simulated engagement counts; nothing is actually tracked.
  views: number;
  downloads: number;
}

const PDF = "application/pdf";
const PPTX =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const AUTHOR = "Dr. Shiba Narayan Mishra";

export const materials: Material[] = [
  // ==================================================== cs301 — DBMS
  {
    id: "m1",
    title: "DBMS Mid-Semester Paper 2024",
    description:
      "Mid-semester question paper from 2024, covering ER modelling, normalisation and basic SQL. Useful for seeing the depth of derivation expected in the written answers.",
    type: "pyq",
    courseId: "cs301",
    unitId: null,
    topicId: null,
    file: { name: "DBMS_MidSem_2024.pdf", sizeBytes: 486_400, mimeType: PDF },
    url: null,
    pyq: { year: 2024, examType: "mid-sem" },
    tags: ["past paper", "mid-sem", "normalisation"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-04T05:30:00.000Z",
    views: 214,
    downloads: 163,
  },
  {
    id: "m2",
    title: "DBMS End-Semester Paper 2023",
    description:
      "Full end-semester paper from 2023. Section C is almost entirely transactions and concurrency, which is worth noting when you plan revision.",
    type: "pyq",
    courseId: "cs301",
    unitId: null,
    topicId: null,
    file: { name: "DBMS_EndSem_2023.pdf", sizeBytes: 612_352, mimeType: PDF },
    url: null,
    pyq: { year: 2023, examType: "end-sem" },
    tags: ["past paper", "end-sem"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-04T05:45:00.000Z",
    views: 198,
    downloads: 147,
  },
  {
    id: "m3",
    title: "DBMS Laboratory Manual",
    description:
      "All twelve lab exercises with the schema each one starts from, the expected output, and the marks split. Bring a printed copy to every lab session.",
    type: "lab-manual",
    courseId: "cs301",
    unitId: null,
    topicId: null,
    file: { name: "DBMS_Lab_Manual.pdf", sizeBytes: 2_340_864, mimeType: PDF },
    url: null,
    pyq: null,
    tags: ["lab", "sql", "practical"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-06T04:15:00.000Z",
    views: 176,
    downloads: 158,
  },
  {
    id: "m4",
    title: "Relational Algebra & SQL Question Bank",
    description:
      "Sixty graded questions for Unit 2, from single-table selects through to correlated subqueries and set operations. Answers are not included on purpose.",
    type: "question-bank",
    courseId: "cs301",
    unitId: "cs301-u2",
    topicId: null,
    file: {
      name: "CS301_Unit2_Question_Bank.docx",
      sizeBytes: 148_480,
      mimeType: DOCX,
    },
    url: null,
    pyq: null,
    tags: ["practice", "sql", "unit 2"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-19T06:10:00.000Z",
    views: 131,
    downloads: 94,
  },
  {
    id: "m5",
    title: "ER Modelling & Normalization — Lecture Slides",
    description:
      "Slides for the first four lectures: entities and relationships, then 1NF through to BCNF with a worked university schema running across every stage.",
    type: "ppt",
    courseId: "cs301",
    unitId: "cs301-u1",
    topicId: "t1",
    file: {
      name: "CS301_ER_Normalization.pptx",
      sizeBytes: 6_291_456,
      mimeType: PPTX,
    },
    url: null,
    pyq: null,
    tags: ["slides", "normalisation", "er model"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-11T04:40:00.000Z",
    views: 246,
    downloads: 172,
  },
  {
    id: "m6",
    title: "Transactions & Concurrency Control — Notes",
    description:
      "Written notes on ACID properties, serialisability, two-phase locking and deadlock handling in the transaction manager, with the lock-table walkthrough from class.",
    type: "notes",
    courseId: "cs301",
    unitId: "cs301-u4",
    topicId: "t3",
    file: {
      name: "CS301_Transactions_Notes.pdf",
      sizeBytes: 934_912,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["notes", "transactions", "locking"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-02T05:05:00.000Z",
    views: 167,
    downloads: 121,
  },
  {
    id: "m7",
    title: "PostgreSQL: The SQL Language (official tutorial)",
    description:
      "The official PostgreSQL tutorial for the query language. Read this alongside Unit 2 — the examples run directly against the lab database.",
    type: "link",
    courseId: "cs301",
    unitId: "cs301-u2",
    topicId: "t2",
    file: null,
    url: "https://www.postgresql.org/docs/current/tutorial-sql.html",
    pyq: null,
    tags: ["reference", "sql", "postgresql"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-21T07:20:00.000Z",
    views: 143,
    downloads: 0,
  },
  {
    id: "m8",
    title: "Indexing & B-Trees — Reference Sheet",
    description:
      "Draft reference sheet on B-tree and B+-tree structure with the height and fan-out calculations. Needs checking against the lab dataset before it goes out.",
    type: "pdf",
    courseId: "cs301",
    unitId: "cs301-u3",
    topicId: null,
    file: {
      name: "CS301_Indexing_Reference.pdf",
      sizeBytes: 317_440,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["reference", "indexing", "draft"],
    visibility: "hidden",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-12T09:30:00.000Z",
    views: 0,
    downloads: 0,
  },

  // ========================================== cs302 — Computer Networks
  {
    id: "m9",
    title: "Computer Networks Mid-Semester Paper 2025",
    description:
      "Last year's mid-semester paper. Question 3 on subnet planning is the one most students lost marks on, so work through it carefully.",
    type: "pyq",
    courseId: "cs302",
    unitId: null,
    topicId: null,
    file: { name: "CN_MidSem_2025.pdf", sizeBytes: 524_288, mimeType: PDF },
    url: null,
    pyq: { year: 2025, examType: "mid-sem" },
    tags: ["past paper", "mid-sem", "subnetting"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-05T06:00:00.000Z",
    views: 189,
    downloads: 141,
  },
  {
    id: "m10",
    title: "Computer Networks End-Semester Paper 2024",
    description:
      "End-semester paper from 2024, with the routing and congestion-control sections carrying the bulk of the marks.",
    type: "pyq",
    courseId: "cs302",
    unitId: null,
    topicId: null,
    file: { name: "CN_EndSem_2024.pdf", sizeBytes: 578_560, mimeType: PDF },
    url: null,
    pyq: { year: 2024, examType: "end-sem" },
    tags: ["past paper", "end-sem", "routing"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-05T06:15:00.000Z",
    views: 172,
    downloads: 130,
  },
  {
    id: "m11",
    title: "Computer Networks Question Bank",
    description:
      "Question bank across all five units, grouped by layer. Each question is tagged with the year it last appeared in an examination.",
    type: "question-bank",
    courseId: "cs302",
    unitId: null,
    topicId: null,
    file: {
      name: "CS302_Question_Bank.pdf",
      sizeBytes: 1_258_291,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["practice", "all units"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-14T04:50:00.000Z",
    views: 205,
    downloads: 164,
  },
  {
    id: "m12",
    title: "OSI & TCP/IP Reference Models — Lecture Slides",
    description:
      "Layer-by-layer comparison of the two reference models, with the encapsulation walkthrough that the first tutorial builds on.",
    type: "ppt",
    courseId: "cs302",
    unitId: "cs302-u1",
    topicId: "t1",
    file: {
      name: "CS302_OSI_TCPIP_Models.pptx",
      sizeBytes: 4_718_592,
      mimeType: PPTX,
    },
    url: null,
    pyq: null,
    tags: ["slides", "osi", "tcp/ip"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-12T05:10:00.000Z",
    views: 231,
    downloads: 158,
  },
  {
    id: "m13",
    title: "Routing Algorithms & IP Addressing — Notes",
    description:
      "Distance-vector and link-state routing worked through on the same topology, followed by classless addressing and the subnetting method used in the lab.",
    type: "notes",
    courseId: "cs302",
    unitId: "cs302-u2",
    topicId: "t2",
    file: {
      name: "CS302_Routing_Notes.pdf",
      sizeBytes: 1_048_576,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["notes", "routing", "subnetting"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-27T06:25:00.000Z",
    views: 198,
    downloads: 149,
  },
  {
    id: "m14",
    title: "Recorded lectures — TCP congestion control",
    description:
      "Opens a YouTube search for recorded lectures on TCP congestion control. Pick any university course recording; the algorithms are standard across all of them.",
    type: "video",
    courseId: "cs302",
    unitId: "cs302-u3",
    topicId: "t3",
    file: null,
    url: "https://www.youtube.com/results?search_query=tcp+congestion+control+lecture",
    pyq: null,
    tags: ["video", "congestion control"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-03T08:00:00.000Z",
    views: 96,
    downloads: 0,
  },
  {
    id: "m15",
    title: "Transport Layer Security (background reading)",
    description:
      "Background reading for the network security unit. You are not examined on the handshake in this depth, but it shows where the theory ends up in practice.",
    type: "link",
    courseId: "cs302",
    unitId: "cs302-u4",
    topicId: "t4",
    file: null,
    url: "https://en.wikipedia.org/wiki/Transport_Layer_Security",
    pyq: null,
    tags: ["reference", "security", "tls"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-05T05:40:00.000Z",
    views: 88,
    downloads: 0,
  },
  {
    id: "m16",
    title: "ATM & Token Ring — Overview",
    description:
      "Short overview of the legacy technologies in Unit 5. Being rewritten to make clear how little of this is still deployed, so it is not published yet.",
    type: "pdf",
    courseId: "cs302",
    unitId: "cs302-u5",
    topicId: null,
    file: {
      name: "CS302_Legacy_Networks.pdf",
      sizeBytes: 267_264,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["legacy", "draft"],
    visibility: "hidden",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-14T10:05:00.000Z",
    views: 0,
    downloads: 0,
  },

  // ========================================= cs303 — Operating Systems
  {
    id: "m17",
    title: "Operating Systems Mid-Semester Paper 2023",
    description:
      "Mid-semester paper from 2023. Scheduling and memory management in roughly equal weight, with one unseen numerical on paging.",
    type: "pyq",
    courseId: "cs303",
    unitId: null,
    topicId: null,
    file: { name: "OS_MidSem_2023.pdf", sizeBytes: 451_584, mimeType: PDF },
    url: null,
    pyq: { year: 2023, examType: "mid-sem" },
    tags: ["past paper", "mid-sem", "scheduling"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-03T04:30:00.000Z",
    views: 258,
    downloads: 201,
  },
  {
    id: "m18",
    title: "Operating Systems End-Semester Paper 2025",
    description:
      "The most recent end-semester paper. Worth attempting under timed conditions once the deadlock unit is finished.",
    type: "pyq",
    courseId: "cs303",
    unitId: null,
    topicId: null,
    file: { name: "OS_EndSem_2025.pdf", sizeBytes: 596_992, mimeType: PDF },
    url: null,
    pyq: { year: 2025, examType: "end-sem" },
    tags: ["past paper", "end-sem"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-03T04:45:00.000Z",
    views: 241,
    downloads: 188,
  },
  {
    id: "m19",
    title: "Unit 3 Lab Manual — Process Synchronisation",
    description:
      "The lab manual for the synchronisation unit: producer-consumer, readers-writers and the dining philosophers, each with the starter code and the expected trace.",
    type: "lab-manual",
    courseId: "cs303",
    unitId: "cs303-u3",
    topicId: null,
    file: { name: "Lab_Manual.pdf", sizeBytes: 1_887_436, mimeType: PDF },
    url: null,
    pyq: null,
    tags: ["lab", "synchronisation", "unit 3"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-09T03:10:00.000Z",
    views: 224,
    downloads: 196,
  },
  {
    id: "m20",
    title: "Process Scheduling — Lecture Slides",
    description:
      "FCFS, SJF, priority and round robin on one common workload, with the Gantt charts and the average waiting time worked out for each.",
    type: "ppt",
    courseId: "cs303",
    unitId: "cs303-u1",
    topicId: "t1",
    file: {
      name: "CS303_Process_Scheduling.pptx",
      sizeBytes: 5_242_880,
      mimeType: PPTX,
    },
    url: null,
    pyq: null,
    tags: ["slides", "scheduling", "gantt"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-10T04:20:00.000Z",
    views: 287,
    downloads: 213,
  },
  {
    id: "m21",
    title: "Memory Management & Paging — Notes",
    description:
      "Contiguous allocation through to demand paging, with page-replacement algorithms compared on the same reference string and Belady's anomaly shown rather than stated.",
    type: "notes",
    courseId: "cs303",
    unitId: "cs303-u2",
    topicId: "t2",
    file: {
      name: "CS303_Memory_Management_Notes.pdf",
      sizeBytes: 1_153_434,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["notes", "paging", "memory"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-24T05:35:00.000Z",
    views: 219,
    downloads: 164,
  },
  {
    id: "m22",
    title: "Recorded lectures — deadlock and the banker's algorithm",
    description:
      "Opens a YouTube search for lecture recordings on deadlock avoidance. Watch one before the tutorial if the safe-sequence derivation did not land in class.",
    type: "video",
    courseId: "cs303",
    unitId: "cs303-u3",
    topicId: "t3",
    file: null,
    url: "https://www.youtube.com/results?search_query=deadlock+avoidance+bankers+algorithm+lecture",
    pyq: null,
    tags: ["video", "deadlock"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-08T07:45:00.000Z",
    views: 134,
    downloads: 0,
  },
  {
    id: "m23",
    title: "The Linux Kernel documentation",
    description:
      "Official kernel documentation. Use it for the system-call and file-system sections of Unit 4 — the user-space API pages are the readable starting point.",
    type: "link",
    courseId: "cs303",
    unitId: "cs303-u4",
    topicId: "t5",
    file: null,
    url: "https://www.kernel.org/doc/html/latest/",
    pyq: null,
    tags: ["reference", "linux", "system calls"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-10T06:55:00.000Z",
    views: 79,
    downloads: 0,
  },
  {
    id: "m24",
    title: "Operating Systems Course Handout 2026",
    description:
      "Course handout: unit breakdown, lecture and lab hours, assessment weights, and the reference textbooks with the specific chapters that map to each unit.",
    type: "pdf",
    courseId: "cs303",
    unitId: null,
    topicId: null,
    file: {
      name: "CS303_Course_Handout_2026.pdf",
      sizeBytes: 389_120,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["handout", "syllabus"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-01T03:30:00.000Z",
    views: 312,
    downloads: 268,
  },

  // ========================================== cs304 — Web Technologies
  {
    id: "m25",
    title: "Web Technologies Mid-Semester Paper 2024",
    description:
      "Mid-semester paper from 2024, weighted towards markup, layout and client-side scripting.",
    type: "pyq",
    courseId: "cs304",
    unitId: null,
    topicId: null,
    file: { name: "WT_MidSem_2024.pdf", sizeBytes: 432_128, mimeType: PDF },
    url: null,
    pyq: { year: 2024, examType: "mid-sem" },
    tags: ["past paper", "mid-sem"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-07T05:20:00.000Z",
    views: 156,
    downloads: 118,
  },
  {
    id: "m26",
    title: "Web Technologies End-Semester Paper 2025",
    description:
      "Last year's end-semester paper. The web services section still asks for SOAP, which is worth knowing when you plan your revision time.",
    type: "pyq",
    courseId: "cs304",
    unitId: null,
    topicId: null,
    file: { name: "WT_EndSem_2025.pdf", sizeBytes: 507_904, mimeType: PDF },
    url: null,
    pyq: { year: 2025, examType: "end-sem" },
    tags: ["past paper", "end-sem", "web services"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-07T05:35:00.000Z",
    views: 148,
    downloads: 109,
  },
  {
    id: "m27",
    title: "Web Technologies Question Bank",
    description:
      "Practice questions across all four units, including the short-answer format used for the markup and scripting sections.",
    type: "question-bank",
    courseId: "cs304",
    unitId: null,
    topicId: null,
    file: {
      name: "CS304_Question_Bank.docx",
      sizeBytes: 196_608,
      mimeType: DOCX,
    },
    url: null,
    pyq: null,
    tags: ["practice", "all units"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-18T04:05:00.000Z",
    views: 127,
    downloads: 91,
  },
  {
    id: "m28",
    title: "HTML5, CSS & Responsive Layout — Lecture Slides",
    description:
      "Semantic markup, the box model, then Flexbox and Grid with the breakpoints used in the portfolio assignment.",
    type: "ppt",
    courseId: "cs304",
    unitId: "cs304-u1",
    topicId: "t1",
    file: {
      name: "CS304_HTML_CSS_Layout.pptx",
      sizeBytes: 8_388_608,
      mimeType: PPTX,
    },
    url: null,
    pyq: null,
    tags: ["slides", "css", "responsive"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-08-13T04:55:00.000Z",
    views: 203,
    downloads: 147,
  },
  {
    id: "m29",
    title: "JavaScript & the DOM — Notes",
    description:
      "Draft notes on the DOM API, event handling and delegation. Holding these back until the examples are rewritten without jQuery.",
    type: "notes",
    courseId: "cs304",
    unitId: "cs304-u2",
    topicId: "t2",
    file: {
      name: "CS304_JavaScript_DOM_Notes.pdf",
      sizeBytes: 743_424,
      mimeType: PDF,
    },
    url: null,
    pyq: null,
    tags: ["notes", "javascript", "draft"],
    visibility: "hidden",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-13T08:40:00.000Z",
    views: 0,
    downloads: 0,
  },
  {
    id: "m30",
    title: "MDN: HTTP reference",
    description:
      "The MDN HTTP documentation. Read the methods and status-code pages before the REST unit — the assignment marks correct status codes explicitly.",
    type: "link",
    courseId: "cs304",
    unitId: "cs304-u4",
    topicId: "t5",
    file: null,
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    pyq: null,
    tags: ["reference", "http", "rest"],
    visibility: "published",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-06T06:30:00.000Z",
    views: 112,
    downloads: 0,
  },
  {
    id: "m31",
    title: "Recorded lectures — server-side scripting with PHP",
    description:
      "Opens a YouTube search for PHP server-side tutorials. Provisional: I would rather replace this unit's material with a Node-based equivalent next session.",
    type: "video",
    courseId: "cs304",
    unitId: "cs304-u3",
    topicId: null,
    file: null,
    url: "https://www.youtube.com/results?search_query=php+server+side+scripting+tutorial",
    pyq: null,
    tags: ["video", "php", "draft"],
    visibility: "hidden",
    uploadedBy: AUTHOR,
    uploadedAt: "2026-09-15T09:15:00.000Z",
    views: 0,
    downloads: 0,
  },
];

export function getMaterial(id: string) {
  return materials.find((material) => material.id === id);
}
