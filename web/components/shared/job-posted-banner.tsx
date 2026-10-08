"use client";

import { useEffect, useState, Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function JobPostedBannerInner() {
  const searchParams = useSearchParams();
  const visible = searchParams.get("jobPosted") === "true";
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = window.setTimeout(() => setShow(false), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-success/30 bg-success-soft p-4 text-success shadow-sm animate-in fade-in duration-200">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">Job posted successfully.</p>
        <p className="text-xs text-success/80">Your opportunity is now live and candidates can start applying.</p>
      </div>
    </div>
  );
}

export function JobPostedBanner() {
  return (
    <Suspense fallback={null}>
      <JobPostedBannerInner />
    </Suspense>
  );
}
