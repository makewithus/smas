"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#1B4332",
  "#D39542",
  "#8C7B6B",
  "#3D3227",
  "#A3C4BC",
  "#C4A882",
  "#6B9E8A",
];

export default function ExpenseCategoryChart({
  data = [],
  dataKey = "amount",
  xKey = "category",
  height = 260,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#E8DFD4"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#8C7B6B" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "#8C7B6B" }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Amount"]}
          contentStyle={{ fontSize: 12, borderColor: "#E8DFD4" }}
        />
        <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
