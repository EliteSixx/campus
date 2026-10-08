export interface SemesterSubjectRecord {
  subjectId: string;
  internalMarks: number; // out of 100
  semesterMarks: number | null; // out of 100, null while the exam is pending
  attendance: number; // percentage
}

export interface SemesterRecord {
  semester: number;
  status: "Completed" | "In Progress";
  sgpa: number | null; // null while in progress
  subjects: SemesterSubjectRecord[];
}

export interface StudentAcademics {
  studentId: string;
  semesters: SemesterRecord[];
}

export const studentAcademics: StudentAcademics[] = [
  {
    studentId: "s1", // Rudy Sharma
    semesters: [
      {
        semester: 1,
        status: "Completed",
        sgpa: 8.1,
        subjects: [
          {
            subjectId: "cs101",
            internalMarks: 83,
            semesterMarks: 82,
            attendance: 88,
          },
          {
            subjectId: "cs102",
            internalMarks: 81,
            semesterMarks: 80,
            attendance: 86,
          },
          {
            subjectId: "cs103",
            internalMarks: 73,
            semesterMarks: 68,
            attendance: 82,
          },
          {
            subjectId: "cs104",
            internalMarks: 82,
            semesterMarks: 75,
            attendance: 83,
          },
          {
            subjectId: "cs105",
            internalMarks: 82,
            semesterMarks: 80,
            attendance: 98,
          },
          {
            subjectId: "cs106",
            internalMarks: 79,
            semesterMarks: 76,
            attendance: 98,
          },
        ],
      },
      {
        semester: 2,
        status: "Completed",
        sgpa: 7.8,
        subjects: [
          {
            subjectId: "cs201",
            internalMarks: 81,
            semesterMarks: 76,
            attendance: 88,
          },
          {
            subjectId: "cs202",
            internalMarks: 77,
            semesterMarks: 74,
            attendance: 97,
          },
          {
            subjectId: "cs203",
            internalMarks: 76,
            semesterMarks: 68,
            attendance: 94,
          },
          {
            subjectId: "cs204",
            internalMarks: 84,
            semesterMarks: 76,
            attendance: 87,
          },
          {
            subjectId: "cs205",
            internalMarks: 73,
            semesterMarks: 67,
            attendance: 85,
          },
          {
            subjectId: "cs206",
            internalMarks: 86,
            semesterMarks: 81,
            attendance: 95,
          },
        ],
      },
      {
        semester: 3,
        status: "Completed",
        sgpa: 7.5,
        subjects: [
          {
            subjectId: "cs301x",
            internalMarks: 77,
            semesterMarks: 68,
            attendance: 86,
          },
          {
            subjectId: "cs302x",
            internalMarks: 72,
            semesterMarks: 68,
            attendance: 87,
          },
          {
            subjectId: "cs303x",
            internalMarks: 78,
            semesterMarks: 75,
            attendance: 85,
          },
          {
            subjectId: "cs304x",
            internalMarks: 84,
            semesterMarks: 75,
            attendance: 89,
          },
          {
            subjectId: "cs305x",
            internalMarks: 80,
            semesterMarks: 72,
            attendance: 88,
          },
          {
            subjectId: "cs306x",
            internalMarks: 74,
            semesterMarks: 69,
            attendance: 90,
          },
        ],
      },
      {
        semester: 4,
        status: "Completed",
        sgpa: 7.8,
        subjects: [
          {
            subjectId: "cs503",
            internalMarks: 74,
            semesterMarks: 70,
            attendance: 88,
          },
          {
            subjectId: "cs402",
            internalMarks: 73,
            semesterMarks: 68,
            attendance: 93,
          },
          {
            subjectId: "cs403",
            internalMarks: 79,
            semesterMarks: 73,
            attendance: 94,
          },
          {
            subjectId: "cs404",
            internalMarks: 78,
            semesterMarks: 75,
            attendance: 91,
          },
          {
            subjectId: "cs405",
            internalMarks: 84,
            semesterMarks: 77,
            attendance: 93,
          },
          {
            subjectId: "cs406",
            internalMarks: 89,
            semesterMarks: 84,
            attendance: 90,
          },
        ],
      },
      {
        semester: 5,
        status: "In Progress",
        sgpa: null,
        subjects: [
          {
            subjectId: "cs301",
            internalMarks: 76,
            semesterMarks: null,
            attendance: 88,
          },
          {
            subjectId: "cs302",
            internalMarks: 74,
            semesterMarks: null,
            attendance: 86,
          },
          {
            subjectId: "cs303",
            internalMarks: 72,
            semesterMarks: null,
            attendance: 85,
          },
          {
            subjectId: "cs504",
            internalMarks: 78,
            semesterMarks: null,
            attendance: 90,
          },
          {
            subjectId: "cs505",
            internalMarks: 81,
            semesterMarks: null,
            attendance: 92,
          },
          {
            subjectId: "cs506",
            internalMarks: 75,
            semesterMarks: null,
            attendance: 87,
          },
        ],
      },
    ],
  },
  {
    studentId: "s2", // Ananya Nair
    semesters: [
      {
        semester: 1,
        status: "Completed",
        sgpa: 6.4,
        subjects: [
          {
            subjectId: "cs101",
            internalMarks: 68,
            semesterMarks: 66,
            attendance: 67,
          },
          {
            subjectId: "cs102",
            internalMarks: 61,
            semesterMarks: 60,
            attendance: 63,
          },
          {
            subjectId: "cs103",
            internalMarks: 53,
            semesterMarks: 52,
            attendance: 78,
          },
          {
            subjectId: "cs104",
            internalMarks: 69,
            semesterMarks: 63,
            attendance: 79,
          },
          {
            subjectId: "cs105",
            internalMarks: 65,
            semesterMarks: 64,
            attendance: 75,
          },
          {
            subjectId: "cs106",
            internalMarks: 64,
            semesterMarks: 56,
            attendance: 74,
          },
        ],
      },
      {
        semester: 2,
        status: "Completed",
        sgpa: 6,
        subjects: [
          {
            subjectId: "cs201",
            internalMarks: 56,
            semesterMarks: 51,
            attendance: 65,
          },
          {
            subjectId: "cs202",
            internalMarks: 68,
            semesterMarks: 65,
            attendance: 75,
          },
          {
            subjectId: "cs203",
            internalMarks: 70,
            semesterMarks: 63,
            attendance: 75,
          },
          {
            subjectId: "cs204",
            internalMarks: 52,
            semesterMarks: 51,
            attendance: 70,
          },
          {
            subjectId: "cs205",
            internalMarks: 57,
            semesterMarks: 57,
            attendance: 71,
          },
          {
            subjectId: "cs206",
            internalMarks: 58,
            semesterMarks: 51,
            attendance: 65,
          },
        ],
      },
      {
        semester: 3,
        status: "Completed",
        sgpa: 6.4,
        subjects: [
          {
            subjectId: "cs301x",
            internalMarks: 61,
            semesterMarks: 54,
            attendance: 81,
          },
          {
            subjectId: "cs302x",
            internalMarks: 56,
            semesterMarks: 52,
            attendance: 66,
          },
          {
            subjectId: "cs303x",
            internalMarks: 68,
            semesterMarks: 66,
            attendance: 70,
          },
          {
            subjectId: "cs304x",
            internalMarks: 69,
            semesterMarks: 64,
            attendance: 80,
          },
          {
            subjectId: "cs305x",
            internalMarks: 67,
            semesterMarks: 59,
            attendance: 66,
          },
          {
            subjectId: "cs306x",
            internalMarks: 69,
            semesterMarks: 65,
            attendance: 74,
          },
        ],
      },
      {
        semester: 4,
        status: "Completed",
        sgpa: 6.2,
        subjects: [
          {
            subjectId: "cs503",
            internalMarks: 60,
            semesterMarks: 55,
            attendance: 77,
          },
          {
            subjectId: "cs402",
            internalMarks: 64,
            semesterMarks: 58,
            attendance: 70,
          },
          {
            subjectId: "cs403",
            internalMarks: 61,
            semesterMarks: 57,
            attendance: 75,
          },
          {
            subjectId: "cs404",
            internalMarks: 64,
            semesterMarks: 59,
            attendance: 75,
          },
          {
            subjectId: "cs405",
            internalMarks: 54,
            semesterMarks: 50,
            attendance: 78,
          },
          {
            subjectId: "cs406",
            internalMarks: 69,
            semesterMarks: 63,
            attendance: 69,
          },
        ],
      },
      {
        semester: 5,
        status: "In Progress",
        sgpa: null,
        subjects: [
          {
            subjectId: "cs301",
            internalMarks: 46,
            semesterMarks: null,
            attendance: 81,
          },
          {
            subjectId: "cs302",
            internalMarks: 62,
            semesterMarks: null,
            attendance: 79,
          },
          {
            subjectId: "cs303",
            internalMarks: 64,
            semesterMarks: null,
            attendance: 80,
          },
          {
            subjectId: "cs504",
            internalMarks: 63,
            semesterMarks: null,
            attendance: 78,
          },
          {
            subjectId: "cs505",
            internalMarks: 67,
            semesterMarks: null,
            attendance: 83,
          },
          {
            subjectId: "cs506",
            internalMarks: 60,
            semesterMarks: null,
            attendance: 77,
          },
        ],
      },
    ],
  },
  {
    studentId: "s6", // Ishita Das
    semesters: [
      {
        semester: 1,
        status: "Completed",
        sgpa: 6.5,
        subjects: [
          {
            subjectId: "cs101",
            internalMarks: 72,
            semesterMarks: 64,
            attendance: 81,
          },
          {
            subjectId: "cs102",
            internalMarks: 71,
            semesterMarks: 71,
            attendance: 68,
          },
          {
            subjectId: "cs103",
            internalMarks: 56,
            semesterMarks: 48,
            attendance: 72,
          },
          {
            subjectId: "cs104",
            internalMarks: 71,
            semesterMarks: 64,
            attendance: 81,
          },
          {
            subjectId: "cs105",
            internalMarks: 69,
            semesterMarks: 66,
            attendance: 65,
          },
          {
            subjectId: "cs106",
            internalMarks: 59,
            semesterMarks: 52,
            attendance: 70,
          },
        ],
      },
      {
        semester: 2,
        status: "Completed",
        sgpa: 6.2,
        subjects: [
          {
            subjectId: "cs201",
            internalMarks: 65,
            semesterMarks: 59,
            attendance: 66,
          },
          {
            subjectId: "cs202",
            internalMarks: 59,
            semesterMarks: 56,
            attendance: 81,
          },
          {
            subjectId: "cs203",
            internalMarks: 66,
            semesterMarks: 63,
            attendance: 83,
          },
          {
            subjectId: "cs204",
            internalMarks: 58,
            semesterMarks: 51,
            attendance: 80,
          },
          {
            subjectId: "cs205",
            internalMarks: 61,
            semesterMarks: 57,
            attendance: 82,
          },
          {
            subjectId: "cs206",
            internalMarks: 64,
            semesterMarks: 60,
            attendance: 75,
          },
        ],
      },
      {
        semester: 3,
        status: "Completed",
        sgpa: 6.2,
        subjects: [
          {
            subjectId: "cs301x",
            internalMarks: 56,
            semesterMarks: 52,
            attendance: 70,
          },
          {
            subjectId: "cs302x",
            internalMarks: 63,
            semesterMarks: 57,
            attendance: 72,
          },
          {
            subjectId: "cs303x",
            internalMarks: 57,
            semesterMarks: 51,
            attendance: 73,
          },
          {
            subjectId: "cs304x",
            internalMarks: 62,
            semesterMarks: 55,
            attendance: 78,
          },
          {
            subjectId: "cs305x",
            internalMarks: 69,
            semesterMarks: 66,
            attendance: 78,
          },
          {
            subjectId: "cs306x",
            internalMarks: 67,
            semesterMarks: 67,
            attendance: 79,
          },
        ],
      },
      {
        semester: 4,
        status: "Completed",
        sgpa: 6.4,
        subjects: [
          {
            subjectId: "cs503",
            internalMarks: 70,
            semesterMarks: 69,
            attendance: 67,
          },
          {
            subjectId: "cs402",
            internalMarks: 66,
            semesterMarks: 58,
            attendance: 82,
          },
          {
            subjectId: "cs403",
            internalMarks: 64,
            semesterMarks: 56,
            attendance: 80,
          },
          {
            subjectId: "cs404",
            internalMarks: 65,
            semesterMarks: 60,
            attendance: 74,
          },
          {
            subjectId: "cs405",
            internalMarks: 58,
            semesterMarks: 55,
            attendance: 72,
          },
          {
            subjectId: "cs406",
            internalMarks: 69,
            semesterMarks: 65,
            attendance: 81,
          },
        ],
      },
      {
        semester: 5,
        status: "Completed",
        sgpa: 6.7,
        subjects: [
          {
            subjectId: "cs301",
            internalMarks: 70,
            semesterMarks: 65,
            attendance: 71,
          },
          {
            subjectId: "cs302",
            internalMarks: 68,
            semesterMarks: 59,
            attendance: 70,
          },
          {
            subjectId: "cs303",
            internalMarks: 64,
            semesterMarks: 64,
            attendance: 71,
          },
          {
            subjectId: "cs504",
            internalMarks: 66,
            semesterMarks: 63,
            attendance: 68,
          },
          {
            subjectId: "cs505",
            internalMarks: 63,
            semesterMarks: 62,
            attendance: 64,
          },
          {
            subjectId: "cs506",
            internalMarks: 70,
            semesterMarks: 62,
            attendance: 82,
          },
        ],
      },
      {
        semester: 6,
        status: "Completed",
        sgpa: 6.5,
        subjects: [
          {
            subjectId: "cs701",
            internalMarks: 64,
            semesterMarks: 60,
            attendance: 76,
          },
          {
            subjectId: "cs602",
            internalMarks: 60,
            semesterMarks: 55,
            attendance: 78,
          },
          {
            subjectId: "cs603",
            internalMarks: 72,
            semesterMarks: 68,
            attendance: 77,
          },
          {
            subjectId: "cs604",
            internalMarks: 56,
            semesterMarks: 52,
            attendance: 66,
          },
          {
            subjectId: "cs605",
            internalMarks: 61,
            semesterMarks: 57,
            attendance: 75,
          },
          {
            subjectId: "cs606",
            internalMarks: 71,
            semesterMarks: 66,
            attendance: 81,
          },
        ],
      },
      {
        semester: 7,
        status: "In Progress",
        sgpa: null,
        subjects: [
          {
            subjectId: "cs304",
            internalMarks: 66,
            semesterMarks: null,
            attendance: 81,
          },
          {
            subjectId: "cs702",
            internalMarks: 63,
            semesterMarks: null,
            attendance: 80,
          },
          {
            subjectId: "cs703",
            internalMarks: 68,
            semesterMarks: null,
            attendance: 84,
          },
          {
            subjectId: "cs704",
            internalMarks: 61,
            semesterMarks: null,
            attendance: 78,
          },
          {
            subjectId: "cs705",
            internalMarks: 70,
            semesterMarks: null,
            attendance: 86,
          },
          {
            subjectId: "cs706",
            internalMarks: 65,
            semesterMarks: null,
            attendance: 82,
          },
        ],
      },
    ],
  },
  {
    studentId: "s10", // Priya Rao
    semesters: [
      {
        semester: 1,
        status: "Completed",
        sgpa: 7.5,
        subjects: [
          {
            subjectId: "cs101",
            internalMarks: 85,
            semesterMarks: 79,
            attendance: 89,
          },
          {
            subjectId: "cs102",
            internalMarks: 79,
            semesterMarks: 76,
            attendance: 84,
          },
          {
            subjectId: "cs103",
            internalMarks: 77,
            semesterMarks: 68,
            attendance: 88,
          },
          {
            subjectId: "cs104",
            internalMarks: 67,
            semesterMarks: 67,
            attendance: 90,
          },
          {
            subjectId: "cs105",
            internalMarks: 77,
            semesterMarks: 69,
            attendance: 77,
          },
          {
            subjectId: "cs106",
            internalMarks: 76,
            semesterMarks: 67,
            attendance: 80,
          },
        ],
      },
      {
        semester: 2,
        status: "Completed",
        sgpa: 7.2,
        subjects: [
          {
            subjectId: "cs201",
            internalMarks: 72,
            semesterMarks: 65,
            attendance: 84,
          },
          {
            subjectId: "cs202",
            internalMarks: 74,
            semesterMarks: 68,
            attendance: 80,
          },
          {
            subjectId: "cs203",
            internalMarks: 70,
            semesterMarks: 61,
            attendance: 96,
          },
          {
            subjectId: "cs204",
            internalMarks: 68,
            semesterMarks: 66,
            attendance: 79,
          },
          {
            subjectId: "cs205",
            internalMarks: 75,
            semesterMarks: 67,
            attendance: 78,
          },
          {
            subjectId: "cs206",
            internalMarks: 82,
            semesterMarks: 80,
            attendance: 81,
          },
        ],
      },
      {
        semester: 3,
        status: "Completed",
        sgpa: 7.2,
        subjects: [
          {
            subjectId: "cs301x",
            internalMarks: 76,
            semesterMarks: 69,
            attendance: 78,
          },
          {
            subjectId: "cs302x",
            internalMarks: 67,
            semesterMarks: 59,
            attendance: 95,
          },
          {
            subjectId: "cs303x",
            internalMarks: 79,
            semesterMarks: 71,
            attendance: 82,
          },
          {
            subjectId: "cs304x",
            internalMarks: 85,
            semesterMarks: 81,
            attendance: 86,
          },
          {
            subjectId: "cs305x",
            internalMarks: 72,
            semesterMarks: 65,
            attendance: 77,
          },
          {
            subjectId: "cs306x",
            internalMarks: 68,
            semesterMarks: 65,
            attendance: 82,
          },
        ],
      },
      {
        semester: 4,
        status: "Completed",
        sgpa: 7.2,
        subjects: [
          {
            subjectId: "cs503",
            internalMarks: 76,
            semesterMarks: 71,
            attendance: 89,
          },
          {
            subjectId: "cs402",
            internalMarks: 77,
            semesterMarks: 68,
            attendance: 88,
          },
          {
            subjectId: "cs403",
            internalMarks: 70,
            semesterMarks: 63,
            attendance: 86,
          },
          {
            subjectId: "cs404",
            internalMarks: 82,
            semesterMarks: 77,
            attendance: 92,
          },
          {
            subjectId: "cs405",
            internalMarks: 68,
            semesterMarks: 62,
            attendance: 94,
          },
          {
            subjectId: "cs406",
            internalMarks: 71,
            semesterMarks: 67,
            attendance: 80,
          },
        ],
      },
      {
        semester: 5,
        status: "Completed",
        sgpa: 7.6,
        subjects: [
          {
            subjectId: "cs301",
            internalMarks: 80,
            semesterMarks: 76,
            attendance: 79,
          },
          {
            subjectId: "cs302",
            internalMarks: 67,
            semesterMarks: 67,
            attendance: 79,
          },
          {
            subjectId: "cs303",
            internalMarks: 79,
            semesterMarks: 73,
            attendance: 89,
          },
          {
            subjectId: "cs504",
            internalMarks: 78,
            semesterMarks: 73,
            attendance: 76,
          },
          {
            subjectId: "cs505",
            internalMarks: 80,
            semesterMarks: 77,
            attendance: 89,
          },
          {
            subjectId: "cs506",
            internalMarks: 72,
            semesterMarks: 68,
            attendance: 77,
          },
        ],
      },
      {
        semester: 6,
        status: "Completed",
        sgpa: 7.6,
        subjects: [
          {
            subjectId: "cs701",
            internalMarks: 78,
            semesterMarks: 71,
            attendance: 94,
          },
          {
            subjectId: "cs602",
            internalMarks: 74,
            semesterMarks: 65,
            attendance: 89,
          },
          {
            subjectId: "cs603",
            internalMarks: 81,
            semesterMarks: 79,
            attendance: 90,
          },
          {
            subjectId: "cs604",
            internalMarks: 72,
            semesterMarks: 68,
            attendance: 78,
          },
          {
            subjectId: "cs605",
            internalMarks: 73,
            semesterMarks: 73,
            attendance: 83,
          },
          {
            subjectId: "cs606",
            internalMarks: 72,
            semesterMarks: 69,
            attendance: 92,
          },
        ],
      },
      {
        semester: 7,
        status: "In Progress",
        sgpa: null,
        subjects: [
          {
            subjectId: "cs304",
            internalMarks: 69,
            semesterMarks: null,
            attendance: 72,
          },
          {
            subjectId: "cs702",
            internalMarks: 80,
            semesterMarks: null,
            attendance: 77,
          },
          {
            subjectId: "cs703",
            internalMarks: 85,
            semesterMarks: null,
            attendance: 89,
          },
          {
            subjectId: "cs704",
            internalMarks: 83,
            semesterMarks: null,
            attendance: 79,
          },
          {
            subjectId: "cs705",
            internalMarks: 82,
            semesterMarks: null,
            attendance: 95,
          },
          {
            subjectId: "cs706",
            internalMarks: 70,
            semesterMarks: null,
            attendance: 86,
          },
        ],
      },
    ],
  },
  {
    studentId: "s14", // Tanvi Pillai
    semesters: [
      {
        semester: 1,
        status: "Completed",
        sgpa: 5.1,
        subjects: [
          {
            subjectId: "cs101",
            internalMarks: 45,
            semesterMarks: 41,
            attendance: 61,
          },
          {
            subjectId: "cs102",
            internalMarks: 57,
            semesterMarks: 52,
            attendance: 72,
          },
          {
            subjectId: "cs103",
            internalMarks: 51,
            semesterMarks: 50,
            attendance: 58,
          },
          {
            subjectId: "cs104",
            internalMarks: 52,
            semesterMarks: 47,
            attendance: 60,
          },
          {
            subjectId: "cs105",
            internalMarks: 50,
            semesterMarks: 47,
            attendance: 72,
          },
          {
            subjectId: "cs106",
            internalMarks: 53,
            semesterMarks: 46,
            attendance: 63,
          },
        ],
      },
      {
        semester: 2,
        status: "Completed",
        sgpa: 5.4,
        subjects: [
          {
            subjectId: "cs201",
            internalMarks: 49,
            semesterMarks: 45,
            attendance: 58,
          },
          {
            subjectId: "cs202",
            internalMarks: 47,
            semesterMarks: 42,
            attendance: 68,
          },
          {
            subjectId: "cs203",
            internalMarks: 54,
            semesterMarks: 48,
            attendance: 59,
          },
          {
            subjectId: "cs204",
            internalMarks: 60,
            semesterMarks: 58,
            attendance: 61,
          },
          {
            subjectId: "cs205",
            internalMarks: 53,
            semesterMarks: 48,
            attendance: 62,
          },
          {
            subjectId: "cs206",
            internalMarks: 60,
            semesterMarks: 60,
            attendance: 70,
          },
        ],
      },
      {
        semester: 3,
        status: "Completed",
        sgpa: 5.3,
        subjects: [
          {
            subjectId: "cs301x",
            internalMarks: 52,
            semesterMarks: 50,
            attendance: 58,
          },
          {
            subjectId: "cs302x",
            internalMarks: 54,
            semesterMarks: 50,
            attendance: 62,
          },
          {
            subjectId: "cs303x",
            internalMarks: 56,
            semesterMarks: 55,
            attendance: 61,
          },
          {
            subjectId: "cs304x",
            internalMarks: 48,
            semesterMarks: 41,
            attendance: 61,
          },
          {
            subjectId: "cs305x",
            internalMarks: 55,
            semesterMarks: 49,
            attendance: 70,
          },
          {
            subjectId: "cs306x",
            internalMarks: 48,
            semesterMarks: 46,
            attendance: 58,
          },
        ],
      },
      {
        semester: 4,
        status: "Completed",
        sgpa: 5.2,
        subjects: [
          {
            subjectId: "cs503",
            internalMarks: 51,
            semesterMarks: 47,
            attendance: 62,
          },
          {
            subjectId: "cs402",
            internalMarks: 58,
            semesterMarks: 54,
            attendance: 70,
          },
          {
            subjectId: "cs403",
            internalMarks: 49,
            semesterMarks: 45,
            attendance: 58,
          },
          {
            subjectId: "cs404",
            internalMarks: 57,
            semesterMarks: 52,
            attendance: 64,
          },
          {
            subjectId: "cs405",
            internalMarks: 52,
            semesterMarks: 48,
            attendance: 63,
          },
          {
            subjectId: "cs406",
            internalMarks: 47,
            semesterMarks: 44,
            attendance: 60,
          },
        ],
      },
      {
        semester: 5,
        status: "In Progress",
        sgpa: null,
        subjects: [
          {
            subjectId: "cs301",
            internalMarks: 55,
            semesterMarks: null,
            attendance: 70,
          },
          {
            subjectId: "cs302",
            internalMarks: 58,
            semesterMarks: null,
            attendance: 68,
          },
          {
            subjectId: "cs303",
            internalMarks: 53,
            semesterMarks: null,
            attendance: 63,
          },
          {
            subjectId: "cs504",
            internalMarks: 56,
            semesterMarks: null,
            attendance: 77,
          },
          {
            subjectId: "cs505",
            internalMarks: 60,
            semesterMarks: null,
            attendance: 79,
          },
          {
            subjectId: "cs506",
            internalMarks: 57,
            semesterMarks: null,
            attendance: 76,
          },
        ],
      },
    ],
  },
  {
    studentId: "s18", // Simran Chatterjee
    semesters: [
      {
        semester: 1,
        status: "Completed",
        sgpa: 6.8,
        subjects: [
          {
            subjectId: "cs101",
            internalMarks: 71,
            semesterMarks: 71,
            attendance: 74,
          },
          {
            subjectId: "cs102",
            internalMarks: 76,
            semesterMarks: 69,
            attendance: 86,
          },
          {
            subjectId: "cs103",
            internalMarks: 65,
            semesterMarks: 64,
            attendance: 71,
          },
          {
            subjectId: "cs104",
            internalMarks: 62,
            semesterMarks: 59,
            attendance: 79,
          },
          {
            subjectId: "cs105",
            internalMarks: 76,
            semesterMarks: 67,
            attendance: 77,
          },
          {
            subjectId: "cs106",
            internalMarks: 60,
            semesterMarks: 56,
            attendance: 75,
          },
        ],
      },
      {
        semester: 2,
        status: "Completed",
        sgpa: 7,
        subjects: [
          {
            subjectId: "cs201",
            internalMarks: 75,
            semesterMarks: 74,
            attendance: 79,
          },
          {
            subjectId: "cs202",
            internalMarks: 76,
            semesterMarks: 72,
            attendance: 79,
          },
          {
            subjectId: "cs203",
            internalMarks: 68,
            semesterMarks: 61,
            attendance: 82,
          },
          {
            subjectId: "cs204",
            internalMarks: 61,
            semesterMarks: 55,
            attendance: 78,
          },
          {
            subjectId: "cs205",
            internalMarks: 61,
            semesterMarks: 58,
            attendance: 74,
          },
          {
            subjectId: "cs206",
            internalMarks: 76,
            semesterMarks: 73,
            attendance: 79,
          },
        ],
      },
      {
        semester: 3,
        status: "Completed",
        sgpa: 7,
        subjects: [
          {
            subjectId: "cs301x",
            internalMarks: 60,
            semesterMarks: 59,
            attendance: 82,
          },
          {
            subjectId: "cs302x",
            internalMarks: 74,
            semesterMarks: 74,
            attendance: 69,
          },
          {
            subjectId: "cs303x",
            internalMarks: 71,
            semesterMarks: 67,
            attendance: 71,
          },
          {
            subjectId: "cs304x",
            internalMarks: 77,
            semesterMarks: 69,
            attendance: 75,
          },
          {
            subjectId: "cs305x",
            internalMarks: 63,
            semesterMarks: 57,
            attendance: 69,
          },
          {
            subjectId: "cs306x",
            internalMarks: 73,
            semesterMarks: 71,
            attendance: 82,
          },
        ],
      },
      {
        semester: 4,
        status: "Completed",
        sgpa: 6.8,
        subjects: [
          {
            subjectId: "cs503",
            internalMarks: 71,
            semesterMarks: 67,
            attendance: 84,
          },
          {
            subjectId: "cs402",
            internalMarks: 70,
            semesterMarks: 65,
            attendance: 79,
          },
          {
            subjectId: "cs403",
            internalMarks: 71,
            semesterMarks: 71,
            attendance: 78,
          },
          {
            subjectId: "cs404",
            internalMarks: 73,
            semesterMarks: 64,
            attendance: 70,
          },
          {
            subjectId: "cs405",
            internalMarks: 63,
            semesterMarks: 55,
            attendance: 83,
          },
          {
            subjectId: "cs406",
            internalMarks: 69,
            semesterMarks: 69,
            attendance: 84,
          },
        ],
      },
      {
        semester: 5,
        status: "Completed",
        sgpa: 6.3,
        subjects: [
          {
            subjectId: "cs301",
            internalMarks: 61,
            semesterMarks: 53,
            attendance: 82,
          },
          {
            subjectId: "cs302",
            internalMarks: 65,
            semesterMarks: 57,
            attendance: 86,
          },
          {
            subjectId: "cs303",
            internalMarks: 61,
            semesterMarks: 61,
            attendance: 83,
          },
          {
            subjectId: "cs504",
            internalMarks: 67,
            semesterMarks: 67,
            attendance: 84,
          },
          {
            subjectId: "cs505",
            internalMarks: 62,
            semesterMarks: 53,
            attendance: 75,
          },
          {
            subjectId: "cs506",
            internalMarks: 63,
            semesterMarks: 57,
            attendance: 84,
          },
        ],
      },
      {
        semester: 6,
        status: "Completed",
        sgpa: 6.5,
        subjects: [
          {
            subjectId: "cs701",
            internalMarks: 68,
            semesterMarks: 63,
            attendance: 82,
          },
          {
            subjectId: "cs602",
            internalMarks: 70,
            semesterMarks: 66,
            attendance: 88,
          },
          {
            subjectId: "cs603",
            internalMarks: 63,
            semesterMarks: 58,
            attendance: 72,
          },
          {
            subjectId: "cs604",
            internalMarks: 68,
            semesterMarks: 63,
            attendance: 86,
          },
          {
            subjectId: "cs605",
            internalMarks: 59,
            semesterMarks: 54,
            attendance: 69,
          },
          {
            subjectId: "cs606",
            internalMarks: 59,
            semesterMarks: 55,
            attendance: 76,
          },
        ],
      },
      {
        semester: 7,
        status: "In Progress",
        sgpa: null,
        subjects: [
          {
            subjectId: "cs304",
            internalMarks: 71,
            semesterMarks: null,
            attendance: 84,
          },
          {
            subjectId: "cs702",
            internalMarks: 68,
            semesterMarks: null,
            attendance: 85,
          },
          {
            subjectId: "cs703",
            internalMarks: 72,
            semesterMarks: null,
            attendance: 88,
          },
          {
            subjectId: "cs704",
            internalMarks: 66,
            semesterMarks: null,
            attendance: 80,
          },
          {
            subjectId: "cs705",
            internalMarks: 74,
            semesterMarks: null,
            attendance: 90,
          },
          {
            subjectId: "cs706",
            internalMarks: 69,
            semesterMarks: null,
            attendance: 83,
          },
        ],
      },
    ],
  },
];

export function getStudentAcademics(studentId: string) {
  return studentAcademics.find((a) => a.studentId === studentId);
}
