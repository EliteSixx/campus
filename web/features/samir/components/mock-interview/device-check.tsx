"use client";

/**
 * First step of the mock interview: ask for microphone and camera permission,
 * explain why, and confirm both work before any question is asked.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Keyboard, Mic, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CameraPreview, useCamera } from "./camera-preview";

export type DeviceStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

const MIC_ERRORS: Record<string, { status: DeviceStatus; message: string }> = {
  NotAllowedError: { status: "denied", message: "Microphone access was blocked. Allow it in your browser's site settings." },
  SecurityError: { status: "denied", message: "Microphone access was blocked. Allow it in your browser's site settings." },
  NotFoundError: { status: "unavailable", message: "No microphone was found on this device." },
  NotReadableError: { status: "unavailable", message: "Your microphone is being used by another app." },
};

/** Requests the microphone and shows a live input level so the student knows it works. */
function useMicCheck() {
  const [status, setStatus] = useState<DeviceStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const cleanupRef = useRef<() => void>(() => {});

  const request = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setMessage("This browser doesn't support microphone access.");
      return;
    }
    setStatus("requesting");
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(1, avg / 60));
        raf = requestAnimationFrame(tick);
      };
      tick();
      cleanupRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close().catch(() => {});
      };
      setStatus("granted");
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      const known = MIC_ERRORS[name];
      setStatus(known?.status ?? "denied");
      setMessage(known?.message ?? "Couldn't access the microphone.");
    }
  }, []);

  // The level meter is only for this screen; speech recognition opens the mic itself later.
  useEffect(() => () => cleanupRef.current(), []);

  return { status, message, level, request };
}

function StatusLine({ status, label, message }: { status: DeviceStatus; label: string; message?: string | null }) {
  const ok = status === "granted";
  const bad = status === "denied" || status === "unavailable";
  return (
    <div className="flex items-start gap-2 text-xs">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
      ) : bad ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      ) : (
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-border" />
      )}
      <div>
        <p className={cn("font-medium", ok ? "text-success" : bad ? "text-warning" : "text-ink")}>
          {label}:{" "}
          {status === "granted"
            ? "allowed"
            : status === "requesting"
            ? "waiting for your permission…"
            : status === "denied"
            ? "blocked"
            : status === "unavailable"
            ? "not available"
            : "not requested yet"}
        </p>
        {message && <p className="mt-0.5 text-ink-muted">{message}</p>}
      </div>
    </div>
  );
}

export function DeviceCheck({
  camera,
  sttSupported,
  onContinue,
}: {
  camera: ReturnType<typeof useCamera>;
  /** Whether this browser can transcribe speech (Chrome / Edge) */
  sttSupported: boolean;
  onContinue: (opts: { voice: boolean }) => void;
}) {
  const mic = useMicCheck();
  const cameraStatus: DeviceStatus = camera.on
    ? "granted"
    : camera.starting
    ? "requesting"
    : camera.error
    ? camera.error.includes("No camera") || camera.error.includes("doesn't support")
      ? "unavailable"
      : "denied"
    : "idle";
  const requested = mic.status !== "idle" || cameraStatus !== "idle";
  const busy = mic.status === "requesting" || camera.starting;
  const canUseVoice = mic.status === "granted" && sttSupported;

  const requestBoth = async () => {
    // Ask one after the other so a refusal of one doesn't block the other.
    await mic.request();
    if (!camera.on) await camera.start();
  };

  return (
    <Card className="mx-auto max-w-3xl p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <h2 className="text-lg font-semibold text-ink">Before we start: microphone and camera</h2>
          <p className="mt-1 text-sm text-ink-muted">
            The interviewer speaks each question aloud and listens to your spoken answer, so we need your microphone.
            The camera shows you to yourself, so you can practise eye contact and posture like in a real video interview.
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            Nothing is recorded. Video stays on this device and is never stored or uploaded. In Chrome and Edge, your
            spoken answers are converted to text by the browser&apos;s speech service.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <CameraPreview camera={camera} />

        <div className="flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <StatusLine status={mic.status} label="Microphone" message={mic.message} />
            {mic.status === "granted" && (
              <div className="flex items-center gap-2 pl-6">
                <Mic className="h-3.5 w-3.5 text-ink-muted" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised" aria-label="Microphone level">
                  <div className="h-full rounded-full bg-success transition-[width] duration-75" style={{ width: `${mic.level * 100}%` }} />
                </div>
                <span className="text-[11px] text-ink-muted">Say something</span>
              </div>
            )}
            <StatusLine status={cameraStatus} label="Camera" message={camera.error} />
            {!sttSupported && (
              <p className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
                This browser can&apos;t turn speech into text. Use Chrome or Edge for spoken answers, or continue with
                typed answers. The interviewer will still speak the questions.
              </p>
            )}
          </div>

          <div className="space-y-2">
            {!requested || mic.status === "denied" || cameraStatus === "denied" ? (
              <Button className="w-full gap-1.5" onClick={requestBoth} disabled={busy}>
                <Mic className="h-3.5 w-3.5" />
                <Camera className="h-3.5 w-3.5" />
                {busy ? "Waiting for permission…" : requested ? "Try again" : "Allow microphone and camera"}
              </Button>
            ) : null}
            <Button
              className="w-full"
              variant={canUseVoice ? "primary" : "secondary"}
              disabled={!requested || busy}
              onClick={() => onContinue({ voice: canUseVoice })}
            >
              {canUseVoice ? "Continue with voice answers" : "Continue"}
            </Button>
            {requested && !canUseVoice && !busy && (
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
                <Keyboard className="h-3.5 w-3.5" /> You&apos;ll type your answers instead.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
