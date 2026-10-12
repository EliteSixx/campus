import type { AiError } from "@/lib/ai/client";

// One AI client error, shown inline. NETWORK_ERROR means no HTTP response came
// back, which in this demo almost always means the AI service is not running.

export function AiErrorMessage({ error, context }: { error: AiError; context?: string }) {
  const notRunning = error.code === "NETWORK_ERROR";
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger"
    >
      <p className="font-semibold">
        {context ? `${context} failed: ` : ""}
        {notRunning ? "the AI service is not running or cannot be reached." : error.code}
      </p>
      <p className="mt-0.5 break-words">{error.message}</p>
      {error.field && (
        <p className="mt-0.5">
          Field: <code className="font-mono">{error.field}</code>
        </p>
      )}
    </div>
  );
}
