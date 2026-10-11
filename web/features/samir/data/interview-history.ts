"use client";

/**
 * Mock interview attempts, stored per student in localStorage until a backend exists.
 * Saving an attempt also writes `mock_interview_score` into the student's AI record
 * overlay (the same one the Profile page edits), so /ai/readiness counts it.
 */
import { AiStudent, getCurrentStudentAiRecord, CURRENT_STUDENT_ID } from "./current-student";

export interface InterviewAttempt {
  id: string;
  date: string; // ISO
  role: string;
  overall: number;
  communication: number;
  questionCount: number;
  readinessBefore: number;
  readinessAfter: number | null;
}

const HISTORY_KEY = `campuslink-mock-interviews-${CURRENT_STUDENT_ID}`;

/** Same key StudentAiExperience and the profile form use for saved profile edits. */
function aiRecordKey() {
  return `demo_student_${getCurrentStudentAiRecord().student_id}`;
}

export function loadAiStudent(): AiStudent {
  try {
    const raw = localStorage.getItem(aiRecordKey());
    if (raw) return JSON.parse(raw) as AiStudent;
  } catch {
    // fall back to the shared record
  }
  return getCurrentStudentAiRecord();
}

export function saveMockInterviewScore(score: number): AiStudent {
  const updated: AiStudent = { ...loadAiStudent(), mock_interview_score: score };
  try {
    localStorage.setItem(aiRecordKey(), JSON.stringify(updated));
  } catch {
    // storage unavailable: the caller still gets the updated record
  }
  return updated;
}

export function loadInterviewHistory(): InterviewAttempt[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as InterviewAttempt[]) : [];
  } catch {
    return [];
  }
}

export function saveInterviewAttempt(attempt: InterviewAttempt) {
  try {
    const next = [attempt, ...loadInterviewHistory().filter((a) => a.id !== attempt.id)].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // history is a convenience; ignore storage failures
  }
}
