import { BookOpen, Briefcase } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/faculty/breadcrumb";
import { getCurriculumInsightsWorkspace } from "@/lib/api/curriculum-insights";
import { CurriculumStatCards } from "@/components/faculty/curriculum/CurriculumStatCards";
import { AlignmentExplainer } from "@/components/faculty/curriculum/AlignmentExplainer";
import { SkillCoverageMatrix } from "@/components/faculty/curriculum/SkillCoverageMatrix";
import { SharedGapsCard } from "@/components/faculty/curriculum/SharedGapsCard";
import { QuickWinsCard } from "@/components/faculty/curriculum/QuickWinsCard";
import { SubjectOverviewList } from "@/components/faculty/curriculum/SubjectOverviewList";

// Curriculum analysis overview. Everything comes from one server call; the
// only browser-side state is sorting, the quick-wins toggle and reading saved
// revision drafts. No clock is read here.

export default async function FacultySubjectsPage() {
  const ws = await getCurriculumInsightsWorkspace();

  const subjectRefs = ws.subjects.map((s) => ({
    id: s.id,
    code: s.code,
    alignmentScore: s.alignmentScore,
  }));

  return (
    <DashboardShell title="Curriculum Analysis">
      <Breadcrumb
        items={[
          { label: "Faculty", href: "/dashboard/faculty" },
          { label: "Curriculum Analysis" },
        ]}
      />

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold text-ink">
                Curriculum vs Industry Demand
              </h2>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              Every subject you teach, checked against {ws.totalPostings} live
              postings. Find the gaps, see which change helps most, and draft a
              revised syllabus.
            </p>
          </div>
          <Badge tone="accent">
            <Briefcase className="h-3 w-3" aria-hidden="true" />
            {ws.totalPostings} postings analysed
          </Badge>
        </div>
      </Card>

      <CurriculumStatCards
        overallAlignment={ws.overallAlignment}
        subjectCount={ws.subjectCount}
        semesters={ws.subjects.map((s) => s.semester)}
        enrolledStudents={ws.enrolledStudents}
        trackedStudents={ws.trackedStudents}
        totalOutdatedTopics={ws.totalOutdatedTopics}
        totalOutdatedHours={ws.totalOutdatedHours}
      />

      <AlignmentExplainer
        subjects={ws.subjects}
        skills={ws.skills}
        postings={ws.postings}
        totalPostings={ws.totalPostings}
      />

      <SkillCoverageMatrix
        matrix={ws.matrix}
        subjects={subjectRefs}
        skills={ws.skills}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SharedGapsCard
          sharedGaps={ws.sharedGaps}
          subjects={subjectRefs}
          quickWins={ws.quickWins}
          totalPostings={ws.totalPostings}
        />
        <QuickWinsCard
          quickWins={ws.quickWins}
          totalPostings={ws.totalPostings}
        />
      </div>

      <SubjectOverviewList
        subjects={ws.subjects}
        skills={ws.skills}
        postings={ws.postings}
        totalPostings={ws.totalPostings}
      />
    </DashboardShell>
  );
}
