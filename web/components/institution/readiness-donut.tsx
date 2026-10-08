"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const COLORS = [
  "rgb(var(--success))",
  "rgb(var(--warning))",
  "rgb(var(--danger))",
];

export function ReadinessDonut({ data }: { data: { bucket: string; count: number; percent: number }[] }) {
  return (
    <div className="flex items-center gap-6">
      <div className="h-[160px] w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="bucket"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              strokeWidth={2}
              stroke="rgb(var(--surface))"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgb(var(--surface))",
                border: "1px solid rgb(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={item.bucket} className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <div>
              <p className="text-xs font-medium text-ink">{item.bucket}</p>
              <p className="text-xs text-ink-muted">
                <span className="font-mono font-semibold tabular">{item.count}</span> students ({item.percent}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
