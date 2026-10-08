// Per-student records the faculty roster joins onto data/students.ts: roll
// number, internships and pre-placement offers.
//
// Marks, attendance, semesters and CGPA are NOT stored here. The only source
// for those is data/student-academics.ts, read through lib/api/academics.ts.

export type InternshipStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview Scheduled"
  | "Selected"
  | "Ongoing"
  | "Completed"
  | "Not Selected";

export type OfferStatus =
  | "Offered"
  | "Accepted"
  | "Under Review"
  | "Not Offered";

export interface PrePlacementOffer {
  // "ppo1", "ppo2"… — a separate id space from the posting ids in
  // data/opportunities.ts ("o1", "o2"…).
  id: string;
  company: string;
  role: string;
  status: OfferStatus;
  package?: string;
  decisionBy: string;
  fromInternshipId: string;
}

export interface InternshipCertificate {
  credentialId: string;
  issuer: string;
  issuedOn: string;
  verified: boolean;
}

export interface CompletionReport {
  mentor: string;
  mentorRating: number;
  summary: string;
  skillsApplied: string[];
  skillsLearned: string[];
}

export interface InternshipRecord {
  id: string;
  company: string;
  role: string;
  status: InternshipStatus;
  appliedOn: string;
  durationWeeks?: number;
  stipend?: string;
  report?: CompletionReport;
  certificate?: InternshipCertificate;
}

export interface StudentRecord {
  studentId: string;
  rollNumber: string;
  // Newest application first. lib/api/faculty-roster.ts reads the head as the
  // student's current application.
  internships: InternshipRecord[];
  offers: PrePlacementOffer[];
}

export const studentRecords: StudentRecord[] = [
  {
    studentId: "s1",
    rollNumber: "CSE24B1042",
    internships: [
      {
        id: "i2",
        company: "Razorpay",
        role: "Backend Engineering Intern",
        status: "Interview Scheduled",
        appliedOn: "Aug 2026",
      },
      {
        id: "i1",
        company: "TechNova Solutions",
        role: "Software Engineering Intern",
        status: "Completed",
        appliedOn: "Feb 2025",
        durationWeeks: 10,
        stipend: "₹15,000/month",
        report: {
          mentor: "Sandeep Kulkarni, Engineering Manager",
          mentorRating: 4,
          summary:
            "Built and deployed 12 REST endpoints for the client analytics dashboard, cut query response time by 35% through indexing work, and wrote unit tests reaching 85% coverage.",
          skillsApplied: ["python", "fastapi", "postgresql", "git"],
          skillsLearned: ["docker", "rest-apis"],
        },
        certificate: {
          credentialId: "TNS-INT-2025-0412",
          issuer: "TechNova Solutions",
          issuedOn: "Jul 2025",
          verified: true,
        },
      },
    ],
    offers: [],
  },
  {
    studentId: "s2",
    rollNumber: "CSE24B1008",
    internships: [
      {
        id: "i3",
        company: "Zoho",
        role: "Application Developer Intern",
        status: "Applied",
        appliedOn: "Sep 2026",
      },
    ],
    offers: [],
  },
  {
    studentId: "s6",
    rollNumber: "CSE23B0917",
    internships: [
      {
        id: "i4",
        company: "Mu Sigma",
        role: "Data Engineering Intern",
        status: "Ongoing",
        appliedOn: "Jun 2026",
        durationWeeks: 12,
        stipend: "₹20,000/month",
      },
      {
        id: "i5",
        company: "Swiggy",
        role: "Analytics Intern",
        status: "Not Selected",
        appliedOn: "Mar 2026",
      },
    ],
    offers: [],
  },
  {
    studentId: "s10",
    rollNumber: "CSE23B0631",
    internships: [
      {
        id: "i7",
        company: "Cisco",
        role: "Network Security Intern",
        status: "Not Selected",
        appliedOn: "Mar 2026",
      },
      {
        id: "i6",
        company: "Quick Heal Technologies",
        role: "Security Analyst Intern",
        status: "Completed",
        appliedOn: "Feb 2026",
        durationWeeks: 16,
        stipend: "₹25,000/month",
        report: {
          mentor: "Nandita Sen, Security Lead",
          mentorRating: 5,
          summary:
            "Ran vulnerability assessments across 3 internal services, documented 14 findings with remediation steps, and automated a weekly network scan pipeline.",
          skillsApplied: ["cybersecurity", "networking", "linux"],
          skillsLearned: ["pen-testing", "cryptography"],
        },
        certificate: {
          credentialId: "QHT-SEC-2026-0088",
          issuer: "Quick Heal Technologies",
          issuedOn: "Aug 2026",
          verified: true,
        },
      },
    ],
    offers: [
      {
        id: "ppo1",
        company: "Quick Heal Technologies",
        role: "Associate Security Engineer",
        status: "Accepted",
        package: "₹8.5 LPA",
        decisionBy: "Accepted Aug 2026",
        fromInternshipId: "i6",
      },
    ],
  },
  {
    studentId: "s14",
    rollNumber: "CSE24B1119",
    internships: [
      {
        id: "i9",
        company: "Zeta",
        role: "UI Engineering Intern",
        status: "Applied",
        appliedOn: "Sep 2026",
      },
      {
        id: "i8",
        company: "Freshworks",
        role: "Frontend Intern",
        status: "Shortlisted",
        appliedOn: "Aug 2026",
      },
    ],
    offers: [],
  },
  {
    studentId: "s18",
    rollNumber: "CSE23B0845",
    internships: [
      {
        id: "i10",
        company: "Persistent Systems",
        role: "Cloud Operations Intern",
        status: "Completed",
        appliedOn: "Mar 2026",
        durationWeeks: 8,
        stipend: "₹12,000/month",
        report: {
          mentor: "Arun Bhaskar, Cloud Architect",
          mentorRating: 4,
          summary:
            "Supported migration of 6 legacy services onto managed container infrastructure and authored the internal runbook now used by the operations team.",
          skillsApplied: ["linux", "networking", "communication"],
          skillsLearned: ["docker", "cloud-computing", "ci-cd"],
        },
        certificate: {
          credentialId: "PS-CLD-2026-0233",
          issuer: "Persistent Systems",
          issuedOn: "Jul 2026",
          verified: true,
        },
      },
    ],
    offers: [
      {
        id: "ppo2",
        company: "Persistent Systems",
        role: "Cloud Engineer Trainee",
        status: "Under Review",
        decisionBy: "Decision expected Oct 2026",
        fromInternshipId: "i10",
      },
    ],
  },
];

export function getStudentRecord(studentId: string) {
  return studentRecords.find((r) => r.studentId === studentId);
}
