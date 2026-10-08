"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";

export function DeptSkillRadar({
  data,
}: {
  data: { category: string; score: number; benchmark: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgb(var(--border))" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }} />
        <Radar
          dataKey="benchmark"
          name="Industry Benchmark"
          stroke="rgb(var(--ink-faint))"
          fill="rgb(var(--ink-faint))"
          fillOpacity={0.15}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <Radar
          dataKey="score"
          name="Department Avg"
          stroke="rgb(var(--accent))"
          fill="rgb(var(--accent))"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
