export interface ProgrammeSubject {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
}

export const programmeSubjects: ProgrammeSubject[] = [
  // Semester 1
  {
    id: "cs101",
    code: "CSE101",
    name: "C Programming",
    semester: 1,
    credits: 4,
  },
  {
    id: "cs102",
    code: "CSE102",
    name: "Basic Electrical Engineering",
    semester: 1,
    credits: 3,
  },
  {
    id: "cs103",
    code: "CSE103",
    name: "Mathematics I",
    semester: 1,
    credits: 4,
  },
  { id: "cs104", code: "CSE104", name: "Physics", semester: 1, credits: 4 },
  {
    id: "cs105",
    code: "CSE105",
    name: "Universal Human Values",
    semester: 1,
    credits: 2,
  },
  {
    id: "cs106",
    code: "CSE106",
    name: "Python Programming",
    semester: 1,
    credits: 3,
  },
  // Semester 2
  {
    id: "cs201",
    code: "CSE201",
    name: "Web Development",
    semester: 2,
    credits: 3,
  },
  { id: "cs202", code: "CSE202", name: "Chemistry", semester: 2, credits: 4 },
  {
    id: "cs203",
    code: "CSE203",
    name: "Mathematics II",
    semester: 2,
    credits: 4,
  },
  {
    id: "cs204",
    code: "CSE204",
    name: "Basic Electronics",
    semester: 2,
    credits: 3,
  },
  {
    id: "cs205",
    code: "CSE205",
    name: "English & Communication",
    semester: 2,
    credits: 2,
  },
  {
    id: "cs206",
    code: "CSE206",
    name: "Programming in Java",
    semester: 2,
    credits: 4,
  },
  // Semester 3
  {
    id: "cs301x",
    code: "CSE301",
    name: "OOPs in Java",
    semester: 3,
    credits: 4,
  },
  {
    id: "cs302x",
    code: "CSE302",
    name: "Data Structures & Algorithms in C",
    semester: 3,
    credits: 4,
  },
  {
    id: "cs303x",
    code: "CSE303",
    name: "Digital Electronics",
    semester: 3,
    credits: 3,
  },
  {
    id: "cs304x",
    code: "CSE304",
    name: "Machine Learning in Python",
    semester: 3,
    credits: 3,
  },
  {
    id: "cs305x",
    code: "CSE305",
    name: "Mathematics III",
    semester: 3,
    credits: 4,
  },
  {
    id: "cs306x",
    code: "CSE306",
    name: "Engineering Economics",
    semester: 3,
    credits: 2,
  },
  // Semester 4
  {
    id: "cs503",
    code: "CSE401",
    name: "Theory of Computation",
    semester: 4,
    credits: 3,
  },
  {
    id: "cs402",
    code: "CSE402",
    name: "Computer Organisation & Architecture",
    semester: 4,
    credits: 4,
  },
  {
    id: "cs403",
    code: "CSE403",
    name: "Discrete Mathematics",
    semester: 4,
    credits: 3,
  },
  {
    id: "cs404",
    code: "CSE404",
    name: "Design & Analysis of Algorithms",
    semester: 4,
    credits: 4,
  },
  {
    id: "cs405",
    code: "CSE405",
    name: "Software Engineering",
    semester: 4,
    credits: 3,
  },
  {
    id: "cs406",
    code: "CSE406",
    name: "Probability & Statistics",
    semester: 4,
    credits: 3,
  },
  // Semester 5
  {
    id: "cs301",
    code: "CSE501",
    name: "Database Management Systems",
    semester: 5,
    credits: 4,
  },
  {
    id: "cs302",
    code: "CSE502",
    name: "Computer Networks",
    semester: 5,
    credits: 4,
  },
  {
    id: "cs303",
    code: "CSE503",
    name: "Operating Systems",
    semester: 5,
    credits: 4,
  },
  {
    id: "cs504",
    code: "CSE504",
    name: "Microprocessors & Interfacing",
    semester: 5,
    credits: 3,
  },
  {
    id: "cs505",
    code: "CSE505",
    name: "Professional Ethics",
    semester: 5,
    credits: 2,
  },
  {
    id: "cs506",
    code: "CSE506",
    name: "Minor Project I",
    semester: 5,
    credits: 2,
  },
  // Semester 6
  {
    id: "cs701",
    code: "CSE601",
    name: "Distributed Systems",
    semester: 6,
    credits: 4,
  },
  {
    id: "cs602",
    code: "CSE602",
    name: "Compiler Design",
    semester: 6,
    credits: 4,
  },
  {
    id: "cs603",
    code: "CSE603",
    name: "Artificial Intelligence",
    semester: 6,
    credits: 4,
  },
  {
    id: "cs604",
    code: "CSE604",
    name: "Computer Graphics",
    semester: 6,
    credits: 3,
  },
  {
    id: "cs605",
    code: "CSE605",
    name: "Information Security",
    semester: 6,
    credits: 3,
  },
  {
    id: "cs606",
    code: "CSE606",
    name: "Open Elective I",
    semester: 6,
    credits: 3,
  },
  // Semester 7
  {
    id: "cs304",
    code: "CSE701",
    name: "Web Technologies",
    semester: 7,
    credits: 3,
  },
  {
    id: "cs702",
    code: "CSE702",
    name: "Big Data Analytics",
    semester: 7,
    credits: 4,
  },
  {
    id: "cs703",
    code: "CSE703",
    name: "Internet of Things",
    semester: 7,
    credits: 3,
  },
  {
    id: "cs704",
    code: "CSE704",
    name: "Professional Elective II",
    semester: 7,
    credits: 3,
  },
  {
    id: "cs705",
    code: "CSE705",
    name: "Major Project Phase I",
    semester: 7,
    credits: 4,
  },
  {
    id: "cs706",
    code: "CSE706",
    name: "Industrial Training Seminar",
    semester: 7,
    credits: 2,
  },
  // Semester 8
  {
    id: "cs801",
    code: "CSE801",
    name: "Major Project Phase II",
    semester: 8,
    credits: 8,
  },
  {
    id: "cs802",
    code: "CSE802",
    name: "Professional Elective III",
    semester: 8,
    credits: 3,
  },
  {
    id: "cs803",
    code: "CSE803",
    name: "Professional Elective IV",
    semester: 8,
    credits: 3,
  },
  {
    id: "cs804",
    code: "CSE804",
    name: "Industry Internship",
    semester: 8,
    credits: 4,
  },
  {
    id: "cs805",
    code: "CSE805",
    name: "Comprehensive Viva",
    semester: 8,
    credits: 2,
  },
  {
    id: "cs806",
    code: "CSE806",
    name: "Technical Seminar",
    semester: 8,
    credits: 2,
  },
];

export function getProgrammeSubject(id: string) {
  return programmeSubjects.find((s) => s.id === id);
}

export function subjectsForSemester(semester: number) {
  return programmeSubjects.filter((s) => s.semester === semester);
}
