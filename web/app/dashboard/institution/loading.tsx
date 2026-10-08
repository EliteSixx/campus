export default function InstitutionLoading() {
  return (
    <div className="space-y-6 animate-pulse p-4 lg:p-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 rounded-md bg-surface-raised" />
        <div className="h-4 w-96 rounded-md bg-surface-raised/70" />
      </div>

      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-surface-raised" />
              <div className="h-6 w-6 rounded bg-surface-raised" />
            </div>
            <div className="mt-3 h-7 w-20 rounded bg-surface-raised" />
            <div className="mt-2 h-3 w-24 rounded bg-surface-raised/60" />
          </div>
        ))}
      </div>

      {/* 2x2 Widgets Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="space-y-1">
                <div className="h-5 w-40 rounded bg-surface-raised" />
                <div className="h-3 w-56 rounded bg-surface-raised/60" />
              </div>
              <div className="h-8 w-8 rounded-lg bg-surface-raised" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-8 w-full rounded bg-surface-raised/40" />
              <div className="h-8 w-full rounded bg-surface-raised/40" />
              <div className="h-8 w-full rounded bg-surface-raised/40" />
              <div className="h-8 w-full rounded bg-surface-raised/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
