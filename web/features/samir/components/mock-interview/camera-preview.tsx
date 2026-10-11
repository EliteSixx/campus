"use client";

/**
 * Camera self-view for the mock interview.
 * Video stays in the browser: it is never recorded, stored or sent anywhere.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { cn } from "@/lib/utils";

const CAMERA_ERRORS: Record<string, string> = {
  NotAllowedError: "Camera access was blocked. Allow it in your browser's site settings to see yourself.",
  SecurityError: "Camera access was blocked. Allow it in your browser's site settings to see yourself.",
  NotFoundError: "No camera was found on this device.",
  OverconstrainedError: "No camera was found on this device.",
  NotReadableError: "Your camera is being used by another app. Close it and try again.",
};

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("This browser doesn't support camera access.");
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false, // speech recognition opens the microphone itself
      });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = s;
      setStream(s);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(CAMERA_ERRORS[name] ?? "Couldn't start the camera. Try again.");
    } finally {
      setStarting(false);
    }
  }, []);

  // Always release the camera when the component using it goes away.
  useEffect(() => stop, [stop]);

  return { stream, on: stream !== null, error, starting, start, stop };
}

export function CameraPreview({
  camera,
  className,
  compact = false,
}: {
  camera: ReturnType<typeof useCamera>;
  className?: string;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = camera.stream;
  }, [camera.stream]);

  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-raised",
        className
      )}
    >
      {camera.on ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full -scale-x-100 object-cover"
          aria-label="Your camera preview"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <CameraOff className="h-6 w-6 text-ink-faint" />
          {!compact && (
            <p className="max-w-[220px] text-xs text-ink-muted">
              {camera.error ?? "Camera is off. Turn it on to practise eye contact and body language."}
            </p>
          )}
        </div>
      )}

      <button
        onClick={() => (camera.on ? camera.stop() : camera.start())}
        disabled={camera.starting}
        className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/75 disabled:opacity-60"
        aria-label={camera.on ? "Turn camera off" : "Turn camera on"}
      >
        {camera.on ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
        {camera.starting ? "Starting…" : camera.on ? "Camera off" : "Camera on"}
      </button>

      {camera.on && (
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          You · not recorded
        </span>
      )}
    </div>
  );
}
