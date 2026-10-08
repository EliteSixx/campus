import type { Attachment } from "@/data/faculty-announcements";

// One-to-one and small group threads between the logged-in faculty member and
// their students. Every participant id is a real student from data/students.ts.
//
// Attachment metadata reuses the announcement type so both features describe a
// file the same way; there are no real files behind either.

// The faculty member's own side of every thread. Anything else in `senderId`
// is a student id. TypeScript collapses `"faculty" | string` back to `string`,
// so the literal is pinned down as a constant instead and compared against it.
export const FACULTY_ID = "faculty";

export interface Message {
  id: string;
  // Either FACULTY_ID or a student id from data/students.ts.
  senderId: string;
  body: string;
  sentAt: string;
  attachments: Attachment[];
  // When the other side opened it. null means unread — for a student's message
  // that means the faculty member has not read it yet.
  readAt: string | null;
}

export interface Conversation {
  id: string;
  subject: string;
  // Students only; the faculty member is implicit in every thread.
  participantIds: string[];
  isGroup: boolean;
  // Oldest first, the order they are read in.
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: "c1",
    subject: "Doubt about the deadlock case study",
    participantIds: ["s2"],
    isGroup: false,
    messages: [
      {
        id: "c1m1",
        senderId: "s2",
        body: "Sir, in scenario 3 of the case study, is the request from P2 supposed to be granted? I get a safe sequence either way and I think I am missing something.",
        sentAt: "2026-09-15T14:05:00.000Z",
        attachments: [],
        readAt: "2026-09-15T14:40:00.000Z",
      },
      {
        id: "c1m2",
        senderId: FACULTY_ID,
        body: "Check your available vector again after the hypothetical allocation. If it still satisfies some process's maximum need, the state is safe and the request can be granted.",
        sentAt: "2026-09-15T15:12:00.000Z",
        attachments: [],
        readAt: "2026-09-15T15:30:00.000Z",
      },
      {
        id: "c1m3",
        senderId: "s2",
        body: "That was it — I had subtracted from the wrong row. Getting a single safe sequence now.",
        sentAt: "2026-09-16T07:02:00.000Z",
        attachments: [],
        readAt: null,
      },
      {
        id: "c1m4",
        senderId: "s2",
        body: "One more thing: do you want the intermediate tables in the submission or only the final sequence?",
        sentAt: "2026-09-16T07:20:00.000Z",
        attachments: [],
        readAt: null,
      },
    ],
  },
  {
    id: "c2",
    subject: "Medical leave for 18-20 September",
    participantIds: ["s14"],
    isGroup: false,
    messages: [
      {
        id: "c2m1",
        senderId: "s14",
        body: "Sir, I have been advised rest for three days and will miss the lectures and the Friday lab. Attaching the certificate.",
        sentAt: "2026-09-14T09:10:00.000Z",
        attachments: [
          {
            id: "matt1",
            name: "Medical_Certificate.pdf",
            sizeBytes: 98304,
            mimeType: "application/pdf",
          },
        ],
        readAt: "2026-09-14T10:02:00.000Z",
      },
      {
        id: "c2m2",
        senderId: FACULTY_ID,
        body: "Noted, get well first. I will mark the leave against those three days once the office logs the certificate.",
        sentAt: "2026-09-14T10:15:00.000Z",
        attachments: [],
        readAt: "2026-09-14T10:44:00.000Z",
      },
      {
        id: "c2m3",
        senderId: FACULTY_ID,
        body: "Separately — your attendance was already close to the line before this. Come and see me once you are back and we will sort out the make-up sessions.",
        sentAt: "2026-09-14T10:18:00.000Z",
        attachments: [],
        readAt: "2026-09-14T10:44:00.000Z",
      },
      {
        id: "c2m4",
        senderId: "s14",
        body: "Understood sir. I will come to your office hours on Monday.",
        sentAt: "2026-09-15T10:02:00.000Z",
        attachments: [],
        readAt: "2026-09-15T11:20:00.000Z",
      },
      {
        id: "c2m5",
        senderId: "s14",
        body: "Could you also tell me which lab exercise I should catch up on first?",
        sentAt: "2026-09-15T10:15:00.000Z",
        attachments: [],
        readAt: null,
      },
    ],
  },
  {
    id: "c3",
    subject: "Internship completion letter request",
    participantIds: ["s10"],
    isGroup: false,
    messages: [
      {
        id: "c3m1",
        senderId: "s10",
        body: "Sir, Quick Heal has asked for a letter from the department confirming my internship dates before they issue the joining letter for my pre-placement offer. Attaching their mail.",
        sentAt: "2026-09-11T11:30:00.000Z",
        attachments: [
          {
            id: "matt2",
            name: "QuickHeal_Offer_Mail.pdf",
            sizeBytes: 71680,
            mimeType: "application/pdf",
          },
        ],
        readAt: "2026-09-11T12:15:00.000Z",
      },
      {
        id: "c3m2",
        senderId: FACULTY_ID,
        body: "I can sign it. Draft the letter with the exact start and end dates and the weekly hours, and send it across — do not leave the dates to the office to guess.",
        sentAt: "2026-09-11T13:05:00.000Z",
        attachments: [],
        readAt: "2026-09-11T13:40:00.000Z",
      },
      {
        id: "c3m3",
        senderId: "s10",
        body: "Drafted and left at the department office this morning.",
        sentAt: "2026-09-12T08:55:00.000Z",
        attachments: [],
        readAt: "2026-09-12T09:10:00.000Z",
      },
      {
        id: "c3m4",
        senderId: FACULTY_ID,
        body: "Signed and returned. Collect it after four today.",
        sentAt: "2026-09-12T09:25:00.000Z",
        attachments: [],
        readAt: "2026-09-12T09:51:00.000Z",
      },
    ],
  },
  {
    id: "c4",
    subject: "Re-evaluation request - CS301 internals",
    participantIds: ["s1"],
    isGroup: false,
    messages: [
      {
        id: "c4m1",
        senderId: "s1",
        body: "Sir, I would like to request a re-evaluation of my DBMS internal. I think question 4b was marked as unanswered but I had continued it on the back page.",
        sentAt: "2026-09-14T12:20:00.000Z",
        attachments: [],
        readAt: "2026-09-14T12:55:00.000Z",
      },
      {
        id: "c4m2",
        senderId: FACULTY_ID,
        body: "That is worth checking. Bring the answer script to my office hours and I will look at the back page with you before anything formal is filed.",
        sentAt: "2026-09-14T13:15:00.000Z",
        attachments: [],
        readAt: "2026-09-14T13:32:00.000Z",
      },
      {
        id: "c4m3",
        senderId: "s1",
        body: "Thank you sir, I will bring it on Wednesday.",
        sentAt: "2026-09-14T13:40:00.000Z",
        attachments: [],
        readAt: null,
      },
    ],
  },
  {
    id: "c5",
    subject: "Web Technologies mini-project - Team 4",
    participantIds: ["s6", "s10", "s18"],
    isGroup: true,
    messages: [
      {
        id: "c5m1",
        senderId: FACULTY_ID,
        body: "You are Team 4. Split the work into front end, API and data layer, and tell me who owns which by Thursday.",
        sentAt: "2026-09-15T16:25:00.000Z",
        attachments: [],
        readAt: "2026-09-15T16:50:00.000Z",
      },
      {
        id: "c5m2",
        senderId: "s10",
        body: "I will take the API layer.",
        sentAt: "2026-09-15T16:48:00.000Z",
        attachments: [],
        readAt: "2026-09-15T17:30:00.000Z",
      },
      {
        id: "c5m3",
        senderId: "s18",
        body: "Front end for me. It overlaps with the responsive portfolio assignment, so I can reuse that layout work.",
        sentAt: "2026-09-15T17:02:00.000Z",
        attachments: [],
        readAt: "2026-09-15T17:30:00.000Z",
      },
      {
        id: "c5m4",
        senderId: "s6",
        body: "Data layer then. Sir, can we use PostgreSQL rather than the sample file storage?",
        sentAt: "2026-09-15T17:21:00.000Z",
        attachments: [],
        readAt: "2026-09-15T17:45:00.000Z",
      },
      {
        id: "c5m5",
        senderId: FACULTY_ID,
        body: "Yes, PostgreSQL is fine and closer to what you will meet outside. Keep the schema in version control from the first commit.",
        sentAt: "2026-09-15T17:52:00.000Z",
        attachments: [],
        readAt: "2026-09-15T18:00:00.000Z",
      },
      {
        id: "c5m6",
        senderId: "s6",
        body: "Noted sir. Sharing the first schema draft here tomorrow.",
        sentAt: "2026-09-15T18:05:00.000Z",
        attachments: [],
        readAt: null,
      },
    ],
  },
  {
    id: "c6",
    subject: "OS lab project group - scheduler simulator",
    participantIds: ["s1", "s2", "s14"],
    isGroup: true,
    messages: [
      {
        id: "c6m1",
        senderId: FACULTY_ID,
        body: "For the lab project, the three of you are working on the scheduler simulator. Start from the workload dataset attached to the first assignment rather than generating your own.",
        sentAt: "2026-09-09T11:00:00.000Z",
        attachments: [],
        readAt: "2026-09-09T11:35:00.000Z",
      },
      {
        id: "c6m2",
        senderId: "s1",
        body: "Sir, should the Round Robin quantum be fixed or should we make it configurable?",
        sentAt: "2026-09-09T12:14:00.000Z",
        attachments: [],
        readAt: "2026-09-09T13:00:00.000Z",
      },
      {
        id: "c6m3",
        senderId: FACULTY_ID,
        body: "Configurable, and plot the average waiting time against the quantum. That comparison is the interesting part of the project.",
        sentAt: "2026-09-09T13:20:00.000Z",
        attachments: [],
        readAt: "2026-09-09T14:02:00.000Z",
      },
      {
        id: "c6m4",
        senderId: "s2",
        body: "We have FCFS and SJF running. Round Robin is next.",
        sentAt: "2026-09-10T15:30:00.000Z",
        attachments: [],
        readAt: "2026-09-10T16:10:00.000Z",
      },
      {
        id: "c6m5",
        senderId: "s14",
        body: "I am writing the comparison section once the third one is in.",
        sentAt: "2026-09-10T16:50:00.000Z",
        attachments: [],
        readAt: "2026-09-10T17:15:00.000Z",
      },
    ],
  },
];

export function getConversation(id: string) {
  return conversations.find((c) => c.id === id);
}
