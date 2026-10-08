"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  GraduationCap,
  MessageSquare,
  NotebookPen,
  TriangleAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SemesterAcademics } from "@/lib/api/academics";
import type { StudentDetail } from "@/lib/api/faculty-roster";
import {
  messageStudentHref,
  needsAttention,
  scoreTone,
  type CohortStudentRow,
} from "@/lib/api/faculty-students-meta";
import {
  SCORE_TEXT,
  linkButtonClass,
} from "@/components/faculty/curriculum/utils";
import {
  studentDetailTabHref,
  studentReportHref,
  type StudentDetailTab,
} from "./detail-utils";
import { StudentAcademicsTab } from "./StudentAcademicsTab";
import {
  StudentInternshipsTab,
  StudentOffersTab,
} from "./StudentInternshipsTab";
import { StudentOverviewTab } from "./StudentOverviewTab";
import { StudentSkillsTab } from "./StudentSkillsTab";
import { TabStrip, stripPanelId, stripTabId, type TabStripItem } from "./TabStrip";
import { useToday } from "./useToday";
import { READINESS_TONE } from "./utils";

// The interactive part of /faculty/students/[id]: header, actions and tabs.
// Everything is plain data from the server. Today's date (for warnings) is read
// after mount by useToday, and notes live in this browser only.

const ID_PREFIX = "student";

export function StudentDetailClient({
  row,
  detail,
  transcript,
  skillNames,
  initialTab,
}: {
  row: CohortStudentRow;
  detail: StudentDetail;
  transcript: SemesterAcademics;
  skillNames: Record<string, string>;
  initialTab: StudentDetailTab;
}) {
  const router = useRouter();
  const today = useToday();
  const [tab, setTab] = useState<StudentDetailTab>(initialTab);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  // Bumped by "Add note"; the effect below focuses the textarea once the
  // Overview tab (and so the textarea) is on screen.
  const [noteFocusRequest, setNoteFocusRequest] = useState(0);

  const changeTab = useCallback(
    (next: StudentDetailTab) => {
      setTab(next);
      router.replace(studentDetailTabHref(row.id, next), { scroll: false });
    },
    [router, row.id],
  );

  useEffect(() => {
    if (noteFocusRequest === 0 || tab !== "overview") return;
    const el = noteRef.current;
    if (!el) return;
    el.focus();
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [noteFocusRequest, tab]);

  function addNote() {
    if (tab !== "overview") changeTab("overview");
    setNoteFocusRequest((n) => n + 1);
  }

  const flagged = today === null ? null : needsAttention(row, today.iso);

  const tabs: TabStripItem<StudentDetailTab>[] = [
    { id: "overview", label: "Overview" },
    { id: "academics", label: "Academics" },
    { id: "skills", label: "Skills" },
    {
      id: "internships",
      label: "Internships",
      count: String(detail.internships.length),
    },
    { id: "offers", label: "Offers", count: String(detail.offers.length) },
  ];

  return (
    <>
      {/* Who this student is, and how ready they are overall */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <GraduationCap className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold text-ink">{row.name}</h2>
              {row.rollNumber && (
                <Badge tone="neutral" className="tabular">
                  {row.rollNumber}
                </Badge>
              )}
              {flagged === null ? (
                <span
                  className="inline-block h-5 w-28 animate-pulse rounded-full bg-surface-raised"
                  aria-hidden="true"
                />
              ) : (
                flagged && (
                  <Badge tone="danger">
                    <TriangleAlert className="h-3 w-3" aria-hidden="true" />
                    Needs attention
                  </Badge>
                )
              )}
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {row.yearLabel}
              {row.currentSemester !== null && (
                <>
                  {" "}
                  · Semester <span className="tabular">{row.currentSemester}</span>
                </>
              )}{" "}
              · {row.careerGoal}
            </p>
            <div className="mt-3">
              <Badge tone={READINESS_TONE[row.readiness]}>{row.readiness}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-6 sm:gap-8">
            <div className="sm:text-right">
              <p className="text-3xl font-extrabold text-ink tabular">
                {row.cgpa !== null ? (
                  <>
                    {row.cgpa}
                    <span className="text-xl font-bold text-ink-muted">/10</span>
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">CGPA</p>
            </div>
            <div className="sm:text-right">
              <p
                className={cn(
                  "text-3xl font-extrabold tabular",
                  SCORE_TEXT[scoreTone(row.skillReadiness)],
                )}
              >
                {row.skillReadiness}%
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">skill readiness</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={messageStudentHref(row.id)} className={linkButtonClass("primary")}>
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            Message
          </Link>
          <Button type="button" size="sm" variant="secondary" onClick={addNote}>
            <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
            Add note
          </Button>
          <Link href={studentReportHref(row.id)} className={linkButtonClass("secondary")}>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Progress report
          </Link>
        </div>
      </Card>

      <TabStrip
        tabs={tabs}
        active={tab}
        onChange={changeTab}
        idPrefix={ID_PREFIX}
        label={`${row.name} sections`}
      />

      <div
        role="tabpanel"
        id={stripPanelId(ID_PREFIX, tab)}
        aria-labelledby={stripTabId(ID_PREFIX, tab)}
      >
        {tab === "overview" && (
          <StudentOverviewTab
            row={row}
            detail={detail}
            todayISO={today?.iso ?? null}
            noteRef={noteRef}
            onSeeAllSkills={() => changeTab("skills")}
          />
        )}
        {tab === "academics" && (
          <StudentAcademicsTab
            transcript={transcript}
            cgpa={row.cgpa}
            mySubjectIds={row.subjects.map((s) => s.subjectId)}
          />
        )}
        {tab === "skills" && <StudentSkillsTab detail={detail} />}
        {tab === "internships" && (
          <StudentInternshipsTab
            internships={detail.internships}
            skillNames={skillNames}
          />
        )}
        {tab === "offers" && (
          <StudentOffersTab offers={detail.offers} internships={detail.internships} />
        )}
      </div>
    </>
  );
}
