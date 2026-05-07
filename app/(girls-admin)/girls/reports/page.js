"use client";

import { useState, useEffect } from "react";
import { Users, Download, FileSpreadsheet, FileText } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/src/lib/utils";
import { CLASSES, EXPENSE_CATEGORIES } from "@/src/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useAuth } from "@/src/context/AuthContext";

export default function GirlsReportsPage() {
  const [students, setStudents] = useState([]);
  const { userProfile } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState("students");
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!userProfile) return;
    fetchData();
  }, [userProfile?.uid]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsSnap, expensesSnap] = await Promise.all([
        getDocs(
          query(collection(db, "girls_students"), orderBy("createdAt", "desc")),
        ),
        getDocs(
          query(
            collection(db, "girls_expenses"),
            orderBy("expenseDate", "desc"),
          ),
        ),
      ]);
      setStudents(studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setExpenses(expensesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "active").length;
  const inactiveStudents = totalStudents - activeStudents;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newThisMonth = students.filter((s) => {
    const d = s.createdAt?.toDate
      ? s.createdAt.toDate()
      : new Date(s.createdAt);
    return d >= thisMonth;
  }).length;

  const classDist = CLASSES.map((cls) => {
    const total = students.filter((s) => s.class === cls).length;
    const active = students.filter(
      (s) => s.class === cls && s.status === "active",
    ).length;
    return { class: cls, total, active, inactive: total - active };
  }).filter((c) => c.total > 0);

  const totalExpenses = expenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0,
  );
  const avgPerDay = expenses.length > 0 ? totalExpenses / 30 : 0;
  const largest = expenses.reduce(
    (max, e) => (Number(e.amount) > Number(max.amount || 0) ? e : max),
    { amount: 0 },
  );
  const categoryCounts = {};
  expenses.forEach((e) => {
    categoryCounts[e.category] =
      (categoryCounts[e.category] || 0) + Number(e.amount);
  });
  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const expByCat = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat.label,
    amount: categoryCounts[cat.value] || 0,
    fill: cat.color,
  })).filter((c) => c.amount > 0);

  const monthlyMap = {};
  expenses.forEach((e) => {
    const date = e.expenseDate ? new Date(e.expenseDate) : null;
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + (Number(e.amount) || 0);
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, amount]) => ({ month, amount }));

  if (loading)
    return (
      <div>
        <PageHeader
          title="Reports & Analytics"
          subtitle="View and export detailed reports"
        />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-md animate-pulse"
              style={{ background: "#E8DFD4" }}
            />
          ))}
        </div>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="View and export detailed reports"
      />
      <Tabs defaultValue="students">
        <TabsList className="mb-6">
          <TabsTrigger value="students">Student Reports</TabsTrigger>
          <TabsTrigger value="expenses">Expense Reports</TabsTrigger>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Students", value: totalStudents },
              { label: "Active", value: activeStudents },
              { label: "Inactive", value: inactiveStudents },
              { label: "New This Month", value: newThisMonth },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-md p-5"
                style={{ border: "1px solid #E8DFD4" }}
              >
                <p className="text-xs" style={{ color: "#8C7B6B" }}>
                  {card.label}
                </p>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "Newsreader, serif",
                    fontSize: 30,
                    color: "#1B4332",
                  }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div
              className="bg-white rounded-md p-5"
              style={{ border: "1px solid #E8DFD4" }}
            >
              <h3
                className="text-sm font-medium mb-4"
                style={{ color: "#3D3227" }}
              >
                Students per Class
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={classDist}>
                  <CartesianGrid vertical={false} stroke="#E8DFD4" />
                  <XAxis
                    dataKey="class"
                    tick={{ fontSize: 11, fill: "#8C7B6B" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#8C7B6B" }} />
                  <Tooltip
                    contentStyle={{ borderColor: "#E8DFD4", borderRadius: 6 }}
                  />
                  <Bar dataKey="total" fill="#1B4332" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div
              className="bg-white rounded-md p-5"
              style={{ border: "1px solid #E8DFD4" }}
            >
              <h3
                className="text-sm font-medium mb-4"
                style={{ color: "#3D3227" }}
              >
                Active vs Inactive
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Active", value: activeStudents },
                      { name: "Inactive", value: inactiveStudents },
                    ]}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#1B4332" />
                    <Cell fill="#D39542" />
                  </Pie>
                  <Legend />
                  <Tooltip
                    contentStyle={{ borderColor: "#E8DFD4", borderRadius: 6 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div
            className="bg-white rounded-md overflow-hidden"
            style={{ border: "1px solid #E8DFD4" }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: "1px solid #E8DFD4" }}
            >
              <h3 className="text-sm font-medium" style={{ color: "#3D3227" }}>
                Distribution by Class
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F5EFE8" }}>
                    {["Class", "Total", "Active", "Inactive", "% Active"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-2.5 text-xs uppercase tracking-wide"
                          style={{ color: "#8C7B6B" }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {classDist.map((row, i) => (
                    <tr
                      key={row.class}
                      style={{
                        background: i % 2 === 0 ? "#fff" : "#FAF6F1",
                        borderBottom: "1px solid #E8DFD4",
                      }}
                    >
                      <td
                        className="px-5 py-3 text-sm"
                        style={{ color: "#3D3227" }}
                      >
                        {row.class}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium">
                        {row.total}
                      </td>
                      <td
                        className="px-5 py-3 text-sm"
                        style={{ color: "#1B4332" }}
                      >
                        {row.active}
                      </td>
                      <td
                        className="px-5 py-3 text-sm"
                        style={{ color: "#8C7B6B" }}
                      >
                        {row.inactive}
                      </td>
                      <td className="px-5 py-3 text-sm">
                        {row.total > 0
                          ? Math.round((row.active / row.total) * 100)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Expenses", value: formatCurrency(totalExpenses) },
              {
                label: "Avg Per Day (30d)",
                value: formatCurrency(Math.round(avgPerDay)),
              },
              {
                label: "Largest Expense",
                value: formatCurrency(Number(largest.amount)),
              },
              { label: "Top Category", value: topCategory },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-md p-5"
                style={{ border: "1px solid #E8DFD4" }}
              >
                <p className="text-xs" style={{ color: "#8C7B6B" }}>
                  {card.label}
                </p>
                <p
                  className="mt-2 font-medium"
                  style={{
                    fontFamily: "Newsreader, serif",
                    fontSize: 22,
                    color: "#1B4332",
                  }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="bg-white rounded-md p-5"
              style={{ border: "1px solid #E8DFD4" }}
            >
              <h3
                className="text-sm font-medium mb-4"
                style={{ color: "#3D3227" }}
              >
                Monthly Expense Trend
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData}>
                  <CartesianGrid vertical={false} stroke="#E8DFD4" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#8C7B6B" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#8C7B6B" }} />
                  <Tooltip
                    contentStyle={{ borderColor: "#E8DFD4", borderRadius: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#D39542"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div
              className="bg-white rounded-md p-5"
              style={{ border: "1px solid #E8DFD4" }}
            >
              <h3
                className="text-sm font-medium mb-4"
                style={{ color: "#3D3227" }}
              >
                Expenses by Category
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={expByCat}>
                  <CartesianGrid vertical={false} stroke="#E8DFD4" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#8C7B6B" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#8C7B6B" }} />
                  <Tooltip
                    contentStyle={{ borderColor: "#E8DFD4", borderRadius: 6 }}
                  />
                  <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
                    {expByCat.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="combined">
          <div
            className="bg-white rounded-md p-5"
            style={{ border: "1px solid #E8DFD4" }}
          >
            <h3
              className="text-sm font-medium mb-4"
              style={{ color: "#3D3227" }}
            >
              Monthly Expense Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid vertical={false} stroke="#E8DFD4" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#8C7B6B" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#8C7B6B" }} />
                <Tooltip
                  contentStyle={{ borderColor: "#E8DFD4", borderRadius: 6 }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#D39542"
                  strokeWidth={2}
                  name="Expenses (Rs.)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      <div
        className="mt-6 bg-white rounded-md p-6"
        style={{ border: "1px solid #E8DFD4" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3
              className="text-base font-medium mb-4"
              style={{ color: "#3D3227" }}
            >
              Export Report
            </h3>
            <div className="space-y-3">
              <div>
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: "#3D3227" }}
                >
                  Data Type
                </p>
                <div className="flex gap-2">
                  {["students", "expenses", "combined"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setExportType(t)}
                      className="px-3 py-1.5 text-xs rounded capitalize"
                      style={{
                        background: exportType === t ? "#1B4332" : "#F5EFE8",
                        color: exportType === t ? "#fff" : "#3D3227",
                        border: "1px solid #E8DFD4",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: "#3D3227" }}
                >
                  Format
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportFormat("csv")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded"
                    style={{
                      background:
                        exportFormat === "csv" ? "#1B4332" : "#F5EFE8",
                      color: exportFormat === "csv" ? "#fff" : "#3D3227",
                      border: "1px solid #E8DFD4",
                    }}
                  >
                    <FileSpreadsheet size={13} /> CSV
                  </button>
                  <button
                    onClick={() => setExportFormat("pdf")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded"
                    style={{
                      background:
                        exportFormat === "pdf" ? "#1B4332" : "#F5EFE8",
                      color: exportFormat === "pdf" ? "#fff" : "#3D3227",
                      border: "1px solid #E8DFD4",
                    }}
                  >
                    <FileText size={13} /> PDF
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#3D3227" }}
                  >
                    From
                  </label>
                  <input
                    type="date"
                    className="w-full h-8 border rounded px-2 text-xs"
                    style={{ borderColor: "#E8DFD4" }}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: "#3D3227" }}
                  >
                    To
                  </label>
                  <input
                    type="date"
                    className="w-full h-8 border rounded px-2 text-xs"
                    style={{ borderColor: "#E8DFD4" }}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={() =>
                toast.info("Export requires backend API integration")
              }
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-white rounded-md"
              style={{ background: "#1B4332" }}
            >
              <Download size={16} /> Download Report
            </button>
            <p
              className="text-xs mt-2 text-center"
              style={{ color: "#8C7B6B" }}
            >
              Reports include all filtered data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
