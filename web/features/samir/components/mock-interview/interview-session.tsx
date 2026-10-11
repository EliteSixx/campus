"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, SkipForward, Check, Keyboard, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnswerEvaluation, InterviewPlan, evaluateAnswer } from "../../data/interview-engine";
import { useSpeechRecognition, useSpeechSynthesis } from "./use-speech";
import { CameraPreview, useCamera } from "./camera-preview";

type Phase = "speaking" | "answering";

/** Answers shorter than this get the question's follow-up, once. */
const FOLLOW_UP_BELOW_WORDS = 25;

export function InterviewSession({
  plan,
  voice,
  camera,
  onFinish,
  onQuit,
}: {
  plan: InterviewPlan;
  /** Owned by the parent so permission and stream carry over from the device check */
  camera: ReturnType<typeof useCamera>;
  /** true = spoken answers (STT); false = typed answers */
  voice: boolean;
  onFinish: (evaluations: AnswerEvaluation[]) => void;
  onQuit: () => void;
}) {
  const stt = useSpeechRecognition();
  const tts = useSpeechSynthesis();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("speaking");
  const [muted, setMuted] = useState(false);
  const [typedFallback, setTypedFallback] = useState(!voice);
  const [interviewerLine, setInterviewerLine] = useState("");
  const [confirmQuit, setConfirmQuit] = useState(false);

  const evaluations = useRef<AnswerEvaluation[]>([]);
  const followUpAsked = useRef(false);
  const listenStartedAt = useRef<number | null>(null);
  const spokenSeconds = useRef(0);
  const runId = useRef(0);

  const question = plan.questions[index];
  const useVoice = voice && stt.supported && !typedFallback;

  // If the microphone fails mid-interview, switch this session to typed answers.
  useEffect(() => {
    if (stt.error) setTypedFallback(true);
  }, [stt.error]);

  const stopListening = useCallback(() => {
    if (listenStartedAt.current !== null) {
      spokenSeconds.current += (Date.now() - listenStartedAt.current) / 1000;
      listenStartedAt.current = null;
    }
    stt.stop();
  }, [stt]);

  const ask = useCallback(
    async (line: string) => {
      const run = ++runId.current;
      stopListening();
      setInterviewerLine(line);
      setPhase("speaking");
      await tts.speak(line, muted);
      if (run !== runId.current) return; // superseded by another question / repeat / unmount
      setPhase("answering");
      if (useVoice) {
        listenStartedAt.current = Date.now();
        stt.start();
      }
    },
    // stt/tts objects are stable enough; re-creating ask on every render would re-trigger the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [muted, useVoice]
  );

  // Ask each new question.
  useEffect(() => {
    followUpAsked.current = false;
    spokenSeconds.current = 0;
    stt.reset();
    ask(index === 0 ? question.prompt : `Next question. ${question.prompt}`);
    const runs = runId;
    return () => {
      runs.current++; // invalidate this question's pending speak → listen sequence
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(
    () => () => {
      tts.cancel();
      stt.stop();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const answerText = `${stt.finalText}${stt.interimText ? " " + stt.interimText : ""}`.trim();
  const wordCount = answerText ? answerText.split(/\s+/).length : 0;

  const record = (text: string) => {
    const evaluation = evaluateAnswer(question, text, spokenSeconds.current, useVoice ? "voice" : "text");
    evaluations.current = [...evaluations.current.filter((e) => e.questionId !== question.id), evaluation];
    if (index === plan.questions.length - 1) {
      tts.cancel();
      onFinish(evaluations.current);
    } else {
      setIndex(index + 1);
    }
  };

  const handleDone = () => {
    stopListening();
    const text = answerText;
    if (question.followUp && !followUpAsked.current && wordCount > 0 && wordCount < FOLLOW_UP_BELOW_WORDS) {
      followUpAsked.current = true;
      // Keep the transcript: the follow-up answer is added to the same question.
      ask(question.followUp);
      return;
    }
    record(text);
  };

  const handleSkip = () => {
    stopListening();
    record("");
  };

  const handleRepeat = () => {
    ask(interviewerLine || question.prompt);
  };

  const progress = Math.round((index / plan.questions.length) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-mono text-xs text-ink-muted">
          {index + 1}/{plan.questions.length}
        </span>
      </div>

      {/* Interviewer + self-view */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent",
              phase === "speaking" && tts.speaking && "ring-4 ring-accent/30 animate-pulse"
            )}
            aria-hidden
          >
            <Volume2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge tone="accent">{question.section}</Badge>
              {question.skill && <Badge tone="neutral">{question.skill}</Badge>}
              {followUpAsked.current && <Badge tone="warning">Follow-up</Badge>}
            </div>
            <p className="text-base font-medium leading-relaxed text-ink" aria-live="polite">
              {interviewerLine || question.prompt}
            </p>
            <p className="mt-2 text-xs text-ink-muted">Why this question: {question.reason}</p>
          </div>
          <button
            onClick={() => setMuted(!muted)}
            className="rounded-md p-2 text-ink-muted hover:bg-surface-raised hover:text-ink"
            aria-label={muted ? "Unmute interviewer voice" : "Mute interviewer voice"}
            title={muted ? "Unmute interviewer" : "Mute interviewer"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </Card>
      <CameraPreview camera={camera} compact className="md:aspect-auto md:h-full" />
      </div>

      {/* Answer */}
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Your answer</p>
          {useVoice ? (
            <span
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                stt.listening ? "text-danger" : "text-ink-muted"
              )}
            >
              {stt.listening ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-danger" /> Listening…
                </>
              ) : phase === "speaking" ? (
                "Interviewer is speaking…"
              ) : (
                <>
                  <MicOff className="h-3.5 w-3.5" /> Mic paused
                </>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Keyboard className="h-3.5 w-3.5" /> Typed answer
            </span>
          )}
        </div>

        {stt.error && voice && (
          <p className="mb-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
            {stt.error}
          </p>
        )}

        <textarea
          value={answerText}
          onChange={(e) => stt.setFinalText(e.target.value)}
          readOnly={stt.listening}
          rows={6}
          placeholder={
            useVoice
              ? "Start speaking after the question. Your words appear here, and you can correct them when the mic is paused."
              : "Type your answer here…"
          }
          className="w-full resize-y rounded-lg border border-border bg-surface p-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          aria-label="Your answer"
        />
        <p className="mt-1 text-right text-[11px] text-ink-faint">{wordCount} words</p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={handleRepeat} disabled={phase === "speaking"} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Repeat question
            </Button>
            {useVoice && phase === "answering" && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  if (stt.listening) stopListening();
                  else {
                    listenStartedAt.current = Date.now();
                    stt.start();
                  }
                }}
              >
                {stt.listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                {stt.listening ? "Pause mic" : "Resume mic"}
              </Button>
            )}
            {voice && stt.supported && (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => {
                stopListening();
                setTypedFallback(!typedFallback);
              }}>
                {typedFallback ? <Mic className="h-3.5 w-3.5" /> : <Keyboard className="h-3.5 w-3.5" />}
                {typedFallback ? "Answer by voice" : "Type instead"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} disabled={phase === "speaking"} className="gap-1.5">
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </Button>
            <Button size="sm" onClick={handleDone} disabled={phase === "speaking"} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              {index === plan.questions.length - 1 ? "Finish interview" : "Done answering"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        {confirmQuit ? (
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            Leave the interview? Your answers so far won&apos;t be scored.
            <Button size="sm" variant="ghost" onClick={() => setConfirmQuit(false)}>Stay</Button>
            <Button size="sm" variant="outline" className="border-danger/40 text-danger" onClick={() => {
              runId.current++;
              tts.cancel();
              stt.stop();
              onQuit();
            }}>
              Leave
            </Button>
          </div>
        ) : (
          <button onClick={() => setConfirmQuit(true)} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
            <X className="h-3.5 w-3.5" /> End interview
          </button>
        )}
      </div>
    </div>
  );
}
