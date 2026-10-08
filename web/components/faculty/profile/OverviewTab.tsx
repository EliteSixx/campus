import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SCORE_TEXT, scoreTone } from "@/components/faculty/curriculum/utils";
import { formatHours } from "@/components/faculty/timetable/utils";
import type { FacultyProfileDetail } from "@/data/faculty-profile";
import type { DevelopmentFocus, SemesterStats } from "./utils";

// "Your semester at a glance": four numbers that each open the page they come
// from, then who this faculty member is. Every number is worked out on the
// server by the same functions those pages use, so they always agree.

const TILE_CLASS =
  "block h-full rounded-xl border border-border/80 bg-surface/80 p-5 shadow-md transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:bg-surface/65";

function StatTile({
  href,
  label,
  icon: Icon,
  value,
  valueClass = "text-ink",
  sub,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  value: string;
  valueClass?: string;
  sub: string;
}) {
  return (
    <Link href={href} className={TILE_CLASS}>
      <span className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-ink-muted">{label}</span>
        <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "mt-2 block text-2xl font-extrabold tracking-tight tabular",
          valueClass,
        )}
      >
        {value}
      </span>
      <span className="mt-1 block text-xs font-medium text-ink-muted">
        {sub}
      </span>
    </Link>
  );
}

export function OverviewTab({
  record,
  stats,
  focus,
}: {
  record: FacultyProfileDetail;
  stats: SemesterStats;
  focus: DevelopmentFocus;
}) {
  return (
    <>
      <h3 className="mt-6 text-sm font-bold text-ink">
        Your semester at a glance
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          href="/faculty/subjects"
          label="Subjects taught"
          icon={BookOpen}
          value={String(stats.subjectCount)}
          sub="on your teaching record"
        />
        <StatTile
          href="/faculty/students"
          label="Students tracked"
          icon={Users}
          value={String(stats.trackedStudents)}
          sub={`of ${stats.enrolledStudents} enrolled`}
        />
        <StatTile
          href="/faculty/subjects"
          label="Curriculum alignment"
          icon={Target}
          value={`${stats.overallAlignment}%`}
          valueClass={SCORE_TEXT[scoreTone(stats.overallAlignment)]}
          sub="average across your subjects"
        />
        <StatTile
          href="/faculty/timetable"
          label="Teaching hours"
          icon={CalendarClock}
          value={formatHours(stats.weeklyTeachingHours)}
          sub="a week, lectures and labs"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Background, qualification and research interests
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm text-ink-muted">{record.bio}</p>

          {record.specialization.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {record.specialization.map((item) => (
                <Badge key={item} tone="accent">
                  {item}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-ink-muted">Qualification</p>
              <p className="mt-1 text-sm text-ink">{record.qualification}</p>

              <p className="mt-4 text-xs font-bold text-ink-muted">
                Industry exposure
              </p>
              <p className="mt-1 text-sm text-ink">{focus.industryExposure}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-ink-muted">
                Research interests
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                {record.researchInterests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
