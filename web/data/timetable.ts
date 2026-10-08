export type SlotType = "Lecture" | "Lab" | "Office Hours" | "Meeting";

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export interface TimetableSlot {
  id: string;
  day: Weekday;
  start: string;
  end: string;
  type: SlotType;
  subjectId: string | null;
  title: string | null;
  section: string | null;
  room: string;
}

export const DAY_START = "09:00";
export const DAY_END = "17:00";
export const LUNCH_START = "13:00";
export const LUNCH_END = "14:00";

export const timetable: TimetableSlot[] = [
  {
    id: "t1",
    day: "Monday",
    start: "09:00",
    end: "10:00",
    type: "Lecture",
    subjectId: "cs303",
    title: null,
    section: "CSE-A",
    room: "LT-3",
  },
  {
    id: "t2",
    day: "Monday",
    start: "10:00",
    end: "11:00",
    type: "Lecture",
    subjectId: "cs301",
    title: null,
    section: "CSE-A",
    room: "LT-3",
  },
  {
    id: "t3",
    day: "Monday",
    start: "11:00",
    end: "12:00",
    type: "Lecture",
    subjectId: "cs302",
    title: null,
    section: "CSE-B",
    room: "LT-5",
  },
  {
    id: "t4",
    day: "Monday",
    start: "14:00",
    end: "16:00",
    type: "Office Hours",
    subjectId: null,
    title: "Student consultation hours",
    section: null,
    room: "CSE Block, Room 214",
  },
  {
    id: "t5",
    day: "Tuesday",
    start: "09:00",
    end: "11:00",
    type: "Lab",
    subjectId: "cs301",
    title: null,
    section: "CSE-A",
    room: "Lab-2",
  },
  {
    id: "t6",
    day: "Tuesday",
    start: "11:00",
    end: "12:00",
    type: "Lecture",
    subjectId: "cs303",
    title: null,
    section: "CSE-A",
    room: "LT-3",
  },
  {
    id: "t7",
    day: "Tuesday",
    start: "14:00",
    end: "15:00",
    type: "Lecture",
    subjectId: "cs304",
    title: null,
    section: "CSE-B",
    room: "LT-1",
  },
  {
    id: "t8",
    day: "Wednesday",
    start: "09:00",
    end: "10:00",
    type: "Lecture",
    subjectId: "cs302",
    title: null,
    section: "CSE-B",
    room: "LT-5",
  },
  {
    id: "t9",
    day: "Wednesday",
    start: "10:00",
    end: "11:00",
    type: "Lecture",
    subjectId: "cs304",
    title: null,
    section: "CSE-B",
    room: "LT-1",
  },
  {
    id: "t10",
    day: "Wednesday",
    start: "11:00",
    end: "13:00",
    type: "Office Hours",
    subjectId: null,
    title: "Student consultation hours",
    section: null,
    room: "CSE Block, Room 214",
  },
  {
    id: "t11",
    day: "Wednesday",
    start: "14:00",
    end: "16:00",
    type: "Lab",
    subjectId: "cs304",
    title: null,
    section: "CSE-B",
    room: "Lab-1",
  },
  {
    id: "t12",
    day: "Thursday",
    start: "09:00",
    end: "10:00",
    type: "Lecture",
    subjectId: "cs301",
    title: null,
    section: "CSE-A",
    room: "LT-3",
  },
  {
    id: "t13",
    day: "Thursday",
    start: "10:00",
    end: "11:00",
    type: "Lecture",
    subjectId: "cs303",
    title: null,
    section: "CSE-A",
    room: "LT-3",
  },
  {
    id: "t14",
    day: "Thursday",
    start: "11:00",
    end: "12:00",
    type: "Lecture",
    subjectId: "cs302",
    title: null,
    section: "CSE-B",
    room: "LT-5",
  },
  {
    id: "t15",
    day: "Thursday",
    start: "15:00",
    end: "16:00",
    type: "Meeting",
    subjectId: null,
    title: "Department faculty meeting",
    section: null,
    room: "Conference Room",
  },
  {
    id: "t16",
    day: "Friday",
    start: "09:00",
    end: "11:00",
    type: "Lab",
    subjectId: "cs302",
    title: null,
    section: "CSE-B",
    room: "Lab-3",
  },
  {
    id: "t17",
    day: "Friday",
    start: "11:00",
    end: "12:00",
    type: "Lecture",
    subjectId: "cs301",
    title: null,
    section: "CSE-A",
    room: "LT-3",
  },
  {
    id: "t18",
    day: "Friday",
    start: "15:00",
    end: "17:00",
    type: "Office Hours",
    subjectId: null,
    title: "Student consultation hours",
    section: null,
    room: "CSE Block, Room 214",
  },
];

export const weekdays: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export function slotsForDay(day: Weekday) {
  return timetable
    .filter((s) => s.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));
}
