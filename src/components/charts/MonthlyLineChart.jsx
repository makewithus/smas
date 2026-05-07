"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MonthlyLineChart({
  data = [],
  lines = [{ key: "amount", color: "#1B4332", label: "Amount" }],
  xKey = "month",
  height = 260,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD4" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "#8C7B6B" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8C7B6B" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
          contentStyle={{ fontSize: 12, borderColor: "#E8DFD4" }}
        />
        {lines.length > 1 && (
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        )}
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label || l.key}
            stroke={l.color || "#1B4332"}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
