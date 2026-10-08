import { DashboardShell } from "@/components/shared/dashboard-shell";
import { getFacultyDashboardData } from "@/lib/api/faculty-dashboard";
import { FacultyDashboardClient } from "@/components/faculty/dashboard/FacultyDashboardClient";
import { CurriculumSnapshot } from "@/components/faculty/dashboard/CurriculumSnapshot";
import { SkillGapsAndRecommendation } from "@/components/faculty/dashboard/SkillGapsAndRecommendation";

// The faculty home screen. All data is collected on the server in one call;
// rows 1–5 depend on this browser's storage and the clock, so they render in a
// client component, while rows 6–7 are static and stay server-rendered.
//
// No clock is read here — "today" is decided in the browser.

export default async function FacultyDashboardPage() {
  const data = await getFacultyDashboardData();

  return (
    <DashboardShell title="Faculty Dashboard">
      {/* Only the fields rows 1–5 use are sent to the browser. */}
      <FacultyDashboardClient
        data={{
          faculty: data.faculty,
          stats: data.stats,
          timetable: data.timetable,
          assignments: data.assignments,
          plannerProgress: data.plannerProgress,
          materialsCoverage: data.materialsCoverage,
          recentAnnouncements: data.recentAnnouncements,
          draftAnnouncementsCount: data.draftAnnouncementsCount,
          conversations: data.conversations,
          attentionStudents: data.attentionStudents,
        }}
      />

      <CurriculumSnapshot
        subjects={data.subjectAlignment}
        topMissingSkills={data.topMissingSkills}
        totalPostings={data.totalPostings}
        topicsWithoutDemand={data.stats.topicsWithoutDemandCount}
      />

      <SkillGapsAndRecommendation
        gaps={data.studentSkillGaps}
        cohortSize={data.stats.cohortStudentsCount}
        recommendation={data.recommendation}
      />
    </DashboardShell>
  );
}
