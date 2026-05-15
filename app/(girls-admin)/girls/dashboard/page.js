"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Wallet,
  Calendar,
  MapPin,
  UserPlus,
  FileText,
  Bell,
} from "lucide-react";
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
} from "recharts";
import StatCard from "@/src/components/shared/StatCard";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import {
  formatCurrency,
  formatDate,
  getInitials,
  getRelativeTime,
} from "@/src/lib/utils";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { useAuth } from "@/src/context/AuthContext";
import { db } from "@/src/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

const PORTAL = "girls";

// Chart colors
const CHART_COLORS = {
  primary: "#1B4332",
  accent: "#D39542",
  muted: "#8C7B6B",
};

// Activity icon mapping
const activityIcons = {
  student_added: {
    icon: UserPlus,
    bg: "rgba(27, 67, 50, 0.1)",
    color: "#1B4332",
  },
  expense_added: {
    icon: Wallet,
    bg: "rgba(211, 149, 66, 0.1)",
    color: "#D39542",
  },
  receipt_generated: {
    icon: FileText,
    bg: "rgba(27, 67, 50, 0.1)",
    color: "#1B4332",
  },
  notice_published: {
    icon: Bell,
    bg: "rgba(74, 127, 165, 0.1)",
    color: "#4A7FA5",
  },
};

export default function GirlsDashboardPage() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("6months");

  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const [studentsSnap, expensesSnap, eventsSnap, receiptsSnap] = await Promise.all([
          getDocs(collection(db, "girls_students")),
          getDocs(collection(db, "girls_expenses")),
          getDocs(collection(db, "girls_events")),
          getDocs(query(collection(db, "girls_receipts"), orderBy("createdAt", "desc"), limit(3))),
        ]);

        const allStudents = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allExpenses = expensesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const allEvents = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const recentReceipts = receiptsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const activeStudents = allStudents.filter((s) => s.status === "active");
        const inactiveStudents = allStudents.filter((s) => s.status !== "active");
        const sortedStudents = [...allStudents].sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() ?? new Date(a.joinDate ?? a.admissionDate ?? 0);
          const bDate = b.createdAt?.toDate?.() ?? new Date(b.joinDate ?? b.admissionDate ?? 0);
          return bDate - aDate;
        });

        setRecentStudents(sortedStudents.slice(0, 5).map((s) => ({
          id: s.rollNumber || s.studentId || s.id,
          docId: s.id,
          name: s.name,
          class: s.class,
          status: s.status,
          date: s.joinDate || s.admissionDate || s.createdAt?.toDate?.()?.toISOString()?.split("T")[0] || "",
        })));

        const monthlyExpenses = allExpenses
          .filter((e) => {
            const d = e.expenseDate ? new Date(e.expenseDate) : e.createdAt?.toDate?.() ?? null;
            return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          })
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const expensesByMonth = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          const total = allExpenses
            .filter((e) => {
              const ed = e.expenseDate ? new Date(e.expenseDate) : e.createdAt?.toDate?.() ?? null;
              return ed && ed.getMonth() === m && ed.getFullYear() === y;
            })
            .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          expensesByMonth.push({ month: monthLabels[m], amount: total });
        }

        const todayKey = new Date().toISOString().slice(0, 10);
        const upcoming = allEvents
          .filter((e) => (e.eventDate || e.date || "") >= todayKey && e.status !== "completed")
          .sort((a, b) => String(a.eventDate || a.date || "").localeCompare(String(b.eventDate || b.date || "")));

        setUpcomingEvents(upcoming.slice(0, 3).map((e) => ({
          id: e.id,
          title: e.title,
          date: e.eventDate || e.date,
          venue: e.venue,
        })));

        setStats({
          totalStudents: allStudents.length,
          activeStudents: activeStudents.length,
          inactiveStudents: inactiveStudents.length,
          monthlyExpenses,
          upcomingEvents: upcoming.length,
        });

        setChartData({
          expensesByMonth,
          studentStatus: {
            active: activeStudents.length,
            inactive: inactiveStudents.length,
          },
        });

        const logs = [];
        sortedStudents.slice(0, 2).forEach((s) => {
          logs.push({
            id: `stu-${s.id}`,
            action: "student_added",
            entityName: s.name,
            adminName: "Admin",
            timestamp: s.createdAt?.toDate?.() ?? new Date(s.joinDate ?? Date.now()),
          });
        });
        recentReceipts.forEach((r) => {
          logs.push({
            id: `rcp-${r.id}`,
            action: "receipt_generated",
            entityName: r.receiptNumber,
            adminName: "Admin",
            timestamp: r.createdAt?.toDate?.() ?? new Date(),
          });
        });
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivityLogs(logs.slice(0, 5));
      } catch (err) {
        console.error("Girls dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white border border-[#E8DFD4] rounded-md p-5 h-80 animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-40 mb-4" />
            <div className="h-60 bg-neutral-100 rounded" />
          </div>
          <div className="lg:col-span-2 bg-white border border-[#E8DFD4] rounded-md p-5 h-80 animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-32 mb-4" />
            <div className="h-60 bg-neutral-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = chartData
    ? [
        {
          name: "Active",
          value: chartData.studentStatus.active,
          color: CHART_COLORS.primary,
        },
        {
          name: "Inactive",
          value: chartData.studentStatus.inactive,
          color: CHART_COLORS.accent,
        },
      ]
    : [];

  const totalStudents = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          iconBgColor="rgba(27, 67, 50, 0.08)"
          iconColor="#1B4332"
        />
        <StatCard
          title="Active Students"
          value={stats?.activeStudents || 0}
          icon={UserCheck}
          iconBgColor="rgba(27, 67, 50, 0.08)"
          iconColor="#1B4332"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(stats?.monthlyExpenses || 0)}
          icon={Wallet}
          iconBgColor="rgba(211, 149, 66, 0.1)"
          iconColor="#D39542"
        />
        <StatCard
          title="Upcoming Events"
          value={stats?.upcomingEvents || 0}
          icon={Calendar}
          iconBgColor="rgba(27, 67, 50, 0.08)"
          iconColor="#1B4332"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Expense Bar Chart */}
        <div className="lg:col-span-3 bg-white border border-[#E8DFD4] rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-neutral-900">
              Expense Overview
            </h3>
            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
              className="h-8 px-2 text-sm border border-[#E8DFD4] rounded-md bg-white"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
            </select>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPeriod === "3months" ? (chartData?.expensesByMonth || []).slice(-3) : (chartData?.expensesByMonth || [])}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8DFD4"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#8C7B6B" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8C7B6B" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-[#E8DFD4] rounded-md p-3 shadow-dropdown">
                          <p className="text-sm text-neutral-600">
                            {payload[0].payload.month}
                          </p>
                          <p className="text-md font-medium text-brand">
                            {formatCurrency(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill={CHART_COLORS.primary}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Status Donut */}
        <div className="lg:col-span-2 bg-white border border-[#E8DFD4] rounded-md p-5">
          <h3 className="text-md font-medium text-neutral-900 mb-4">
            Student Status
          </h3>
          <div className="h-60 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => (
                    <span className="text-sm text-neutral-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="font-serif text-3xl text-brand">{totalStudents}</p>
              <p className="text-xs text-neutral-600">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white border border-[#E8DFD4] rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-neutral-900">
              Recent Students
            </h3>
            <Link
              href={`/${PORTAL}/students`}
              className="text-sm text-accent hover:text-accent-500"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8DFD4]">
                  <th className="text-left py-2 text-xs font-medium text-neutral-500">
                    Name
                  </th>
                  <th className="text-left py-2 text-xs font-medium text-neutral-500">
                    Class
                  </th>
                  <th className="text-left py-2 text-xs font-medium text-neutral-500">
                    Status
                  </th>
                  <th className="text-right py-2 text-xs font-medium text-neutral-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr
                    key={student.docId || student.id}
                    className="border-b border-[#E8DFD4] last:border-0 hover:bg-background cursor-pointer"
                    onClick={() => window.location.href = `/${PORTAL}/students/${student.docId || student.id}`}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-brand text-xs font-medium">
                          {getInitials(student.name)}
                        </div>
                        <span className="text-neutral-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-neutral-600">{student.class}</td>
                    <td className="py-3">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="py-3 text-right text-neutral-500">
                      {formatDate(student.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-[#E8DFD4] rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-neutral-900">
              Upcoming Events
            </h3>
            <Link
              href={`/${PORTAL}/events`}
              className="text-sm text-accent hover:text-accent-500"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className={`flex gap-4 ${idx < upcomingEvents.length - 1 ? "pb-4 border-b border-[#E8DFD4]" : ""}`}
                >
                  <div className="w-12 h-12 bg-surface border border-[#E8DFD4] rounded-md flex flex-col items-center justify-center shrink-0">
                    <span className="font-serif text-lg text-brand">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="text-[10px] text-neutral-600 uppercase">
                      {new Date(event.date).toLocaleString("default", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-neutral-600 mt-1">
                      <MapPin size={11} />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto text-[#E8DFD4] mb-2" />
                <p className="text-sm text-neutral-600">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white border border-[#E8DFD4] rounded-md p-5">
        <h3 className="text-md font-medium text-neutral-900 mb-4">
          Recent Activity
        </h3>

        <div className="space-y-4">
          {activityLogs.map((log, idx) => {
            const config =
              activityIcons[log.action] || activityIcons.student_added;
            const Icon = config.icon;
            const actionText =
              {
                student_added: "added new student",
                expense_added: "added expense",
                receipt_generated: "generated receipt",
                notice_published: "published notice",
              }[log.action] || "performed action";

            return (
              <div
                key={log.id}
                className={`flex items-start gap-3 ${idx < activityLogs.length - 1 ? "pb-4 border-b border-[#E8DFD4]" : ""}`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: config.bg }}
                >
                  <Icon size={14} style={{ color: config.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900">
                    {log.adminName} {actionText}{" "}
                    <span className="font-medium">{log.entityName}</span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    {getRelativeTime(log.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
