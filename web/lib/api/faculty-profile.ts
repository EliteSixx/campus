import { facultyProfileDetail } from "@/data/faculty-profile";
import { getSubjectById } from "@/data/curriculum";
import type { FacultyProfileDetail } from "@/data/faculty-profile";

// The logged-in faculty member's own profile, with the subject ids on the
// record resolved against data/curriculum.ts so the page can link each one
// through to its alignment analysis.

export interface ProfileSubject {
  id: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
}

export interface FacultyProfileSummary {
  profile: FacultyProfileDetail;
  subjects: ProfileSubject[];
  publicationCount: number;
  totalCitations: number;
  ongoingProjectCount: number;
  // A count of funded projects, not a sum of money. The funding figures are
  // display strings ("₹14.6 lakh"), and parsing them back into numbers would
  // invent a total the data does not actually state.
  totalFunding: number;
}

export async function getFacultyProfileDetail(): Promise<FacultyProfileSummary> {
  const profile = facultyProfileDetail;

  const subjects: ProfileSubject[] = profile.subjectIds.flatMap((id) => {
    const subject = getSubjectById(id);
    if (!subject) return [];
    return [
      {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        semester: subject.semester,
        credits: subject.credits,
      },
    ];
  });

  return {
    profile,
    subjects,
    publicationCount: profile.publications.length,
    totalCitations: profile.publications.reduce(
      (sum, p) => sum + p.citations,
      0,
    ),
    ongoingProjectCount: profile.projects.filter((p) => p.status === "Ongoing")
      .length,
    totalFunding: profile.projects.length,
  };
}
