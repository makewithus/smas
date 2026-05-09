"use client";

import { useState, useEffect } from "react";
import {
  BarChart2,
  Users,
  Wallet,
  FileSpreadsheet,
  FileText,
  Download,
} from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
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

const PORTAL = "boys";

export default function BoysReportsPage() {
  const [students, setStudents] = useState([]);
  const { userProfile } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("month");
  const [exportType, setExportType] = useState("students");
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsSnap, expensesSnap] = await Promise.all([
        getDocs(collection(db, "boys_students")),
        getDocs(collection(db, "boys_expenses")),
      ]);
      const studs = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const exps = expensesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // sort client-side to avoid index requirements
      studs.sort((a, b) => {
        const ad = a.createdAt?.toDate?.() ?? new Date(a.admissionDate ?? 0);
        const bd = b.createdAt?.toDate?.() ?? new Date(b.admissionDate ?? 0);
        return bd - ad;
      });
      exps.sort((a, b) => (b.expenseDate ?? "").localeCompare(a.expenseDate ?? ""));
      setStudents(studs);
      setExpenses(exps);
    } catch (err) {
      console.error("Reports fetch error:", err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // Student stats
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

  // Class distribution
  const classDist = CLASSES.map((cls) => {
    const total = students.filter((s) => s.class === cls).length;
    const active = students.filter(
      (s) => s.class === cls && s.status === "active",
    ).length;
    return { class: cls, total, active, inactive: total - active };
  }).filter((c) => c.total > 0);

  // Expense stats
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

  // Category chart data
  const expByCat = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat.label,
    amount: categoryCounts[cat.value] || 0,
    fill: cat.color,
  })).filter((c) => c.amount > 0);

  // Monthly trend
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

  const handleExport = () => {
    if (!students.length && !expenses.length) {
      toast.error("No data loaded yet. Please wait for the page to finish loading.");
      return;
    }
    const label = exportType.charAt(0).toUpperCase() + exportType.slice(1);
    const timestamp = new Date().toISOString().split("T")[0];

    const toDateStr = (raw) => {
      if (!raw) return null;
      if (raw?.toDate) return raw.toDate().toISOString().split("T")[0];
      if (raw?.seconds) return new Date(raw.seconds * 1000).toISOString().split("T")[0];
      return String(raw).split("T")[0];
    };

    const inRange = (dateStr) => {
      if (!dateFrom && !dateTo) return true;
      if (!dateStr) return true;
      if (dateFrom && dateStr < dateFrom) return false;
      if (dateTo && dateStr > dateTo) return false;
      return true;
    };

    const filteredStudents = students;
    const filteredExpenses = expenses.filter((e) => inRange(e.expenseDate));

    if (exportFormat === "csv") {
      let csvContent = "";
      let filename = "";

      if (exportType === "students" || exportType === "combined") {
        const headers = ["Student ID", "Name", "Class", "Phone", "Parent Name", "Address", "Admission Date", "Status"];
        const rows = filteredStudents.map((s) => [
          s.studentId || "",
          s.name || "",
          s.class || "",
          s.phone || "",
          s.parentName || "",
          (s.address || "").replace(/,/g, " "),
          s.admissionDate || "",
          s.status || "",
        ]);
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        if (exportType === "students") { csvContent = csv; filename = `students_report_${timestamp}.csv`; }
        else { csvContent += "STUDENTS\n" + csv + "\n\n"; }
      }

      if (exportType === "expenses" || exportType === "combined") {
        const headers = ["Title", "Category", "Amount (Rs.)", "Payment Method", "Vendor", "Date", "Description"];
        const rows = filteredExpenses.map((e) => [
          e.title || "",
          e.category || "",
          e.amount || 0,
          e.paymentMethod || "",
          (e.vendor || "").replace(/,/g, " "),
          e.expenseDate || "",
          (e.description || "").replace(/,/g, " "),
        ]);
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        if (exportType === "expenses") { csvContent = csv; filename = `expenses_report_${timestamp}.csv`; }
        else { csvContent += "EXPENSES\n" + csv; filename = `combined_report_${timestamp}.csv`; }
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success(`Downloaded: ${filename} (${exportType === "students" ? filteredStudents.length : filteredExpenses.length} records)`);

    } else {
      // PDF via print window
      const totalExpAmt = filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const dateRange = dateFrom || dateTo ? `${dateFrom || "—"} to ${dateTo || "—"}` : "All dates";

      const buildTable = (headers, rows) =>
        `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>` +
        `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

      const studentTable = buildTable(
        ["Student ID", "Name", "Class", "Phone", "Parent Name", "Status", "Admission Date"],
        filteredStudents.map((s) => [s.studentId||"", s.name||"", s.class||"", s.phone||"", s.parentName||"", s.status||"", s.admissionDate||""])
      );
      const expenseTable = buildTable(
        ["Title", "Category", "Amount (Rs.)", "Payment Method", "Vendor", "Date"],
        filteredExpenses.map((e) => [e.title||"", e.category||"", `Rs. ${Number(e.amount||0).toLocaleString("en-IN")}`, e.paymentMethod||"", e.vendor||"", e.expenseDate||""])
      );

      const sections = exportType === "students" ? studentTable
        : exportType === "expenses" ? expenseTable
        : studentTable + `<h2 style="margin-top:24px">Expense Report</h2>` + expenseTable;

      const html = `<!DOCTYPE html><html><head><title>Hudaibiyya Arabic College — ${label} Report</title>
        <style>body{font-family:Arial,sans-serif;font-size:12px;color:#222;padding:24px;}h1{font-size:20px;margin:0;}h2{font-size:15px;margin:16px 0 8px;color:#1B4332;}.header{text-align:center;border-bottom:2px solid #1B4332;padding-bottom:12px;margin-bottom:16px;}.meta{display:flex;justify-content:space-between;font-size:11px;color:#555;margin-bottom:16px;}table{width:100%;border-collapse:collapse;margin-bottom:16px;}th{background:#1B4332;color:#fff;text-align:left;padding:6px 8px;font-size:11px;}td{padding:5px 8px;border-bottom:1px solid #E8DFD4;font-size:11px;}tr:nth-child(even) td{background:#FAF6F1;}.summary{margin-top:12px;font-size:11px;color:#555;}@media print{body{padding:0;}}</style></head><body>
        <div class="header"><h1>HUDAIBIYYA ARABIC COLLEGE</h1><div style="font-size:11px;color:#555;margin-top:4px">Hudaibiyya Islamic Charitable Trust, Vottancheri &nbsp;|&nbsp; +91 94621 38738</div></div>
        <div class="meta"><span><strong>${label} Report</strong></span><span>Date Range: ${dateRange}</span><span>Generated: ${new Date().toLocaleDateString("en-IN")}</span></div>
        ${exportType !== "expenses" ? `<h2>Student Report</h2><div class="summary">Total: ${filteredStudents.length} | Active: ${filteredStudents.filter(s=>s.status==="active").length} | Inactive: ${filteredStudents.filter(s=>s.status!=="active").length}</div>` : ""}
        ${sections}
        ${exportType !== "students" ? `<div class="summary"><strong>Total Expenses: Rs. ${totalExpAmt.toLocaleString("en-IN")}</strong></div>` : ""}
        </body></html>`;

      const win = window.open("", "_blank");
      if (!win) { toast.error("Pop-up blocked. Please allow pop-ups and try again."); return; }
      win.document.write(html);
      win.document.close();
      win.onload = () => { win.print(); };
      toast.success(`${label} report opened for printing/saving as PDF`);
    }
  };

  if (loading) {
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
  }

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

        {/* ── STUDENT REPORTS ── */}
        <TabsContent value="students">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Students", value: totalStudents, icon: Users },
              { label: "Active", value: activeStudents, icon: Users },
              { label: "Inactive", value: inactiveStudents, icon: Users },
              { label: "New This Month", value: newThisMonth, icon: Users },
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

          {/* Charts */}
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
                    contentStyle={{
                      borderColor: "#E8DFD4",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
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
                    contentStyle={{
                      borderColor: "#E8DFD4",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution table */}
          <div
            className="bg-white rounded-md overflow-hidden"
            style={{ border: "1px solid #E8DFD4" }}
          >
            <div
              className="px-5 py-3"
              style={{ borderBottom: "1px solid #E8DFD4" }}
            >
              <h3 className="text-sm font-medium" style={{ color: "#3D3227" }}>
                Student Distribution by Class
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
                      <td
                        className="px-5 py-3 text-sm font-medium"
                        style={{ color: "#3D3227" }}
                      >
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
                      <td
                        className="px-5 py-3 text-sm"
                        style={{ color: "#3D3227" }}
                      >
                        {row.total > 0
                          ? Math.round((row.active / row.total) * 100)
                          : 0}
                        %
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      background: "#F5EFE8",
                      borderTop: "1px solid #E8DFD4",
                    }}
                  >
                    <td
                      className="px-5 py-3 text-sm font-semibold"
                      style={{ color: "#3D3227" }}
                    >
                      Total
                    </td>
                    <td
                      className="px-5 py-3 text-sm font-semibold"
                      style={{ color: "#3D3227" }}
                    >
                      {totalStudents}
                    </td>
                    <td
                      className="px-5 py-3 text-sm font-semibold"
                      style={{ color: "#1B4332" }}
                    >
                      {activeStudents}
                    </td>
                    <td
                      className="px-5 py-3 text-sm font-semibold"
                      style={{ color: "#8C7B6B" }}
                    >
                      {inactiveStudents}
                    </td>
                    <td
                      className="px-5 py-3 text-sm font-semibold"
                      style={{ color: "#3D3227" }}
                    >
                      {totalStudents > 0
                        ? Math.round((activeStudents / totalStudents) * 100)
                        : 0}
                      %
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── EXPENSE REPORTS ── */}
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
              { label: "Top Category", value: topCategory || "—" },
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    contentStyle={{
                      borderColor: "#E8DFD4",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#D39542"
                    strokeWidth={2}
                    dot={{ fill: "#D39542" }}
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
                    contentStyle={{
                      borderColor: "#E8DFD4",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
                    {expByCat.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* ── COMBINED VIEW ── */}
        <TabsContent value="combined">
          <div
            className="bg-white rounded-md p-5"
            style={{ border: "1px solid #E8DFD4" }}
          >
            <h3
              className="text-sm font-medium mb-4"
              style={{ color: "#3D3227" }}
            >
              Students vs Expenses (Monthly)
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
                  contentStyle={{
                    borderColor: "#E8DFD4",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
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

      {/* Export Panel */}
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
              onClick={handleExport}
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
