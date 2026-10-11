"use client";

/**
 * Speech-to-text and text-to-speech using the browser's Web Speech API.
 * STT works in Chrome and Edge; TTS works in all modern browsers.
 * Components fall back to typed answers when STT is unavailable.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal Web Speech API typings (not shipped in TypeScript's DOM lib). */
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access was blocked. Allow it in your browser's site settings, or switch to typed answers.",
  "service-not-allowed": "Speech recognition is blocked in this browser. Switch to typed answers.",
  "audio-capture": "No microphone was found. Connect one, or switch to typed answers.",
  network: "Speech recognition needs an internet connection in this browser. Check your connection or type your answer.",
};

export function useSpeechRecognition(lang = "en-IN") {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  // Chrome ends recognition after a pause; restart while the user still wants to talk.
  const wantRef = useRef(false);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    return () => {
      wantRef.current = false;
      recRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = "";
      let finalChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalChunk += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      if (finalChunk) setFinalText((t) => (t + " " + finalChunk).replace(/\s+/g, " ").trimStart());
      setInterimText(interim);
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      wantRef.current = false;
      setError(ERROR_MESSAGES[e.error] ?? "Speech recognition stopped unexpectedly. You can type your answer instead.");
    };
    rec.onend = () => {
      if (wantRef.current) {
        try {
          rec.start();
          return;
        } catch {
          // fall through to stopped state
        }
      }
      setListening(false);
      setInterimText("");
    };
    recRef.current = rec;
    wantRef.current = true;
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Couldn't start the microphone. Try again or type your answer.");
    }
  }, [lang]);

  const stop = useCallback(() => {
    wantRef.current = false;
    recRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setFinalText("");
    setInterimText("");
  }, []);

  return { supported, listening, finalText, interimText, error, start, stop, reset, setFinalText };
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-IN") ??
    voices.find((v) => v.lang.startsWith("en") && /google|natural|neural/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

export function useSpeechSynthesis() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;
    // Voices load asynchronously in Chrome; touching the list triggers loading.
    window.speechSynthesis.getVoices();
    return () => window.speechSynthesis.cancel();
  }, []);

  /** Speaks the text; resolves when finished (or immediately if TTS is unavailable or muted). */
  const speak = useCallback((text: string, muted = false) => {
    return new Promise<void>((resolve) => {
      if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "en-IN";
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => {
        setSpeaking(false);
        resolve();
      };
      u.onerror = () => {
        setSpeaking(false);
        resolve();
      };
      window.speechSynthesis.speak(u);
    });
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, cancel };
}
