import { Award, Briefcase } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  InternshipRecord,
  PrePlacementOffer,
} from "@/data/faculty-student-records";
import { OFFER_TONE } from "./detail-utils";
import { INTERNSHIP_STATUS_TONE } from "./utils";

// Internship applications and pre-placement offers. Skill names are resolved on
// the server and passed in, so no data module reaches the browser.

export function StudentInternshipsTab({
  internships,
  skillNames,
}: {
  internships: InternshipRecord[];
  skillNames: Record<string, string>;
}) {
  const nameOf = (id: string) => skillNames[id] ?? id;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Internships</CardTitle>
          <CardDescription>
            Applications, outcomes and completion reports
          </CardDescription>
        </div>
        <Briefcase className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {internships.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center text-xs text-ink-muted">
            Not enrolled in any internship yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {internships.map((internship) => (
              <li
                key={internship.id}
                className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {internship.company}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">{internship.role}</p>
                  </div>
                  <Badge tone={INTERNSHIP_STATUS_TONE[internship.status]}>
                    {internship.status}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-ink-muted tabular">
                  Applied {internship.appliedOn}
                  {internship.durationWeeks !== undefined &&
                    ` · ${internship.durationWeeks} weeks`}
                  {internship.stipend !== undefined && ` · ${internship.stipend}`}
                </p>

                {internship.report && (
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-ink">
                        {internship.report.mentor}
                      </span>
                      <span className="text-xs font-bold text-ink tabular">
                        {internship.report.mentorRating} / 5
                        <span className="sr-only"> mentor rating</span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">
                      {internship.report.summary}
                    </p>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-ink">Skills applied</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {internship.report.skillsApplied.map((skillId) => (
                          <Badge key={skillId} tone="accent">
                            {nameOf(skillId)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-ink">Skills learned</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {internship.report.skillsLearned.map((skillId) => (
                          <Badge key={skillId} tone="cyan">
                            {nameOf(skillId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {internship.certificate && (
                  <div className="mt-3 rounded-lg border border-border bg-surface/60 px-3 py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Award
                          className="h-3.5 w-3.5 shrink-0 text-ink-muted"
                          aria-hidden="true"
                        />
                        <span className="break-all text-xs font-semibold text-ink tabular">
                          {internship.certificate.credentialId}
                        </span>
                      </div>
                      {internship.certificate.verified && (
                        <Badge tone="success">Verified</Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-ink-muted">
                      {internship.certificate.issuer} · Issued{" "}
                      {internship.certificate.issuedOn}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function StudentOffersTab({
  offers,
  internships,
}: {
  offers: PrePlacementOffer[];
  internships: InternshipRecord[];
}) {
  // Offers name the internship they came out of by id, not by company.
  const internshipById = new Map(internships.map((i) => [i.id, i]));

  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Pre-placement offers</CardTitle>
          <CardDescription>
            Pre-placement offers linked to this student&apos;s internships
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-raised/40 px-4 py-6 text-center text-xs text-ink-muted">
            No pre-placement offers yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {offers.map((offer) => {
              const source = internshipById.get(offer.fromInternshipId);
              // Only an offer actually made came out of the internship.
              const converted =
                offer.status === "Offered" || offer.status === "Accepted";

              return (
                <li
                  key={offer.id}
                  className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{offer.company}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{offer.role}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {offer.package !== undefined && (
                        <span className="text-sm font-extrabold text-ink tabular">
                          {offer.package}
                        </span>
                      )}
                      <Badge tone={OFFER_TONE[offer.status]}>{offer.status}</Badge>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-ink-muted">{offer.decisionBy}</p>

                  {source && (
                    <p className="mt-1 text-xs text-ink-muted">
                      {converted ? "Converted from" : "Linked to"} their{" "}
                      {source.company} internship
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
