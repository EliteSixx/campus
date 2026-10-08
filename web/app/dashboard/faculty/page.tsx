export default function MentorDashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <section className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          CampusLink Mentor
        </p>
        <h1 className="mt-3 text-2xl font-bold text-ink">Mentor workspace</h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          A focused workspace for supporting students through placement readiness.
          Mentor tools will be built here.
        </p>
      </section>
    </main>
  );
}
