"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Download, Trash2, Edit, Wallet, TrendingDown, IndianRupee, X } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, query, getDocs, deleteDoc, doc, orderBy, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import Pagination from "@/src/components/shared/Pagination";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import EmptyState from "@/src/components/shared/EmptyState";
import { formatDate, formatCurrency, exportToCSV } from "@/src/lib/utils";
import { EXPENSE_CATEGORIES } from "@/src/lib/constants";
import { useAuth } from "@/src/context/AuthContext";

const T = { green: "#1B4332", text: "#3D3227", muted: "#8C7B6B", border: "#E8DFD4", hover: "#F5EFE8", accent: "#D39542" };

export default function BoysExpensesPage() {
  const { userProfile } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", dateFrom: "", dateTo: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expense: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const PER_PAGE = 10;

  useEffect(() => {
    if (!userProfile) return;
    fetchExpenses();
  }, [userProfile?.uid]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "boys_expenses"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch expenses");
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() => expenses.filter((e) => {
    if (searchQuery && !e.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.category?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.category && e.category !== filters.category) return false;
    return true;
  }), [expenses, searchQuery, filters]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE), [filtered, currentPage]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const now = new Date();
    const monthly = expenses.filter((e) => {
      const d = e.createdAt?.toDate?.() ?? (e.createdAt ? new Date(e.createdAt) : null);
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + (e.amount || 0), 0);
    return { count: expenses.length, total, monthly };
  }, [expenses]);

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const handleSelectAll = (e) => setSelected(e.target.checked ? paginated.map((x) => x.id) : []);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "boys_expenses", deleteDialog.expense.id));
      setExpenses((p) => p.filter((e) => e.id !== deleteDialog.expense.id));
      toast.success("Expense deleted");
      setDeleteDialog({ open: false, expense: null });
    } catch { toast.error("Failed to delete"); }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);
      selected.forEach((id) => batch.delete(doc(db, "boys_expenses", id)));
      await batch.commit();
      setExpenses((p) => p.filter((e) => !selected.includes(e.id)));
      setSelected([]); setBulkDeleteDialog(false);
      toast.success(`${selected.length} expenses deleted`);
    } catch { toast.error("Failed to delete"); }
  };

  const handleExport = () => {
    exportToCSV(filtered.map((e) => ({
      Category: EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category,
      Description: e.description, Vendor: e.vendor,
      Amount: e.amount, Date: formatDate(e.createdAt?.toDate?.() ?? e.createdAt),
    })), "boys-expenses");
    toast.success("Exported");
  };

  const clearFilters = () => { setFilters({ category: "", dateFrom: "", dateTo: "" }); setSearchQuery(""); };

  if (loading) return <LoadingSkeleton type="table" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Expenses"
        description="Track and manage hostel expenses"
        actions={
          <Link href="/boys/expenses/add" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md" style={{ background: T.green }}>
            <Plus size={15} /> Add Expense
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Total Expenses", value: stats.count, icon: <Wallet size={16} /> },
          { label: "Total Amount", value: formatCurrency(stats.total), icon: <TrendingDown size={16} /> },
          { label: "This Month", value: formatCurrency(stats.monthly), icon: <IndianRupee size={16} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-md p-4" style={{ border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-9 h-9 rounded flex items-center justify-center" style={{ background: T.hover, color: T.green }}>{icon}</div>
              <div>
                <p className="text-xs" style={{ color: T.muted }}>{label}</p>
                <p className="text-base font-semibold" style={{ color: T.text }}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-md p-4" style={{ border: `1px solid ${T.border}` }}>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
            <input type="text" placeholder="Search expenses by description, vendor, category…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-9 text-sm rounded border focus:outline-none"
              style={{ borderColor: T.border, color: T.text }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-3 h-9 text-sm rounded border"
              style={{ borderColor: showFilters || activeFilters > 0 ? T.green : T.border, background: showFilters || activeFilters > 0 ? "#E8F5EE" : "white", color: showFilters || activeFilters > 0 ? T.green : T.text }}>
              <Filter size={14} /> Filters
              {activeFilters > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: T.green }}>{activeFilters}</span>}
            </button>
            <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 h-9 text-sm rounded border" style={{ borderColor: T.border, color: T.text }}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ borderTop: `1px solid ${T.border}` }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: T.muted }}>Category</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded border focus:outline-none" style={{ borderColor: T.border, color: T.text }}>
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            {activeFilters > 0 && (
              <div className="md:col-span-2 flex items-end">
                <button onClick={clearFilters} className="text-xs flex items-center gap-1" style={{ color: T.muted }}><X size={12} /> Clear filters</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="rounded-md p-3 flex items-center justify-between" style={{ background: "#E8F5EE", border: `1px solid ${T.green}` }}>
          <p className="text-sm" style={{ color: T.green }}><span className="font-semibold">{selected.length}</span> selected</p>
          <div className="flex gap-2">
            <button onClick={() => setBulkDeleteDialog(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded" style={{ background: "#dc2626" }}>
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={() => setSelected([])} className="px-3 py-1.5 text-sm rounded border" style={{ borderColor: T.green, color: T.green }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table or Empty */}
      {filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="No expenses found"
          description={searchQuery || activeFilters > 0 ? "Try adjusting your search" : "Track your first expense"}
          action={!searchQuery && activeFilters === 0 ? (
            <Link href="/boys/expenses/add" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md" style={{ background: T.green }}>
              <Plus size={14} /> Add Expense
            </Link>
          ) : null}
        />
      ) : (
        <div className="bg-white rounded-md overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "#FAF6F1", borderBottom: `1px solid ${T.border}` }}>
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={handleSelectAll} style={{ accentColor: T.green }} />
                  </th>
                  {["Description", "Category", "Amount", "Date", ""].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === "" ? "text-right" : "text-left"}`} style={{ color: T.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: i < paginated.length - 1 ? `1px solid ${T.border}` : "none" }}
                    onMouseEnter={(ev) => ev.currentTarget.style.background = T.hover}
                    onMouseLeave={(ev) => ev.currentTarget.style.background = "white"}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggleSelect(e.id)} style={{ accentColor: T.green }} /></td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: T.text }}>{e.description || e.title || "—"}</p>
                      {e.vendor && <p className="text-xs mt-0.5" style={{ color: T.muted }}>{e.vendor}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: T.hover, color: T.text }}>
                        {EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: "#b45309" }}>{formatCurrency(e.amount)}</p>
                      {e.paymentMethod && <p className="text-xs mt-0.5" style={{ color: T.muted }}>{e.paymentMethod}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: T.muted }}>
                      {formatDate(e.expenseDate?.toDate?.() ?? e.expenseDate ?? e.createdAt?.toDate?.() ?? e.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/boys/expenses/${e.id}/edit`} style={{ color: T.muted }} className="p-1.5 rounded hover:bg-[#F5EFE8]"><Edit size={15} /></Link>
                        <button onClick={() => setDeleteDialog({ open: true, expense: e })} style={{ color: T.muted }} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-3" style={{ borderTop: `1px solid ${T.border}` }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, expense: null })} onConfirm={handleDelete}
        title="Delete Expense" description={`Delete this expense? This cannot be undone.`} confirmText="Delete" variant="danger" />
      <ConfirmDialog open={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)} onConfirm={handleBulkDelete}
        title="Delete Selected" description={`Delete ${selected.length} expenses? This cannot be undone.`} confirmText="Delete All" variant="danger" />
    </div>
  );
}
