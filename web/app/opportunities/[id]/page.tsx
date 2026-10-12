import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, GraduationCap, Wallet, Check, Minus, X, ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/shared/match-score";
import { getOpportunity, getOpportunityStatus } from "@/lib/api/opportunities";
import { computeSkillMatch, skillName } from "@/features/samir/data/current-student";
import { ApplyButton } from "@/features/samir/components/apply-button";
import { getCompanyById } from "@/data/companies";
import { getSkillById } from "@/data/skills";

export default async function OpportunityDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opp = await getOpportunity(id);
  if (!opp) notFound();

  const ids = computeSkillMatch(opp.requiredSkills);
  const match = {
    matchScore: ids.matchScore,
    strong: ids.strong.map(skillName),
    partial: ids.partial.map(skillName),
    missing: ids.missing.map(skillName),
  };
  const company = getCompanyById(opp.companyId);
  const status = getOpportunityStatus(opp.deadline);

  // Steps are specific to this role: close missing skills first, then strengthen partial ones.
  const improvementSteps: string[] = [
    ...match.missing.slice(0, 2).map((s) => `Learn ${s} fundamentals and build one small project that uses it`),
    ...match.partial.slice(0, 2).map((s) => `Strengthen ${s} with a verified project or assessment on your Skill Profile`),
  ];
  if (improvementSteps.length === 0) {
    improvementSteps.push("You meet every required skill. Tailor your resume summary to this role and apply.");
  }
  improvementSteps.push("Update your resume so recruiters can see the new evidence");

  return (
    <DashboardShell title="Opportunity Details">
      <Link href="/opportunities" className="mb-4 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to opportunities
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-raised text-sm font-semibold text-ink-muted">
                {company?.initials}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">{opp.title}</h2>
                <p className="text-sm text-ink-muted">
                  {company?.name} · {company?.industry}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-faint">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {opp.location} · {opp.mode}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3 w-3" /> {opp.stipendOrCtc}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Apply by {opp.deadline}
                    <span
                      className={
                        status === "Closed"
                          ? "font-semibold text-ink-faint"
                          : status === "Closing Soon"
                          ? "font-semibold text-warning"
                          : "font-semibold text-success"
                      }
                    >
                      ({status})
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{opp.description}</p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & eligibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium text-ink-muted">Required skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {opp.requiredSkills.map((id) => (
                    <Badge key={id}>{getSkillById(id)?.name ?? id}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-ink-muted">Preferred skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {opp.preferredSkills.map((id) => (
                    <Badge key={id} tone="accent">
                      {getSkillById(id)?.name ?? id}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <GraduationCap className="h-4 w-4 text-ink-faint" />
                {opp.eligibility}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">Your match</p>
            <div className="flex items-center gap-4">
              <MatchScore value={match.matchScore} size="lg" />
              <div className="space-y-2 text-xs">
                <p className="flex items-center gap-1.5 text-success">
                  <Check className="h-3.5 w-3.5" /> {match.strong.length} strong matches
                </p>
                <p className="flex items-center gap-1.5 text-warning">
                  <Minus className="h-3.5 w-3.5" /> {match.partial.length} partial matches
                </p>
                <p className="flex items-center gap-1.5 text-danger">
                  <X className="h-3.5 w-3.5" /> {match.missing.length} missing
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {match.strong.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink-muted">Strong matches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.strong.map((s) => (
                      <Badge key={s} tone="success">
                        <Check className="h-3 w-3" /> {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {match.partial.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink-muted">Partial matches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.partial.map((s) => (
                      <Badge key={s} tone="warning">
                        ~ {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {match.missing.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink-muted">Missing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.missing.map((s) => (
                      <Badge key={s} tone="danger">
                        <X className="h-3 w-3" /> {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm font-semibold text-ink">How to improve your match</p>
            <ol className="space-y-2.5">
              {improvementSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <ApplyButton opportunityId={opp.id} closed={status === "Closed"} />
            <Link
              href={`/profile/resume?target=${opp.id}`}
              className="mt-2 block text-center text-xs font-medium text-accent hover:underline"
            >
              Tailor your resume for this role
            </Link>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
