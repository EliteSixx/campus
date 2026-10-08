// The academic calendar the lecture planner schedules against: the teaching
// window for the semester, the holidays inside it and the exam weeks when no
// lectures run.
//
// SAMPLE DATES FOR THE DEMO — this is not an official university calendar.
// They are chosen to sit around the rest of the seed data, which is written
// for mid-September 2026.
//
// Every date is a calendar date, "YYYY-MM-DD", not a UTC timestamp, and every
// one falls inside startDate..endDate.

export interface Holiday {
  date: string;
  name: string;
}

export interface ExamPeriod {
  id: string;
  name: string;
  // Both inclusive.
  start: string;
  end: string;
}

export interface AcademicCalendar {
  id: string;
  semesterName: string;
  // The teaching window, both inclusive.
  startDate: string;
  endDate: string;
  holidays: Holiday[];
  examPeriods: ExamPeriod[];
}

export const academicCalendar: AcademicCalendar = {
  id: "odd-2026-27",
  semesterName: "Odd Semester 2026-27",
  startDate: "2026-08-03",
  endDate: "2026-12-11",
  holidays: [
    { date: "2026-08-15", name: "Independence Day" },
    { date: "2026-10-02", name: "Gandhi Jayanti" },
    { date: "2026-10-19", name: "Durga Puja break" },
    { date: "2026-10-20", name: "Durga Puja break" },
    { date: "2026-10-21", name: "Durga Puja break" },
    { date: "2026-11-24", name: "Guru Nanak Jayanti" },
  ],
  examPeriods: [
    // The seed data mentions a revised mid-semester schedule (announcement
    // an1, published 7 September) but gives no exam date, so the week sits
    // after that announcement.
    {
      id: "midsem-2026",
      name: "Mid-semester examinations",
      start: "2026-09-28",
      end: "2026-10-03",
    },
  ],
};

// Lookups against the calendar above. Both compare the date strings directly,
// which is correct for zero-padded YYYY-MM-DD.

export function getHolidayByDate(date: string): Holiday | undefined {
  return academicCalendar.holidays.find((h) => h.date === date);
}

export function getExamPeriodByDate(date: string): ExamPeriod | undefined {
  return academicCalendar.examPeriods.find(
    (p) => p.start <= date && date <= p.end,
  );
}
