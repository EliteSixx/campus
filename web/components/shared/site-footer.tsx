import { Copyright } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative z-30 mt-auto w-full border-t border-border/80 bg-[#0b1020]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] text-slate-300/80 sm:text-[11px]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-indigo-400/35 bg-indigo-500/10 text-indigo-200 shadow-[0_0_18px_rgba(99,102,241,0.25)]">
            <Copyright className="h-2.75 w-2.75" />
          </span>
          <span>2026 The Plug</span>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-2.5 py-1.5 shadow-[0_0_18px_rgba(79,70,229,0.18)]">
          <svg
            viewBox="0 0 28 28"
            className="h-4 w-4 text-indigo-200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="The Plug symbol"
          >
            <rect x="7" y="11" width="6" height="4" rx="1.2" fill="currentColor" opacity="0.9" />
            <rect x="7" y="17" width="6" height="4" rx="1.2" fill="currentColor" opacity="0.9" />
            <path
              d="M13 9.5H19.5C22.5 9.5 24.5 11.5 24.5 14.5V15.5C24.5 18.5 22.5 20.5 19.5 20.5H13V9.5Z"
              fill="currentColor"
              opacity="0.9"
            />
            <rect x="19.5" y="14" width="4.5" height="4" rx="1" fill="currentColor" opacity="0.95" />
            <path d="M13.5 9V5.5M17.5 9V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
            <path d="M8 18.5H4.5M8 13.5H4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-100 sm:text-[11px]">
            The Plug
          </span>
        </div>
      </div>
    </footer>
  );
}
