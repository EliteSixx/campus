import Link from "next/link";
import type { SkillTopicRef } from "@/lib/api/faculty-students-meta";
import { subjectHref, textLinkClass } from "@/components/faculty/curriculum/utils";

// Where one of my subjects teaches a skill: "Taught in CS303 · Shell, System
// Calls & Linux Internals", subject and topic always together. `linked` is off
// in the printed report, where a link has nowhere to go.

export function TaughtInLine({
  refs,
  linked = true,
}: {
  refs: SkillTopicRef[];
  linked?: boolean;
}) {
  if (refs.length === 0) {
    return <p className="text-xs text-ink-muted">Not in your syllabus</p>;
  }

  return (
    <p className="text-xs text-ink-muted">
      Taught in{" "}
      {refs.map((ref, i) => {
        const text = `${ref.code} · ${ref.topicName}`;
        return (
          <span key={`${ref.subjectId}:${ref.topicId}`}>
            {i > 0 && ", "}
            {linked ? (
              <Link href={subjectHref(ref.subjectId)} className={textLinkClass}>
                {text}
              </Link>
            ) : (
              <span className="font-semibold text-ink">{text}</span>
            )}
          </span>
        );
      })}
    </p>
  );
}
