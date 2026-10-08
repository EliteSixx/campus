import Link from "next/link";
import { ArrowRight, PlayCircle, GraduationCap, Building2, Landmark, Users, ClipboardCheck, Radar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/shared/landing-nav";
import { StakeholderCard } from "@/components/shared/stakeholder-card";
import { IntelligenceLoop } from "@/components/shared/intelligence-loop";
import { Reveal } from "@/components/shared/landing-motion";

const howItWorks = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description: "Students, faculty, and institutions feed in verified skill evidence — assessments, projects, evaluations.",
  },
  {
    icon: Radar,
    title: "Detect",
    description: "The skill intelligence engine compares that data against live industry demand to surface real gaps.",
  },
  {
    icon: Target,
    title: "Intervene",
    description: "Every gap comes with a measured, targeted program — not a generic course catalog.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <LandingNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:px-6 md:pb-24 md:pt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
            Closed-loop industry-academia skill intelligence
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">
            Bridge the Gap Between Skills and Opportunity.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
            The Plug connects students, institutions, faculty, alumni, and industry through real-time skill intelligence.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard/student">
              <Button size="md" className="w-full sm:w-auto">
                Explore Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/institution">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                <PlayCircle className="h-4 w-4" />
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Signature comparison strip */}
        <Reveal className="mx-auto mt-14 max-w-3xl rounded-lg border border-border bg-surface p-5 shadow-card" delay={0.12}>
          <p className="mb-3 text-xs font-medium text-ink-muted">A live read on one institution&apos;s Cloud Computing readiness</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>Industry demand</span>
              <span className="font-mono tabular">72%</span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-raised">
              <div className="absolute inset-y-0 left-0 rounded-full bg-ink-faint/50" style={{ width: "72%" }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-danger" style={{ width: "21%" }} />
              <div className="absolute inset-y-0 w-px bg-ink" style={{ left: "72%" }} />
            </div>
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>Student readiness</span>
              <span className="font-mono tabular">21%</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-danger">51-point gap flagged for intervention ΓåÆ</p>
        </Reveal>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-canvas py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="mb-10 max-w-lg">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">How it works</h2>
            <p className="mt-2 text-2xl font-semibold text-ink">
              From raw skill data to a measurable intervention.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {howItWorks.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 0.1}
                className={`min-h-[220px] rounded-xl border border-accent/35 bg-accent-soft/35 p-6 transition-all duration-300 hover:border-accent/70 hover:bg-accent-soft/50 dark:bg-accent-soft/20 dark:hover:bg-accent-soft/30 ${
                  i === 0 ? "hover:shadow-[0_0_34px_-8px_rgb(var(--accent)/0.95)]" : "hover:shadow-[0_14px_36px_-18px_rgb(var(--accent)/0.8)]"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/50 bg-accent-soft text-accent">
                  <step.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-accent">
                  <span className="font-mono text-accent/70">{String(i + 1).padStart(2, "0")}.</span> {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section id="stakeholders" className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="mb-10 max-w-lg">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">Built for every stakeholder</h2>
            <p className="mt-2 text-2xl font-semibold text-ink">One data layer, four different views.</p>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal delay={0}>
              <StakeholderCard
                icon={GraduationCap}
                title="Students"
                description="See exactly where you stand against the role you want."
                points={["Evidence-backed skill scores", "Ranked opportunity matches", "A clear next learning step"]}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <StakeholderCard
                icon={Building2}
                title="Industry"
                description="Find candidates by verified skill fit, not keyword-matched resumes."
                points={["Candidate intelligence table", "Live market skill demand", "Match scores per applicant"]}
              />
            </Reveal>
            <Reveal delay={0.2}>
              <StakeholderCard
                icon={Landmark}
                title="Institutions"
                description="See where your cohort is strong and where it's structurally weak."
                points={["Demand vs. readiness by skill", "Critical gap detection", "Intervention simulator"]}
              />
            </Reveal>
            <Reveal delay={0.3}>
              <StakeholderCard
                icon={Users}
                title="Faculty"
                description="Know which skills your students are missing before placement season."
                points={["Department-level skill gaps", "Industry immersion programs", "Faculty development tracks"]}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Intelligence loop */}
      <section id="loop" className="border-t border-border bg-canvas py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="mb-10 text-center">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">The core intelligence loop</h2>
            <p className="mx-auto mt-2 max-w-lg text-2xl font-semibold text-ink">
              Every gap detected feeds directly back into a targeted intervention.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <IntelligenceLoop />
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 md:py-20">
        <Reveal className="mx-auto max-w-2xl px-4 text-center md:px-6">
          <p className="text-2xl font-semibold text-ink">Ready to see your own skill gaps?</p>
          <p className="mt-2 text-sm text-ink-muted">Explore a live student, institution, industry, or faculty dashboard.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard/student">
              <Button size="md">
                Explore Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="md">Create an account</Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-ink-faint sm:flex-row md:px-6">
          <span>The Plug ΓÇö Smart India Hackathon MVP</span>
          <span>Built with mock data ┬╖ FastAPI-ready API layer</span>
        </div>
      </footer>
    </div>
  );
}
