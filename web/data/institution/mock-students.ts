import type { InstitutionStudent, PlacementStatus } from "./types";

// ─── Deterministic student generation ────────────────────────────────

const firstNames = [
  "Rudy", "Ananya", "Kabir", "Meera", "Arjun", "Ishita", "Rohan", "Sanya",
  "Devansh", "Priya", "Vikram", "Nisha", "Aarav", "Tanvi", "Karan", "Riya",
  "Yash", "Simran", "Aditya", "Neha", "Harsh", "Divya", "Rahul", "Pooja",
  "Akash", "Sneha", "Varun", "Ankita", "Nitin", "Shalini", "Manav", "Shruti",
  "Gaurav", "Pallavi", "Piyush", "Ritika", "Mayank", "Anjali", "Sahil", "Komal",
];

const lastNames = [
  "Sharma", "Iyer", "Kapoor", "Nair", "Reddy", "Gupta", "Chauhan", "Das",
  "Menon", "Verma", "Singh", "Rao", "Bansal", "Joshi", "Malhotra", "Pillai",
  "Agarwal", "Kaur", "Bhat", "Chatterjee", "Patel", "Sinha", "Thakur", "Mishra",
  "Dubey", "Yadav", "Saxena", "Shukla", "Tiwari", "Pandey", "Rane", "Desai",
  "Hegde", "Kulkarni", "Patil", "Chawla", "Mehra", "Dutta", "Ghosh", "Roy",
];

const goals = [
  "Backend Engineer", "Cloud Engineer", "Frontend Developer", "Security Analyst",
  "Data Engineer", "ML Engineer", "Full Stack Developer", "DevOps Engineer",
  "Product Manager", "QA Engineer",
];

const skillSets: Record<string, { name: string; score: number }[][]> = {
  cse: [
    [{ name: "Python", score: 78 }, { name: "React", score: 72 }, { name: "Git", score: 82 }],
    [{ name: "Java", score: 68 }, { name: "SQL", score: 65 }, { name: "Docker", score: 28 }],
    [{ name: "Python", score: 85 }, { name: "Node.js", score: 58 }, { name: "AWS", score: 22 }],
    [{ name: "C++", score: 62 }, { name: "Data Structures", score: 71 }, { name: "Linux", score: 52 }],
    [{ name: "React", score: 80 }, { name: "TypeScript", score: 75 }, { name: "REST APIs", score: 61 }],
  ],
  it: [
    [{ name: "Python", score: 70 }, { name: "Networking", score: 58 }, { name: "Cybersecurity", score: 52 }],
    [{ name: "Node.js", score: 55 }, { name: "SQL", score: 58 }, { name: "Linux", score: 42 }],
    [{ name: "Java", score: 62 }, { name: "Git", score: 72 }, { name: "Cloud", score: 30 }],
  ],
  ece: [
    [{ name: "C++", score: 58 }, { name: "Python", score: 48 }, { name: "Linux", score: 45 }],
    [{ name: "Networking", score: 52 }, { name: "C++", score: 55 }, { name: "MATLAB", score: 62 }],
  ],
  ds: [
    [{ name: "Python", score: 82 }, { name: "SQL", score: 75 }, { name: "Statistics", score: 78 }],
    [{ name: "Python", score: 88 }, { name: "PostgreSQL", score: 68 }, { name: "ML", score: 72 }],
    [{ name: "R", score: 65 }, { name: "Python", score: 80 }, { name: "Visualization", score: 70 }],
  ],
  me: [
    [{ name: "Problem Solving", score: 62 }, { name: "Communication", score: 58 }, { name: "Python", score: 32 }],
    [{ name: "AutoCAD", score: 70 }, { name: "Excel", score: 65 }, { name: "C++", score: 28 }],
  ],
  ee: [
    [{ name: "C++", score: 48 }, { name: "Python", score: 38 }, { name: "Networking", score: 42 }],
    [{ name: "MATLAB", score: 55 }, { name: "Linux", score: 35 }, { name: "IoT", score: 45 }],
  ],
};

const depts: { id: string; name: string; count: number; prefix: string }[] = [
  { id: "cse", name: "Computer Science & Engineering", count: 180, prefix: "CSE" },
  { id: "it", name: "Information Technology", count: 120, prefix: "IT" },
  { id: "ece", name: "Electronics & Communication", count: 90, prefix: "ECE" },
  { id: "ds", name: "Data Science & AI", count: 60, prefix: "DS" },
  { id: "me", name: "Mechanical Engineering", count: 75, prefix: "ME" },
  { id: "ee", name: "Electrical Engineering", count: 70, prefix: "EE" },
];

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

function generateStudents(): InstitutionStudent[] {
  const students: InstitutionStudent[] = [];
  let globalIdx = 0;

  for (const dept of depts) {
    const deptSkills = skillSets[dept.id] || skillSets.cse;

    for (let i = 0; i < dept.count; i++) {
      const rand = seededRand(globalIdx * 37 + 13);
      const firstIdx = Math.floor(rand() * firstNames.length);
      const lastIdx = Math.floor(rand() * lastNames.length);
      const name = `${firstNames[firstIdx]} ${lastNames[lastIdx]}`;
      const year = ["2nd Year", "3rd Year", "4th Year"][Math.floor(rand() * 3)];
      const goalIdx = Math.floor(rand() * goals.length);
      const skillReadiness = Math.floor(rand() * 65) + 20; // 20-84
      const employabilityScore = Math.floor(rand() * 60) + 25; // 25-84

      // Placement status correlated with readiness
      let placementStatus: PlacementStatus;
      if (skillReadiness >= 70 && rand() > 0.3) {
        placementStatus = rand() > 0.5 ? "placed" : "interning";
      } else if (skillReadiness >= 45) {
        placementStatus = "seeking";
      } else {
        placementStatus = rand() > 0.4 ? "seeking" : "not-assessed";
      }

      const skillSetIdx = Math.floor(rand() * deptSkills.length);
      const baseSkills = deptSkills[skillSetIdx];
      // Add variance to each student's skill scores
      const topSkills = baseSkills.map(s => ({
        name: s.name,
        score: Math.min(100, Math.max(5, s.score + Math.floor(rand() * 20) - 10)),
      }));

      const assessedMonth = Math.floor(rand() * 8) + 1;
      const assessedDate = placementStatus === "not-assessed"
        ? null
        : `2026-${String(assessedMonth).padStart(2, "0")}-${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}`;

      const emailFirst = firstNames[firstIdx].toLowerCase();
      const emailLast = lastNames[lastIdx].toLowerCase();

      const cgpa = 5.0 + Math.floor(rand() * 50) / 10; // 5.0 to 9.9
      const activeBacklogs = rand() > 0.85 ? Math.floor(rand() * 4) + 1 : 0; // 15% have 1-4 backlogs
      const offerCount = placementStatus === "placed" ? (rand() > 0.8 ? 2 : 1) : 0;

      students.push({
        regId: `${dept.prefix}${String(2026)}${String(i + 1).padStart(3, "0")}`,
        name,
        department: dept.name,
        deptId: dept.id,
        year,
        email: `${emailFirst}.${emailLast}@university.edu`,
        careerGoal: goals[goalIdx],
        skillReadiness,
        employabilityScore,
        placementStatus,
        topSkills,
        assessedDate,
        cgpa,
        activeBacklogs,
        offerCount,
      });

      globalIdx++;
    }
  }

  return students;
}

export const institutionStudents: InstitutionStudent[] = generateStudents();

export function getStudentsByDepartment(deptId: string): InstitutionStudent[] {
  return institutionStudents.filter(s => s.deptId === deptId);
}

export function getStudentByRegId(regId: string): InstitutionStudent | undefined {
  return institutionStudents.find(s => s.regId === regId);
}
