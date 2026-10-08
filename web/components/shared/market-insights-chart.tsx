"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MarketInsightsChart({ data }: { data: { skill: string; change: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }} axisLine={false} tickLine={false} unit="%" />
        <YAxis
          type="category"
          dataKey="skill"
          tick={{ fontSize: 12, fill: "rgb(var(--ink))" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={{
            background: "rgb(var(--surface))",
            border: "1px solid rgb(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number) => [`+${value}%`, "Demand growth"]}
        />
        <Bar dataKey="change" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((d) => (
            <Cell key={d.skill} fill="rgb(var(--accent))" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
