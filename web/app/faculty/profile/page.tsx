import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getFacultyProfileDetail } from "@/lib/api/faculty-profile";
import { getCurriculumInsightsWorkspace } from "@/lib/api/curriculum-insights";
import { getTimetableView } from "@/lib/api/timetable";
import { getFacultyProfile } from "@/lib/api/analytics";
import { FacultyProfileClient } from "@/components/faculty/profile/FacultyProfileClient";
import {
  isProfileTab,
  type FacultyProfileView,
  type TeachingSubject,
} from "@/components/faculty/profile/utils";

// The faculty member's one profile page: who they are, what they teach, their
// research, and their account settings. Every number is worked out here, on
// the server, by the same functions the curriculum, students and timetable
// pages use, then handed to a single client component. No clock is read here.

// Ongoing work leads; everything else keeps the order it is written in.
const PROJECT_ORDER = ["Ongoing", "Completed", "Under Review"] as const;

export default async function FacultyProfilePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const [detail, insights, timetable, focus] = await Promise.all([
    getFacultyProfileDetail(),
    getCurriculumInsightsWorkspace(),
    getTimetableView(),
    getFacultyProfile(),
  ]);

  // ?tab= opens a tab, but only one the page has; anything else is Overview.
  const requestedTab = searchParams?.tab;
  const initialTab = isProfileTab(requestedTab) ? requestedTab : "overview";

  const insightById = new Map(insights.subjects.map((s) => [s.id, s]));
  const hoursById = new Map(timetable.perSubjectHours.map((s) => [s.id, s.hours]));

  const subjects: TeachingSubject[] = detail.subjects.map((subject) => {
    const insight = insightById.get(subject.id);
    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      credits: subject.credits,
      enrolled: insight?.enrolled ?? null,
      alignmentScore: insight?.alignmentScore ?? null,
      weeklyHours: hoursById.get(subject.id) ?? null,
    };
  });

  const view: FacultyProfileView = {
    record: detail.profile,
    publications: [...detail.profile.publications].sort((a, b) => b.year - a.year),
    projects: [...detail.profile.projects].sort(
      (a, b) => PROJECT_ORDER.indexOf(a.status) - PROJECT_ORDER.indexOf(b.status),
    ),
    totalCitations: detail.totalCitations,
    subjects,
    stats: {
      subjectCount: subjects.length,
      trackedStudents: insights.trackedStudents,
      enrolledStudents: insights.enrolledStudents,
      overallAlignment: insights.overallAlignment,
      weeklyTeachingHours: timetable.summary.teachingHours,
    },
    hours: {
      theoryHours: timetable.summary.theoryHours,
      labHours: timetable.summary.labHours,
      perSubject: timetable.perSubjectHours,
    },
    focus: {
      industryExposure: focus.industryExposure,
      recommendedProgram: focus.recommendedProgram,
      developmentProgram: focus.facultyDevelopmentProgram,
    },
  };

  return (
    <DashboardShell title="Faculty Profile">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Profile" },
        ]}
      />

      <FacultyProfileClient view={view} initialTab={initialTab} />
    </DashboardShell>
  );
}
