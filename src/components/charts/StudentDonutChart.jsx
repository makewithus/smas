"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#1B4332", "#D39542", "#8C7B6B", "#3D3227", "#A3C4BC"];

export default function StudentDonutChart({
  data = [],
  nameKey = "name",
  valueKey = "value",
  height = 260,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          dataKey={valueKey}
          nameKey={nameKey}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: 12, borderColor: "#E8DFD4" }} />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
