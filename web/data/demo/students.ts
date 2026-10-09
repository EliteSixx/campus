import type { DemoStudent } from "./types";

// ST001 and ST104 match contracts/examples/student.json and student-at-risk.json.
export const demoStudents: DemoStudent[] = [
  {
    student_id: "ST001", branch: "CSE", cgpa: 8.2, backlogs: 0, graduation_year: 2027,
    skills: ["Python", "SQL", "Git", "Docker", "REST APIs"], certifications: [],
    projects: [{ title: "Library API", tech: ["Python", "FastAPI", "SQL"], description: "REST backend for a college library system" }],
    aptitude_score: 72, communication_score: 65, mock_interview_score: null, is_synthetic: true,
  },
  {
    student_id: "ST104", branch: "CSE", cgpa: 6.1, backlogs: 2, graduation_year: 2027,
    skills: ["Python", "HTML"], certifications: [], projects: [],
    aptitude_score: 45, communication_score: 50, mock_interview_score: 38, is_synthetic: true,
  },
  {
    student_id: "ST002", branch: "IT", cgpa: 7.8, backlogs: 0, graduation_year: 2027,
    skills: ["Java", "SQL", "Spring Boot", "Git", "Docker"], certifications: ["Oracle Java Foundations"],
    projects: [{ title: "Inventory Service", tech: ["Java", "Spring Boot", "SQL"] }],
    aptitude_score: 78, communication_score: 72, mock_interview_score: 74, is_synthetic: true,
  },
  {
    student_id: "ST003", branch: "ECE", cgpa: 7.3, backlogs: 0, graduation_year: 2027,
    skills: ["C", "C++", "Embedded Systems", "Arduino", "Python"], certifications: [],
    projects: [{ title: "Smart Irrigation", tech: ["C++", "Arduino", "IoT"] }],
    aptitude_score: 69, communication_score: 75, mock_interview_score: null, is_synthetic: true,
  },
  {
    student_id: "ST004", branch: "EEE", cgpa: 8.7, backlogs: 0, graduation_year: 2027,
    skills: ["MATLAB", "Power Systems", "Python", "PLC"], certifications: ["MATLAB Onramp"],
    projects: [{ title: "Load Forecasting", tech: ["MATLAB", "Python"] }],
    aptitude_score: 84, communication_score: 79, mock_interview_score: 82, is_synthetic: true,
  },
  {
    student_id: "ST005", branch: "ME", cgpa: 6.9, backlogs: 1, graduation_year: 2027,
    skills: ["AutoCAD", "SolidWorks", "Thermodynamics", "MATLAB"], certifications: [],
    projects: [{ title: "Heat Exchanger Study", tech: ["SolidWorks", "Thermodynamics"] }],
    aptitude_score: 61, communication_score: 68, mock_interview_score: 60, is_synthetic: true,
  },
  {
    student_id: "ST006", branch: "CE", cgpa: 9.1, backlogs: 0, graduation_year: 2027,
    skills: ["AutoCAD", "Revit", "BIM", "Structural Analysis", "Excel"], certifications: ["Autodesk Revit Basics"],
    projects: [{ title: "Campus BIM Model", tech: ["Revit", "BIM", "AutoCAD"] }],
    aptitude_score: 91, communication_score: 86, mock_interview_score: 88, is_synthetic: true,
  },
  {
    student_id: "ST007", branch: "CSE", cgpa: 7.0, backlogs: 0, graduation_year: 2027,
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"], certifications: [],
    projects: [{ title: "Event Board", tech: ["React", "Node.js", "MongoDB"] }],
    aptitude_score: 74, communication_score: 82, mock_interview_score: 71, is_synthetic: true,
  },
  {
    student_id: "ST008", branch: "IT", cgpa: 8.0, backlogs: 0, graduation_year: 2027,
    skills: ["Python", "Machine Learning", "Pandas", "SQL", "AWS"], certifications: ["AWS Cloud Practitioner"],
    projects: [{ title: "Demand Forecast", tech: ["Python", "Pandas", "Machine Learning"] }],
    aptitude_score: 82, communication_score: 70, mock_interview_score: 77, is_synthetic: true,
  },
  {
    student_id: "ST009", branch: "ECE", cgpa: 6.5, backlogs: 2, graduation_year: 2027,
    skills: ["Verilog", "VLSI", "C", "Linux"], certifications: [],
    projects: [{ title: "RTL Counter", tech: ["Verilog", "VLSI"] }],
    aptitude_score: 56, communication_score: 59, mock_interview_score: null, is_synthetic: true,
  },
  {
    student_id: "ST010", branch: "ME", cgpa: 7.6, backlogs: 0, graduation_year: 2027,
    skills: ["CATIA", "ANSYS", "Manufacturing", "Project Management"], certifications: [],
    projects: [{ title: "Lightweight Bracket", tech: ["CATIA", "ANSYS"] }],
    aptitude_score: 73, communication_score: 77, mock_interview_score: 79, is_synthetic: true,
  },
];

export const demoStudentsById = Object.fromEntries(demoStudents.map((student) => [student.student_id, student]));
