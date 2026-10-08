"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react";
import { useRole } from "@/context/role-context";
import { useUserProfile } from "@/context/user-profile-context";

interface ComponentAnnotation {
  id: string;
  num: string;
  role: string;
  part: string;
  quote: string;
  color: string;
  glowColor: string;
  targetX: number;
  targetY: number;
  elbowX: number;
  side: "left" | "right";
  scrollTrigger: number;
}

const ANNOTATIONS: ComponentAnnotation[] = [
  {
    id: "industry",
    num: "01",
    role: "INDUSTRY",
    part: "BULB / GLASS",
    quote: "The force that creates opportunity.",
    color: "#818cf8", // indigo
    glowColor: "rgba(129,140,248,0.45)",
    targetX: 800,
    targetY: 250,
    elbowX: 900,
    side: "right",
    scrollTrigger: 0.22,
  },
  {
    id: "students",
    num: "02",
    role: "STUDENTS",
    part: "INTERNAL GRID / FILAMENT",
    quote: "The people developing the skills.",
    color: "#00f0ff", // electric cyan
    glowColor: "rgba(0,240,255,0.5)",
    targetX: 575,
    targetY: 350,
    elbowX: 300,
    side: "left",
    scrollTrigger: 0.36,
  },
  {
    id: "alumni",
    num: "03",
    role: "ALUMNI",
    part: "PINCH / NECK",
    quote: "The bridge between learning and industry.",
    color: "#c084fc", // violet
    glowColor: "rgba(192,132,252,0.45)",
    targetX: 635,
    targetY: 550,
    elbowX: 900,
    side: "right",
    scrollTrigger: 0.50,
  },
  {
    id: "faculty",
    num: "04",
    role: "FACULTY",
    part: "CAP / BASE",
    quote: "The mentors shaping capability.",
    color: "#fbbf24", // amber
    glowColor: "rgba(251,191,36,0.45)",
    targetX: 535,
    targetY: 650,
    elbowX: 300,
    side: "left",
    scrollTrigger: 0.64,
  },
  {
    id: "institutions",
    num: "05",
    role: "INSTITUTIONS",
    part: "BASE: PINS / CONTACTS",
    quote: "The foundation connecting it all.",
    color: "#34d399", // emerald
    glowColor: "rgba(52,211,153,0.45)",
    targetX: 635,
    targetY: 750,
    elbowX: 900,
    side: "right",
    scrollTrigger: 0.78,
  },
];

// 50px Blueprint Grid System coordinates
const GRID_COLS = [150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000, 1050];
const GRID_ROWS = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850];

export function EditorialBulbLanding() {
  const { role } = useRole();
  const { currentProfile, hasProfileSetup } = useUserProfile();
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && (Boolean(currentProfile?.name?.trim() || currentProfile?.email?.trim()) || hasProfileSetup(role));

  useEffect(() => {
    let currentScroll = 0;
    let targetScroll = 0;
    let animId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance > 0) {
        // Compute progress strictly relative to the bulb scroll track
        const currentProgress = -rect.top / scrollableDistance;
        targetScroll = Math.min(1.0, Math.max(0.0, currentProgress));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const loop = () => {
      currentScroll += (targetScroll - currentScroll) * 0.085;
      setScrollProgress(currentScroll);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  const p = scrollProgress; // 0.0 -> 1.0

  // 1. SWITCH STATE (The scroll itself activates the physical switch)
  const isSwitchOn = p >= 0.015;
  const switchLeverAngle = Math.min(1.0, Math.max(0.0, (p - 0.008) / 0.035)); // 0 = OFF, 1 = ON

  // 2. HERO SCREEN TRANSITION (Fades and translates up smoothly as user scrolls)
  const heroOpacity = Math.max(0.0, 1.0 - p * 5.5);
  const heroTranslateY = -p * 360;

  // 3. BULB REVEAL (Bulb does NOT appear immediately; it is revealed gradually as user scrolls)
  const bulbEntrance = Math.min(1.0, Math.max(0.0, (p - 0.12) / 0.12));
  const finalTransition = Math.min(1.0, Math.max(0.0, (p - 0.88) / 0.10));

  // Stable vertical position and scale for the central bulb hero:
  const bulbTranslateY = (1 - bulbEntrance) * 140 - finalTransition * 165;
  const bulbScale = 0.98 + bulbEntrance * 0.02 - finalTransition * 0.14;

  // 4. PROGRESSIVE COMPONENT ILLUMINATION (Stays illuminated once revealed)
  const actIndustry = Math.min(1.0, Math.max(0.12, (p - 0.18) / 0.10));
  const actStudents = Math.min(1.0, Math.max(0.0, (p - 0.32) / 0.10));
  const actAlumni = Math.min(1.0, Math.max(0.0, (p - 0.46) / 0.10));
  const actFaculty = Math.min(1.0, Math.max(0.0, (p - 0.60) / 0.10));
  const actInstitutions = Math.min(1.0, Math.max(0.0, (p - 0.74) / 0.10));

  return (
    <div ref={containerRef} className="relative h-[500vh] bg-[#010206] text-white select-none font-sans">
      {/* STICKY VIEWPORT CONTAINER (pins during scroll track, un-pins smoothly afterwards) */}
      <div className="sticky top-0 z-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">
        {/* Subtle radial ambient cosmic glow (tightened for darker periphery) */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(20, 45, 110, ${0.04 + p * 0.05
              }) 0%, rgba(10, 15, 30, ${0.02 + p * 0.02}) 40%, rgba(1, 2, 6, 1) 82%)`,
          }}
        />

        {/* Blueprint coordinate background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.018] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* ============================================================= */}
        {/* TOP PERSISTENT TECHNICAL HEADER (Authoritative Nav)           */}
        {/* ============================================================= */}
        <header className="fixed top-0 inset-x-0 z-40 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between pointer-events-auto backdrop-blur-md bg-[#010206]/75 border-b border-white/5 transition-all">
          {/* Top-left: "THE PLUG" */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/90 shadow-[0_0_8px_#818cf8] animate-pulse" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] text-white/90 uppercase">
              THE PLUG
            </span>
          </Link>

          {/* Center: Integrated Anchor Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-[11px] tracking-[0.2em] uppercase text-slate-400">
            <a href="#how-it-works" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
              <span>HOW IT WORKS</span>
            </a>
            <a href="#stakeholders" className="hover:text-indigo-300 transition-colors flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-indigo-400/60" />
              <span>FOR YOU</span>
            </a>
            <a href="#loop" className="hover:text-emerald-300 transition-colors flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-400/60" />
              <span>THE LOOP</span>
            </a>
          </nav>

          {/* Top-right: "ACADEMIA–INDUSTRY COLLABORATION PORTAL" & Dynamic Auth Button */}
          <div className="flex items-center gap-3 sm:gap-6">
            <span className="hidden xl:inline font-mono text-[10px] sm:text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
              ACADEMIA–INDUSTRY PORTAL
            </span>

            {mounted && (
              isLoggedIn ? (
                <Link
                  href={`/dashboard/${role || "student"}`}
                  className="group relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 hover:border-indigo-400/80 text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-indigo-200 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:shadow-[0_0_22px_rgba(99,102,241,0.5)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                  <span>VIEW DASHBOARD</span>
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-400 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="group relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-indigo-500/50 text-[11px] sm:text-xs font-mono font-semibold tracking-wider text-slate-200 hover:text-white transition-all duration-300 shadow-[0_0_12px_rgba(0,0,0,0.5)]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>SIGN IN</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              )
            )}
          </div>
        </header>

        {/* ============================================================= */}
        {/* SCREEN 1: HERO - EDITORIAL PRODUCT INTRODUCTION               */}
        {/* ============================================================= */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center transition-transform duration-75 ease-out"
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroTranslateY}px)`,
            display: heroOpacity <= 0.01 ? "none" : "flex",
          }}
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center relative">
            {/* Layer of Blue Shine Underneath the Headline Text */}
            <div
              className="pointer-events-none absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] sm:w-[980px] h-[300px] sm:h-[380px] -z-10 rounded-full blur-[95px] opacity-85"
              style={{
                background: "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.45) 0%, rgba(59, 130, 246, 0.30) 35%, rgba(99, 102, 241, 0.12) 65%, transparent 85%)",
              }}
            />
            {/* Concentrated Lower Horizon Blue Shine */}
            <div
              className="pointer-events-none absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] sm:w-[780px] h-[75px] -z-10 rounded-full blur-[42px] opacity-90"
              style={{
                background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.60) 0%, rgba(37, 99, 235, 0.38) 45%, transparent 80%)",
              }}
            />

            {/* Centered above headline: "TALENT × KNOWLEDGE × OPPORTUNITY" */}
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-400/25 bg-indigo-950/20 backdrop-blur-sm">
              <span className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-indigo-300/90 uppercase">
                TALENT × KNOWLEDGE × OPPORTUNITY
              </span>
            </div>

            {/* Main headline with blue shine radiance */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-white mb-6 drop-shadow-[0_0_40px_rgba(14,165,233,0.35)]">
              Universal Connection <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                Universal Impact
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300/80 font-light max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
              Bridging students, institutions, alumni, faculty and industry through one intelligent ecosystem.
            </p>

            {/* "SCROLL TO BEGIN" Metaphor Prompt */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <span className="font-mono text-xs font-semibold tracking-[0.25em] text-indigo-400/90 uppercase">
                SCROLL TO BEGIN
              </span>
              <div className="w-[1px] h-5 bg-gradient-to-b from-indigo-400/80 to-transparent" />
            </div>

            {/* 2D ELECTRICAL PLUG & WALL SWITCH SCHEMATIC */}
            <div className="relative w-[280px] h-[110px] flex items-center justify-center">
              <svg
                viewBox="0 0 280 110"
                className="w-full h-full overflow-visible drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="heroGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Blueprint Framing Cell for Hero Infeed */}
                <rect
                  x="15"
                  y="5"
                  width="250"
                  height="98"
                  rx="3"
                  fill="rgba(129, 140, 248, 0.02)"
                  stroke={isSwitchOn ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.08)"}
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                <text x="24" y="16" fill="rgba(129, 140, 248, 0.45)" fontSize="7" fontFamily="monospace" letterSpacing="1.5">
                  SYS-00 // PRIMARY POWER INLET
                </text>

                {/* 1. Wall Receptacle Socket */}
                <g id="hero-socket" transform="translate(45, 20)">
                  <rect
                    x="0"
                    y="0"
                    width="18"
                    height="60"
                    rx="3"
                    fill="#080e22"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1.2"
                  />
                  <circle cx="9" cy="7" r="1.4" fill="rgba(255, 255, 255, 0.25)" />
                  <circle cx="9" cy="53" r="1.4" fill="rgba(255, 255, 255, 0.25)" />
                  <rect x="10" y="18" width="5" height="8" rx="1" fill="#02040a" />
                  <rect x="10" y="34" width="5" height="8" rx="1" fill="#02040a" />
                </g>

                {/* 2. 2D Electrical Plug */}
                <g id="hero-plug" transform="translate(56, 20)">
                  <rect
                    x="0"
                    y="19"
                    width="10"
                    height="5"
                    rx="1"
                    fill={isSwitchOn ? "#fbbf24" : "#64748b"}
                    className="transition-colors duration-300"
                  />
                  <rect
                    x="0"
                    y="35"
                    width="10"
                    height="5"
                    rx="1"
                    fill={isSwitchOn ? "#fbbf24" : "#64748b"}
                    className="transition-colors duration-300"
                  />
                  <path
                    d="M 9 14 L 35 14 C 40 14, 43 17, 43 22 L 43 38 C 43 43, 40 46, 35 46 L 9 46 Z"
                    fill="#0c142b"
                    stroke={isSwitchOn ? "#818cf8" : "rgba(255, 255, 255, 0.25)"}
                    strokeWidth="1.3"
                    className="transition-colors duration-300"
                  />
                  <line x1="18" y1="21" x2="18" y2="39" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1="25" y1="21" x2="25" y2="39" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <rect x="43" y="24" width="5" height="12" rx="1.5" fill="#1e293b" />
                </g>

                {/* Wire connecting Plug to Switch */}
                <path
                  d="M 104 50 L 160 50"
                  fill="none"
                  stroke={isSwitchOn ? "#6366f1" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="2"
                  className="transition-colors duration-300"
                />

                {/* 3. Physical Wall Switch */}
                <g id="hero-switch" transform="translate(160, 14)">
                  <rect
                    x="0"
                    y="0"
                    width="50"
                    height="72"
                    rx="6"
                    fill="#080e22"
                    stroke={isSwitchOn ? "#818cf8" : "rgba(255, 255, 255, 0.25)"}
                    strokeWidth="1.4"
                    className="transition-colors duration-300"
                  />
                  <rect
                    x="6"
                    y="6"
                    width="38"
                    height="60"
                    rx="4"
                    fill="#040714"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                  <rect
                    x="20"
                    y="18"
                    width="10"
                    height="36"
                    rx="5"
                    fill="#02040b"
                    stroke={isSwitchOn ? "rgba(99, 102, 241, 0.35)" : "rgba(255, 255, 255, 0.12)"}
                    strokeWidth="1"
                  />

                  {/* Corner screws */}
                  <circle cx="9" cy="9" r="1.2" fill="rgba(255,255,255,0.2)" />
                  <circle cx="41" cy="9" r="1.2" fill="rgba(255,255,255,0.2)" />
                  <circle cx="9" cy="63" r="1.2" fill="rgba(255,255,255,0.2)" />
                  <circle cx="41" cy="63" r="1.2" fill="rgba(255,255,255,0.2)" />

                  {/* Toggle Lever Arm (rotates on scroll) */}
                  <g
                    transform={`rotate(${-22 + switchLeverAngle * 44} 25 36)`}
                    className="transition-transform duration-300"
                  >
                    <line
                      x1="25"
                      y1="36"
                      x2="25"
                      y2="18"
                      stroke="#e2e8f0"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="25"
                      cy="16"
                      r="3.8"
                      fill={isSwitchOn ? "#00f0ff" : "#94a3b8"}
                      filter={isSwitchOn ? "url(#heroGlow)" : undefined}
                    />
                  </g>

                  {/* Status Diode: Red when OFF, Green when ON */}
                  <circle
                    cx="12"
                    cy="16"
                    r="2.5"
                    fill={isSwitchOn ? "#10b981" : "#ef4444"}
                    filter={isSwitchOn ? "url(#heroGlow)" : undefined}
                    className="transition-colors duration-300"
                  />
                </g>

                {/* Wire exiting bottom of switch toward bulb */}
                <path
                  d="M 185 86 L 185 110"
                  fill="none"
                  stroke={isSwitchOn ? "#6366f1" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="2"
                  filter={isSwitchOn ? "url(#heroGlow)" : undefined}
                  className="transition-colors duration-300"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SCREEN 2: THE 2D TECHNICAL BULB SCHEMATIC & ECOSYSTEM REVEAL  */}
        {/* The bulb is gradually revealed as user scrolls                */}
        {/* ============================================================= */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center transition-transform duration-100 ease-out will-change-transform"
          style={{
            opacity: bulbEntrance,
            transform: `translateY(${bulbTranslateY}px) scale(${bulbScale})`,
            display: bulbEntrance <= 0.01 ? "none" : "flex",
          }}
        >
          {/* Restrained Technical Header */}
          <div
            className="pointer-events-none mb-3 sm:mb-4 flex items-center justify-center gap-2.5 transition-all duration-500"
            style={{
              opacity: bulbEntrance * (1 - finalTransition * 1.5),
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80 shadow-[0_0_8px_#818cf8]" />
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-[0.3em] text-slate-300/85 uppercase">
              THE WORLD IS A LIGHT BULB
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80 shadow-[0_0_8px_#818cf8]" />
          </div>

          {/* CENTRAL 2D TECHNICAL BULB BLUEPRINT CONTAINER (45-55% viewport height) */}
          <div className="relative w-full max-w-[1260px] h-[58vh] sm:h-[62vh] max-h-[720px] flex items-center justify-center">
            <svg
              viewBox="0 0 1200 880"
              className="w-full h-full drop-shadow-[0_0_30px_rgba(0,0,0,0.85)] overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="bulbSoftGlow2" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="filamentGlow2" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur1" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="bulbGlassGrad2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.03 + actIndustry * 0.12} />
                  <stop offset="60%" stopColor="#4338ca" stopOpacity={0.01 + actIndustry * 0.06} />
                  <stop offset="100%" stopColor="#030718" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              {/* ============================================================= */}
              {/* BLUEPRINT GRID SYSTEM & PROGRESSIVE MODULAR FRAMING           */}
              {/* ============================================================= */}
              <g id="blueprint-grid-system">
                {/* 1. Base Blueprint Coordinate Grid Lines (50px increments) */}
                <g opacity={0.35 + (isSwitchOn ? 0.25 : 0)}>
                  {/* Vertical grid lines */}
                  {GRID_COLS.map((x) => {
                    const isMajor = x % 100 === 0;
                    return (
                      <line
                        key={`grid-col-${x}`}
                        x1={x}
                        y1="40"
                        x2={x}
                        y2="860"
                        stroke="rgba(129, 140, 248, 1)"
                        strokeWidth={isMajor ? "0.9" : "0.5"}
                        strokeOpacity={isMajor ? 0.16 : 0.07}
                        strokeDasharray={isMajor ? undefined : "3 3"}
                      />
                    );
                  })}

                  {/* Horizontal grid lines */}
                  {GRID_ROWS.map((y) => {
                    const isMajor = y % 100 === 0;
                    return (
                      <line
                        key={`grid-row-${y}`}
                        x1="140"
                        y1={y}
                        x2="1060"
                        y2={y}
                        stroke="rgba(129, 140, 248, 1)"
                        strokeWidth={isMajor ? "0.9" : "0.5"}
                        strokeOpacity={isMajor ? 0.16 : 0.07}
                        strokeDasharray={isMajor ? undefined : "3 3"}
                      />
                    );
                  })}

                  {/* Blueprint intersection crosshairs at major nodes */}
                  {[
                    [300, 250], [300, 350], [300, 550], [300, 650], [300, 750],
                    [900, 250], [900, 350], [900, 550], [900, 650], [900, 750],
                    [600, 100], [600, 200], [600, 350], [600, 500], [600, 650], [600, 750],
                    [400, 250], [800, 250], [400, 700], [800, 700],
                  ].map(([cx, cy], i) => (
                    <g key={`crosshair-${i}`} opacity="0.4">
                      <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke="#818cf8" strokeWidth="0.8" />
                      <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="#818cf8" strokeWidth="0.8" />
                    </g>
                  ))}

                  {/* Perimeter technical coordinate notations */}
                  <text x="145" y="48" fill="rgba(129, 140, 248, 0.35)" fontSize="8" fontFamily="monospace" letterSpacing="1.5">
                    SEC 01 // 2D SCHEMATIC
                  </text>
                  <text x="960" y="48" fill="rgba(129, 140, 248, 0.35)" fontSize="8" fontFamily="monospace" letterSpacing="1.5">
                    SCALE: 50x50mm
                  </text>
                  <text x="145" y="855" fill="rgba(129, 140, 248, 0.3)" fontSize="8" fontFamily="monospace" letterSpacing="1.5">
                    REF: PLUG-BP-2026
                  </text>
                </g>
              </g>

              {/* ============================================================= */}
              {/* SCHEMATIC POWER FEED (Deliberate grid-aligned wiring)          */}
              {/* ============================================================= */}
              <g id="schematic-power-feed">
                {/* Center top feed line continuing from switch down along X=600 grid line */}
                <path
                  d="M 600 0 L 600 70"
                  fill="none"
                  stroke={isSwitchOn ? "#6366f1" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="2"
                  strokeDasharray={isSwitchOn ? undefined : "3 3"}
                  filter={isSwitchOn ? "url(#bulbSoftGlow2)" : undefined}
                />

                {/* Base contacts feed wires routed along grid channels with gentle 90deg rounded turns */}
                {/* Left contact wire: runs along X=575 down to Y=830, turns along Y=850, then down X=330 */}
                <path
                  d="M 575 770 L 575 830 Q 575 850 550 850 L 350 850 Q 330 850 330 870 L 330 880"
                  fill="none"
                  stroke={isSwitchOn ? "#6366f1" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="2"
                  strokeOpacity={isSwitchOn ? 0.85 : 0.25}
                  filter={isSwitchOn ? "url(#bulbSoftGlow2)" : undefined}
                />

                {/* Right contact wire: runs along X=625 down to Y=830, turns along Y=850, then down X=870 */}
                <path
                  d="M 625 770 L 625 830 Q 625 850 650 850 L 850 850 Q 870 850 870 870 L 870 880"
                  fill="none"
                  stroke={isSwitchOn ? "#6366f1" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="2"
                  strokeOpacity={isSwitchOn ? 0.85 : 0.25}
                  filter={isSwitchOn ? "url(#bulbSoftGlow2)" : undefined}
                />
              </g>

              {/* ============================================================= */}
              {/* 1. INDUSTRY -> BULB / GLASS (Outer Envelope Hero)             */}
              {/* ============================================================= */}
              <g id="component-industry">
                <path
                  d="M 600 70 
                     C 740 70, 820 170, 820 290
                     C 820 395, 770 475, 720 540
                     C 695 575, 670 605, 665 630
                     L 535 630
                     C 530 605, 505 575, 480 540
                     C 430 475, 380 395, 380 290
                     C 380 170, 460 70, 600 70 Z"
                  fill="url(#bulbGlassGrad2)"
                  stroke={actIndustry > 0.25 ? "#818cf8" : "rgba(255, 255, 255, 0.3)"}
                  strokeWidth={actIndustry > 0.35 ? 2.4 : 1.6}
                  strokeOpacity={0.4 + actIndustry * 0.6}
                  filter={actIndustry > 0.45 ? "url(#bulbSoftGlow2)" : undefined}
                  className="transition-colors duration-400"
                />

                {/* Glass reflection lines */}
                <path
                  d="M 435 170 C 405 220, 400 270, 405 325"
                  fill="none"
                  stroke="#c7d2fe"
                  strokeWidth="1.4"
                  strokeOpacity={0.15 + actIndustry * 0.45}
                  strokeLinecap="round"
                />
                <path
                  d="M 765 180 C 795 230, 800 280, 795 335"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.4"
                  strokeOpacity={0.12 + actIndustry * 0.4}
                  strokeLinecap="round"
                />
              </g>

              {/* ============================================================= */}
              {/* 2. STUDENTS -> COILED TUNGSTEN FILAMENT (Energy core)         */}
              {/* ============================================================= */}
              <g id="component-students">
                {/* Upper filament support anchor */}
                <circle
                  cx="600"
                  cy="208"
                  r="3.5"
                  fill={actStudents > 0.2 ? "#38bdf8" : "rgba(255, 255, 255, 0.3)"}
                  filter={actStudents > 0.3 ? "url(#bulbSoftGlow2)" : undefined}
                />

                {/* Single Continuous Coiled Tungsten Filament Wire */}
                <path
                  d="
                    M 600 208 L 600 224
                    C 588 224, 577 228, 577 240
                    L 577 252
                    C 577 262, 588 266, 598.5 266
                    L 598.5 272
                    C 588 272, 577 276, 577 288
                    L 577 300
                    C 577 310, 588 314, 598.5 314
                    L 598.5 320
                    C 588 320, 577 324, 577 336
                    L 577 348
                    C 577 358, 588 362, 598.5 362
                    L 598.5 368
                    C 588 368, 577 372, 577 384
                    L 577 396
                    C 577 406, 588 410, 598.5 410
                    L 598.5 416
                    C 588 416, 577 420, 577 432
                    L 577 444
                    C 577 454, 588 458, 600 458
                    L 600 480
                    L 600 458
                    C 612 458, 623 454, 623 444
                    L 623 432
                    C 623 420, 612 416, 601.5 416
                    L 601.5 410
                    C 612 410, 623 406, 623 396
                    L 623 384
                    C 623 372, 612 368, 601.5 368
                    L 601.5 362
                    C 612 362, 623 358, 623 348
                    L 623 336
                    C 623 324, 612 320, 601.5 320
                    L 601.5 314
                    C 612 314, 623 310, 623 300
                    L 623 288
                    C 623 276, 612 272, 601.5 272
                    L 601.5 266
                    C 612 266, 623 262, 623 252
                    L 623 240
                    C 623 228, 612 224, 600 224
                    L 600 208
                  "
                  fill="none"
                  stroke={actStudents > 0.2 ? "#00f0ff" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth={actStudents > 0.3 ? 1.8 : 1.4}
                  strokeOpacity={0.35 + actStudents * 0.65}
                  filter={actStudents > 0.35 ? "url(#filamentGlow2)" : undefined}
                  className="transition-colors duration-300"
                />
              </g>

              {/* ============================================================= */}
              {/* 3. ALUMNI -> PINCH / NECK (Glass Stem with Window)            */}
              {/* ============================================================= */}
              <g id="component-alumni">
                <path
                  d="M 570 470 L 570 545 C 570 580, 540 600, 540 630 L 660 630 C 660 600, 630 580, 630 545 L 630 470 Z"
                  fill={actAlumni > 0.25 ? "rgba(192, 132, 252, 0.08)" : "none"}
                  stroke={actAlumni > 0.2 ? "#c084fc" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth={actAlumni > 0.3 ? 2.2 : 1.4}
                  strokeOpacity={0.35 + actAlumni * 0.65}
                  filter={actAlumni > 0.35 ? "url(#bulbSoftGlow2)" : undefined}
                />
                <rect
                  x="582"
                  y="488"
                  width="36"
                  height="24"
                  rx="3"
                  fill="#060c20"
                  stroke={actAlumni > 0.2 ? "#c084fc" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth="1.4"
                  strokeOpacity={0.4 + actAlumni * 0.6}
                />
              </g>

              {/* ============================================================= */}
              {/* 4. FACULTY -> CAP / BASE (Threaded Collar)                    */}
              {/* ============================================================= */}
              <g id="component-faculty">
                <path
                  d="M 535 630 L 535 705 C 535 722, 665 722, 665 705 L 665 630 Z"
                  fill="#0a0f24"
                  stroke={actFaculty > 0.2 ? "#fbbf24" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth={actFaculty > 0.3 ? 2.2 : 1.5}
                  strokeOpacity={0.35 + actFaculty * 0.65}
                  filter={actFaculty > 0.35 ? "url(#bulbSoftGlow2)" : undefined}
                />
                {[648, 668, 688, 705].map((y, i) => (
                  <path
                    key={`thread-${i}`}
                    d={`M 535 ${y} Q 600 ${y + 10} 665 ${y}`}
                    fill="none"
                    stroke={actFaculty > 0.2 ? "#fde68a" : "rgba(255, 255, 255, 0.2)"}
                    strokeWidth={actFaculty > 0.3 ? 1.8 : 1.2}
                    strokeOpacity={0.3 + actFaculty * 0.7}
                  />
                ))}
              </g>

              {/* ============================================================= */}
              {/* 5. INSTITUTIONS -> PINS / CONTACTS (Base Foundation)          */}
              {/* ============================================================= */}
              <g id="component-institutions">
                <path
                  d="M 558 705 C 578 720, 622 720, 642 705 L 634 726 C 620 736, 580 736, 566 726 Z"
                  fill="#030814"
                  stroke={actInstitutions > 0.2 ? "#34d399" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="1.4"
                  strokeOpacity={0.35 + actInstitutions * 0.65}
                />
                <g filter={actInstitutions > 0.35 ? "url(#bulbSoftGlow2)" : undefined}>
                  <rect
                    x="568"
                    y="726"
                    width="14"
                    height="44"
                    rx="2.5"
                    fill={actInstitutions > 0.25 ? "#34d399" : "rgba(255, 255, 255, 0.22)"}
                    stroke={actInstitutions > 0.25 ? "#a7f3d0" : "rgba(255, 255, 255, 0.3)"}
                    strokeWidth="1"
                    opacity={0.4 + actInstitutions * 0.6}
                  />
                  <rect
                    x="618"
                    y="726"
                    width="14"
                    height="44"
                    rx="2.5"
                    fill={actInstitutions > 0.25 ? "#34d399" : "rgba(255, 255, 255, 0.22)"}
                    stroke={actInstitutions > 0.25 ? "#a7f3d0" : "rgba(255, 255, 255, 0.3)"}
                    strokeWidth="1"
                    opacity={0.4 + actInstitutions * 0.6}
                  />
                  <ellipse
                    cx="600"
                    cy="737"
                    rx="14"
                    ry="5.5"
                    fill={actInstitutions > 0.25 ? "#10b981" : "rgba(255, 255, 255, 0.22)"}
                    opacity={0.45 + actInstitutions * 0.55}
                  />
                </g>
              </g>

              {/* ============================================================= */}
              {/* PRECISE TECHNICAL ANNOTATIONS (DO NOT SHOW EVERYTHING AT ONCE) */}
              {/* Only the ACTIVE annotation is prominent.                      */}
              {/* Past annotations become quiet. Future annotations are hidden.  */}
              {/* ============================================================= */}
              {ANNOTATIONS.map((s, idx) => {
                const nextTrigger = idx < ANNOTATIONS.length - 1 ? ANNOTATIONS[idx + 1].scrollTrigger : 0.90;
                const isActive = p >= s.scrollTrigger && p < nextTrigger;
                const isPast = p >= nextTrigger;

                let itemOpacity = 0;
                if (isActive) {
                  itemOpacity = Math.min(1.0, (p - s.scrollTrigger) / 0.04);
                } else if (isPast) {
                  itemOpacity = 0.58;
                }

                // Smooth fade-out during final stage
                itemOpacity *= Math.max(0.0, 1.0 - finalTransition * 2.2);

                if (itemOpacity <= 0.01) return null;

                return (
                  <g
                    key={s.id}
                    opacity={itemOpacity}
                    className="transition-opacity duration-300"
                  >
                    {/* Thin connector line from exact component target to label */}
                    <line
                      x1={s.targetX}
                      y1={s.targetY}
                      x2={s.elbowX}
                      y2={s.targetY}
                      stroke={s.color}
                      strokeWidth={isActive ? "1.8" : "1.2"}
                      strokeDasharray={isActive ? "4 3" : "2 3"}
                      strokeOpacity={isActive ? 0.95 : 0.55}
                    />

                    {/* Small anchor dot on component */}
                    <circle
                      cx={s.targetX}
                      cy={s.targetY}
                      r={isActive ? 5 : 3.5}
                      fill={s.color}
                      filter={isActive ? "url(#bulbSoftGlow2)" : undefined}
                    />

                    {/* Blueprint Grid Intersection Snap Marker */}
                    <g opacity={isActive ? 0.95 : 0.5}>
                      <line x1={s.elbowX - 6} y1={s.targetY} x2={s.elbowX + 6} y2={s.targetY} stroke={s.color} strokeWidth="1.2" />
                      <line x1={s.elbowX} y1={s.targetY - 6} x2={s.elbowX} y2={s.targetY + 6} stroke={s.color} strokeWidth="1.2" />
                      <rect
                        x={s.elbowX - 2.5}
                        y={s.targetY - 2.5}
                        width="5"
                        height="5"
                        fill={s.color}
                        filter={isActive ? "url(#bulbSoftGlow2)" : undefined}
                      />
                    </g>

                    {/* Label Group */}
                    <g transform={`translate(${s.elbowX}, ${s.targetY})`}>
                      {/* 1. Category Identifier (e.g. 01 // INDUSTRY) */}
                      <text
                        x={s.side === "right" ? 18 : -18}
                        y={-32}
                        textAnchor={s.side === "right" ? "start" : "end"}
                        fill={s.color}
                        fontSize={isActive ? "28" : "25"}
                        fontFamily="monospace"
                        fontWeight="800"
                        letterSpacing="3.5"
                        filter={isActive ? "url(#bulbSoftGlow2)" : undefined}
                      >
                        {s.num} // {s.role}
                      </text>

                      {/* 2. Physical Bulb Part (e.g. BULB / GLASS) */}
                      <text
                        x={s.side === "right" ? 18 : -18}
                        y={-7}
                        textAnchor={s.side === "right" ? "start" : "end"}
                        fill="rgba(255, 255, 255, 0.82)"
                        fontSize="16"
                        fontFamily="monospace"
                        fontWeight="600"
                        letterSpacing="2.2"
                      >
                        {s.part}
                      </text>

                      {/* 3. Metaphor Quote */}
                      <text
                        x={s.side === "right" ? 18 : -18}
                        y={30}
                        textAnchor={s.side === "right" ? "start" : "end"}
                        fill="rgba(255, 255, 255, 0.98)"
                        fontSize="20"
                        fontStyle="italic"
                        fontWeight="400"
                        letterSpacing="0.4"
                      >
                        &ldquo;{s.quote}&rdquo;
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ============================================================= */}
        {/* FINAL STATE: CLEAN CINEMATIC TYPOGRAPHY BELOW THE BULB         */}
        {/* NO cards, NO floating box, NO panel, ZERO overlap with bulb!  */}
        {/* ============================================================= */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-6 sm:bottom-10 z-30 flex flex-col items-center text-center px-6 transition-all duration-500"
          style={{
            opacity: finalTransition,
            transform: `translateY(${(1 - finalTransition) * 30}px)`,
            display: finalTransition <= 0.01 ? "none" : "flex",
          }}
        >
          <div className="max-w-xl mx-auto space-y-3">
            {/* Clean headline directly on midnight background */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              One ecosystem. <br />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent">
                Every connection.
              </span>
            </h2>

            {/* Supporting description */}
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-light leading-relaxed">
              Connecting students, institutions, faculty, alumni and industry through skills,
              opportunities and collaboration.
            </p>

            {/* Minimal CTA link */}
            <div className="pt-2">
              <Link
                href="/login"
                className="pointer-events-auto inline-flex items-center gap-2 px-7 py-3 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-100 font-medium text-xs sm:text-sm tracking-wider uppercase border border-indigo-400/40 hover:border-indigo-300 backdrop-blur-md transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_30px_rgba(99,102,241,0.45)] group"
              >
                <span>Explore the platform</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-cyan-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
