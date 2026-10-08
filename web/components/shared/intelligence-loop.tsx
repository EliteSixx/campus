"use client";

import { Building2, Radar, Users, TrendingDown, Lightbulb, Briefcase } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const loopSteps = [
  { label: "Industry Demand", icon: Building2 },
  { label: "Skill Intelligence Engine", icon: Radar },
  { label: "Student + Faculty + Institution", icon: Users },
  { label: "Skill Gap Detection", icon: TrendingDown },
  { label: "Recommended Intervention", icon: Lightbulb },
  { label: "Improved Employability", icon: Briefcase },
];

export function IntelligenceLoop() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col">
        {loopSteps.map((step, i) => {
          const Icon = step.icon;
          const isEngine = i === 1;
          const isLast = i === loopSteps.length - 1;
          return (
            <motion.div
              key={step.label}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex flex-col items-center"
            >
              <motion.div
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { scale: 1.02, x: 2 }
                }
                transition={{ duration: 0.2 }}
                className={`flex w-full max-w-md items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                  isEngine
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface hover:border-accent/50 hover:bg-accent-soft/20"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                    isEngine ? "bg-accent text-white" : "bg-surface-raised text-ink-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-sm font-medium ${isEngine ? "text-accent font-semibold" : "text-ink"}`}>
                  {step.label}
                </span>
                <span className="ml-auto font-mono text-xs text-ink-faint tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
              {!isLast && (
                <div className="my-1 h-6 w-px bg-border" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
