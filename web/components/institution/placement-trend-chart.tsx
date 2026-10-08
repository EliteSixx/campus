"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

export function PlacementTrendChart({ data }: { data: { year: string; placed: number; total: number; rate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: "rgb(var(--ink-muted))" }} axisLine={{ stroke: "rgb(var(--border))" }} tickLine={false} />
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
        <Line type="monotone" dataKey="placed" name="Students Placed" stroke="rgb(var(--accent))" strokeWidth={2.5} dot={{ r: 4, fill: "rgb(var(--accent))" }} />
        <Line type="monotone" dataKey="rate" name="Placement %" stroke="rgb(var(--success))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "rgb(var(--success))" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
