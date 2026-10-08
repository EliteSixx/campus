"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

export function SkillRadarChart({ data }: { data: { category: string; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgb(var(--border))" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }} />
        <Radar
          dataKey="score"
          stroke="rgb(var(--accent))"
          fill="rgb(var(--accent))"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
