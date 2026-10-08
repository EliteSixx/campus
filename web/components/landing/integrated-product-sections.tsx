"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Radar,
  Target,
  GraduationCap,
  Users2,
  Building2,
  Landmark,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Layers,
} from "lucide-react";
import { IntelligenceLoop } from "@/components/shared/intelligence-loop";
import { Reveal } from "@/components/shared/landing-motion";

const howItWorksSteps = [
  {
    step: "01",
    label: "ASSESS",
    title: "Continuous Skill Telemetry",
    color: "#00f0ff", // electric cyan
    glow: "rgba(0, 240, 255, 0.4)",
    icon: ClipboardCheck,
    coords: "X:142 · Y:088",
    description:
      "Students, faculty, and institutions feed in verified skill evidence — code reviews, project milestones, verified coursework, and real assessments.",
  },
  {
    step: "02",
    label: "DETECT",
    title: "Dynamic Market Gap Engine",
    color: "#818cf8", // indigo
    glow: "rgba(129, 140, 248, 0.4)",
    icon: Radar,
    coords: "X:420 · Y:210",
    description:
      "The skill intelligence engine compares that verified data against live industry demand and hiring telemetry to surface real, structural capability gaps.",
  },
  {
    step: "03",
    label: "INTERVENE",
    title: "Precision Capability Routing",
    color: "#34d399", // emerald
    glow: "rgba(52, 211, 153, 0.4)",
    icon: Target,
    coords: "X:710 · Y:340",
    description:
      "Every detected deficit initiates a measured, targeted program with alumni mentorship and industry challenges — not an unverified generic catalog.",
  },
];

const stakeholders = [
  {
    id: "students",
    num: "01",
    role: "STUDENTS",
    color: "#00f0ff", // cyan
    icon: GraduationCap,
    tagline: "Know exactly where your capability stands against the market.",
    points: [
      "Evidence-backed skill telemetry & scores",
      "Ranked opportunity matching & gap alerts",
      "Clear, verified next intervention step",
    ],
  },
  {
    id: "alumni",
    num: "02",
    role: "ALUMNI",
    color: "#c084fc", // violet
    icon: Users2,
    tagline: "The active bridge between academic learning and industry careers.",
    points: [
      "Verified candidate referral pipeline",
      "1-on-1 mentorship session dispatch",
      "Direct student proof review & validation",
    ],
  },
  {
    id: "industry",
    num: "03",
    role: "INDUSTRY",
    color: "#818cf8", // indigo
    icon: Building2,
    tagline: "Recruit talent by proven capability, not keyword-stuffed resumes.",
    points: [
      "Verified candidate intelligence leaderboard",
      "Real-time market skill demand tracking",
      "Direct video brief & role posting workspace",
    ],
  },
  {
    id: "institutions",
    num: "04",
    role: "INSTITUTIONS",
    color: "#34d399", // emerald
    icon: Landmark,
    tagline: "Quantify cohort strengths and pinpoint structural curriculum weaknesses.",
    points: [
      "Department-level demand vs. readiness",
      "Automated critical deficit detection",
      "Placement outcome telemetry & simulation",
    ],
  },
  {
    id: "faculty",
    num: "05",
    role: "FACULTY",
    color: "#fbbf24", // amber
    icon: BookOpen,
    tagline: "Identify competency shortfalls before students reach hiring drives.",
    points: [
      "Subject & branch level diagnostics",
      "Industry immersion program alignment",
      "Personalized student guidance tracking",
    ],
  },
];

export function IntegratedProductSections() {
  return (
    <section className="relative z-10 bg-[#010206] text-white select-none overflow-x-hidden border-t border-white/10 font-sans">
      {/* Background blueprint coordinate grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Atmospheric subtle radial glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] blur-[140px] opacity-40 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.25) 0%, rgba(14, 165, 233, 0.15) 45%, transparent 75%)",
        }}
      />

      {/* ========================================================================= */}
      {/* SECTION 01: HOW IT WORKS                                                 */}
      {/* ========================================================================= */}
      <div id="how-it-works" className="relative mx-auto max-w-6xl px-4 pt-20 pb-20 sm:px-6 lg:px-8">
        {/* Technical section header */}
        <Reveal className="mb-14">
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <span>01 // SYSTEM PIPELINE</span>
            <span className="text-white/20">·······················································</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            How It Works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 font-light max-w-2xl leading-relaxed">
            From raw, multi-source student evidence to closed-loop capability verification and targeted intervention.
          </p>
        </Reveal>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {howItWorksSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Reveal
                key={s.step}
                delay={idx * 0.12}
                className="group relative rounded-xl border border-white/10 bg-[#070b19]/75 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/25 hover:shadow-[0_0_35px_-8px_rgba(99,102,241,0.3)] flex flex-col justify-between"
              >
                {/* Blueprint Corner Accents */}
                <div className="absolute top-2 right-2 font-mono text-[9px] text-slate-500 tracking-wider">
                  [{s.coords}]
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 transition-transform duration-300 group-hover:scale-105"
                      style={{ color: s.color, boxShadow: `0 0 16px ${s.glow}` }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className="font-mono text-xs font-bold tracking-widest"
                      style={{ color: s.color }}
                    >
                      {s.step} {"//"} {s.label}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base sm:text-lg font-bold text-white tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                    {s.description}
                  </p>
                </div>

                {/* Sub-telemetry line */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>TELEMETRY VERIFIED</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" /> ACTIVE
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Signature Comparison Telemetry Strip (Preserved & Blueprint Styled) */}
        <Reveal delay={0.25} className="mt-10 rounded-xl border border-white/10 bg-[#070b19]/60 backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
              <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.2em] text-slate-300 uppercase">
                TELEMETRY DIAGNOSTIC // CLOUD COMPUTING READINESS
              </span>
            </div>
            <span className="font-mono text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
              51-POINT GAP FLAGGED FOR INTERVENTION
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-indigo-400" />
                <span>Industry Demand Index</span>
              </span>
              <span className="text-white font-bold">72%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-white/10">
              <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-500/70 shadow-[0_0_12px_#6366f1]" style={{ width: "72%" }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e]" style={{ width: "21%" }} />
              <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_#ffffff]" style={{ left: "72%" }} />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-rose-400" />
                <span>Student Cohort Readiness</span>
              </span>
              <span className="text-rose-400 font-bold">21%</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Atmospheric separator line */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 02: STAKEHOLDERS (5 CANONICAL THE PLUG ROLES)                    */}
      {/* ========================================================================= */}
      <div id="stakeholders" className="relative mx-auto max-w-6xl px-4 pt-20 pb-20 sm:px-6 lg:px-8">
        <Reveal className="mb-14">
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] text-indigo-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse" />
            <span>02 // OPERATIONAL VIEWS</span>
            <span className="text-white/20">·······················································</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Built for Every Stakeholder
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 font-light max-w-2xl leading-relaxed">
            One single unified skill intelligence core, five specialized operational interfaces tailored to every stakeholder.
          </p>
        </Reveal>

        {/* 5 Stakeholder Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stakeholders.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Reveal
                key={s.id}
                delay={idx * 0.08}
                className="group relative rounded-xl border border-white/10 bg-[#070b19]/80 backdrop-blur-xl p-6 transition-all duration-300 hover:border-white/25 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.25)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5"
                      style={{ color: s.color }}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span
                      className="font-mono text-[11px] font-bold tracking-widest"
                      style={{ color: s.color }}
                    >
                      {s.num} {"//"} {s.role}
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm font-medium text-slate-200 leading-snug">
                    {s.tagline}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {s.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400 font-light">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                  <span>ACCESS TELEMETRY</span>
                  <ChevronRight className="h-3 w-3" style={{ color: s.color }} />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Atmospheric separator line */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 03: THE INTELLIGENCE LOOP                                         */}
      {/* ========================================================================= */}
      <div id="loop" className="relative mx-auto max-w-6xl px-4 pt-20 pb-20 sm:px-6 lg:px-8">
        <Reveal className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] text-emerald-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <span>03 // CLOSED-LOOP TELEMETRY</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            The Core Intelligence Loop
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
            Every diagnosed gap cycles back through verified intervention, proof reviews, and calibrated opportunity routing.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="rounded-2xl border border-white/10 bg-[#070b19]/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
          <IntelligenceLoop />
        </Reveal>
      </div>

      {/* Atmospheric separator line */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* CLOSING CTA                                                              */}
      {/* ========================================================================= */}
      <div className="relative mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.25em] text-indigo-400 uppercase">
            [ INITIALIZE TELEMETRY ]
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Ready to See Your Own Skill Gaps?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 font-light max-w-lg mx-auto leading-relaxed">
            Explore live student, alumni, industry, institution, or faculty dashboards in prototype mode.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/student"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] group"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-300 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-mono text-xs sm:text-sm tracking-wider uppercase backdrop-blur-md transition-all duration-300"
            >
              <span>Create an Account</span>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Engineering Blueprint Footer */}
      <footer className="border-t border-white/10 py-8 px-4 sm:px-8 bg-[#010206]">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400">THE PLUG</span>
            <span>{"//"} CLOSED-LOOP SKILL INTELLIGENCE ENGINE</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>SMART INDIA HACKATHON MVP</span>
            <span className="hidden sm:inline">·</span>
            <span>CANONICAL 5-ROLE PROTOTYPE</span>
          </div>
        </div>
      </footer>
    </section>
  );
}
