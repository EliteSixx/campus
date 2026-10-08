"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DemandReadinessChart({
  data,
}: {
  data: { skill: string; industryDemand: number; studentReadiness: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
        <XAxis
          dataKey="skill"
          tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }}
          axisLine={{ stroke: "rgb(var(--border))" }}
          tickLine={false}
          interval={0}
          angle={-12}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{
            background: "rgb(var(--surface))",
            border: "1px solid rgb(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="industryDemand" name="Industry demand" fill="rgb(var(--ink-faint))" radius={[3, 3, 0, 0]} />
        <Bar dataKey="studentReadiness" name="Student readiness" fill="rgb(var(--accent))" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
