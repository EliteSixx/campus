import { FileText, FlaskConical } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Publication, ResearchProject } from "@/data/faculty-profile";
import { PROJECT_TONE, PUBLICATION_TONE } from "./utils";

// Publications and research projects, as on the old profile page. Both lists
// arrive already sorted from the server page.

const itemClass = "rounded-lg border border-border bg-surface-raised/40 px-4 py-3";

export function PublicationsTab({
  publications,
  totalCitations,
}: {
  publications: Publication[];
  totalCitations: number;
}) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Publications</CardTitle>
          <CardDescription>
            Newest first ·{" "}
            <span className="tabular">{totalCitations}</span> citations in all
          </CardDescription>
        </div>
        <FileText className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {publications.length === 0 ? (
          <p className="text-sm text-ink-muted">No publications yet.</p>
        ) : (
          <ul className="space-y-2">
            {publications.map((publication) => (
              <li key={publication.id} className={itemClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {publication.title}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {publication.venue} ·{" "}
                      <span className="tabular">{publication.year}</span>
                    </p>
                  </div>
                  <Badge tone={PUBLICATION_TONE[publication.type]}>
                    {publication.type}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-ink-muted">
                  {publication.coAuthors} ·{" "}
                  <span className="font-semibold text-ink tabular">
                    {publication.citations} citations
                  </span>
                </p>

                {publication.doi && (
                  <p className="mt-1 break-all text-xs text-ink-muted tabular">
                    DOI {publication.doi}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectsTab({ projects }: { projects: ResearchProject[] }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Ongoing work first</CardDescription>
        </div>
        <FlaskConical className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-ink-muted">No research projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id} className={itemClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {project.title}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {project.agency} · {project.role}
                    </p>
                  </div>
                  <Badge tone={PROJECT_TONE[project.status]}>
                    {project.status}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-ink-muted">
                  <span className="tabular">{project.duration}</span> ·{" "}
                  <span className="font-semibold text-ink tabular">
                    {project.funding}
                  </span>
                </p>

                <p className="mt-1 text-xs text-ink-muted">
                  <span className="tabular">{project.studentsInvolved}</span>{" "}
                  students involved
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
