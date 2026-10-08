"use client";

import { useEffect, useState, type RefObject } from "react";
import { Lock, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MAX_NOTE,
  NOTES_KEY,
  parseStoredNotes,
  type StudentNote,
} from "@/lib/api/faculty-students-meta";
import { formatNoteTime } from "./detail-utils";

// Private notes on one student, kept in this browser only.
//
// NOTES_KEY holds every student's notes as one array. Every save and delete
// re-reads storage first and changes only this student's entry, so notes for
// other students (or from another tab) are never lost. Storage is touched only
// in effects and event handlers, always inside try/catch.

function readAllNotes(): StudentNote[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return parseStoredNotes(JSON.parse(raw) as unknown);
  } catch (e) {
    console.error(`Failed to read ${NOTES_KEY} from localStorage`, e);
    return [];
  }
}

function writeAllNotes(notes: StudentNote[]): boolean {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch (e) {
    console.error(`Failed to save ${NOTES_KEY} to localStorage`, e);
    return false;
  }
}

interface ShownNote {
  note: StudentNote;
  // Formatted when the note is loaded or saved, so render builds no Date.
  when: string;
}

// This student's notes, newest first, each with its display time.
function notesFor(all: StudentNote[], studentId: string): ShownNote[] {
  return all
    .filter((n) => n.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((note) => ({ note, when: formatNoteTime(note.createdAt) }));
}

export function StudentNotesCard({
  studentId,
  studentName,
  textareaRef,
}: {
  studentId: string;
  studentName: string;
  textareaRef: RefObject<HTMLTextAreaElement>;
}) {
  const [notes, setNotes] = useState<ShownNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(notesFor(readAllNotes(), studentId));
    setLoaded(true);
  }, [studentId]);

  const canSave = draft.trim() !== "";

  function save() {
    const body = draft.trim().slice(0, MAX_NOTE);
    if (body === "") return;
    // Clock read in an event handler, never during render.
    const note: StudentNote = {
      id: `local-${Date.now()}`,
      studentId,
      body,
      createdAt: new Date().toISOString(),
    };
    const all = [note, ...readAllNotes()];
    if (!writeAllNotes(all)) {
      setError("The note could not be saved in this browser.");
      return;
    }
    setError(null);
    setNotes(notesFor(all, studentId));
    setDraft("");
  }

  function remove(id: string) {
    if (!window.confirm("Delete this note?")) return;
    const all = readAllNotes().filter((n) => n.id !== id);
    if (!writeAllNotes(all)) {
      setError("The note could not be deleted in this browser.");
      return;
    }
    setError(null);
    setNotes(notesFor(all, studentId));
  }

  const inputId = `student-note-${studentId}`;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Private notes</CardTitle>
          <CardDescription>
            Only you can see these. Saved in this browser only.
          </CardDescription>
        </div>
        <Badge tone="neutral">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Local
        </Badge>
      </CardHeader>
      <CardContent>
        <label htmlFor={inputId} className="sr-only">
          New note about {studentName}
        </label>
        <textarea
          ref={textareaRef}
          id={inputId}
          rows={3}
          maxLength={MAX_NOTE}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note, e.g. what you agreed in office hours…"
          className="w-full rounded-md border border-border bg-surface p-3 text-sm font-medium text-ink shadow-sm placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-ink-muted tabular" aria-live="polite">
            {draft.length}/{MAX_NOTE}
          </span>
          <Button type="button" size="sm" onClick={save} disabled={!canSave}>
            Save note
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-xs font-semibold text-danger" role="alert">
            {error}
          </p>
        )}

        {!loaded ? (
          <div
            className="mt-4 h-12 animate-pulse rounded-lg bg-surface-raised"
            aria-hidden="true"
          />
        ) : notes.length === 0 ? (
          <p className="mt-4 text-xs text-ink-muted">No notes yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {notes.map(({ note, when }) => (
              <li
                key={note.id}
                className="rounded-lg border border-border bg-surface-raised/40 px-4 py-3"
              >
                <p className="whitespace-pre-line break-words text-sm text-ink">
                  {note.body}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-ink-muted tabular">{when}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                    <span className="sr-only"> note from {when}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
