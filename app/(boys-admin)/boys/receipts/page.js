"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Filter, Download, Trash2, Eye, Printer, Receipt, IndianRupee, X } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, query, getDocs, deleteDoc, doc, orderBy, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import Pagination from "@/src/components/shared/Pagination";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import EmptyState from "@/src/components/shared/EmptyState";
import { formatDate, formatCurrency, exportToCSV } from "@/src/lib/utils";
import { PAYMENT_METHODS, MONTHS } from "@/src/lib/constants";
import { useAuth } from "@/src/context/AuthContext";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

const T = { green: "#1B4332", text: "#3D3227", muted: "#8C7B6B", border: "#E8DFD4", hover: "#F5EFE8", accent: "#D39542" };
const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function BoysReceiptsPage() {
  const { userProfile } = useAuth();
  const searchParams = useSearchParams();
  const studentIdFilter = searchParams.get("studentId");

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", paymentMethod: "", month: "", dateFrom: "", dateTo: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, receipt: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const PER_PAGE = 10;

  useEffect(() => {
    if (!userProfile) return;
    fetchReceipts();
  }, [userProfile?.uid]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "boys_receipts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setReceipts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch receipts");
    } finally { setLoading(false); }
  };

  const toDateKey = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    const date = value?.toDate?.() ?? (value?.seconds ? new Date(value.seconds * 1000) : new Date(value));
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  };

  const filtered = useMemo(() => receipts.filter((r) => {
    if (searchQuery && !r.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.paymentMethod && r.paymentMethod !== filters.paymentMethod) return false;
    if (filters.month && r.feeMonth !== filters.month) return false;
    const dateKey = toDateKey(r.paymentDate || r.createdAt);
    if (filters.dateFrom && (!dateKey || dateKey < filters.dateFrom)) return false;
    if (filters.dateTo && (!dateKey || dateKey > filters.dateTo)) return false;
    if (studentIdFilter && r.studentId !== studentIdFilter) return false;
    return true;
  }), [receipts, searchQuery, filters, studentIdFilter]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE), [filtered, currentPage]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const stats = useMemo(() => {
    const total = filtered.reduce((s, r) => s + (r.amount || 0), 0);
    const paid = filtered.filter((r) => r.status === "paid").reduce((s, r) => s + (r.amount || 0), 0);
    return { count: filtered.length, total, paid, pending: total - paid };
  }, [filtered]);

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const handleSelectAll = (e) => setSelected(e.target.checked ? paginated.map((r) => r.id) : []);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "boys_receipts", deleteDialog.receipt.id));
      setReceipts((p) => p.filter((r) => r.id !== deleteDialog.receipt.id));
      toast.success("Receipt deleted");
      setDeleteDialog({ open: false, receipt: null });
    } catch { toast.error("Failed to delete"); }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);
      selected.forEach((id) => batch.delete(doc(db, "boys_receipts", id)));
      await batch.commit();
      setReceipts((p) => p.filter((r) => !selected.includes(r.id)));
      setSelected([]); setBulkDeleteDialog(false);
      toast.success(`${selected.length} receipts deleted`);
    } catch { toast.error("Failed to delete"); }
  };

  const handleExport = () => {
    exportToCSV(filtered.map((r) => ({
      "Receipt #": r.receiptNumber,
      "Type": r.receiptType || "fee",
      Student: r.studentName || r.payerName || "",
      "Roll No": r.rollNumber || r.studentRollNumber || "",
      Month: r.feeMonth || "",
      Amount: r.amount,
      Method: r.paymentMethod,
      Status: r.status,
    })), "boys-receipts");
    toast.success("Exported");
  };

  const clearFilters = () => { setFilters({ status: "", paymentMethod: "", month: "", dateFrom: "", dateTo: "" }); setSearchQuery(""); };

  if (loading) return <LoadingSkeleton type="table" />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Receipts"
        description="Manage fee receipts for boy students"
        actions={
          <Link href="/boys/receipts/add" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md" style={{ background: T.green }}>
            <Plus size={15} /> Add Receipt
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Receipts", value: stats.count, icon: <Receipt size={16} /> },
          { label: "Total Amount", value: formatCurrency(stats.total), icon: <IndianRupee size={16} /> },
          { label: "Paid Amount", value: formatCurrency(stats.paid), icon: <IndianRupee size={16} /> },
          { label: "Pending Amount", value: formatCurrency(stats.pending), icon: <IndianRupee size={16} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-md p-4" style={{ border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-9 h-9 rounded flex items-center justify-center" style={{ background: T.hover, color: T.green }}>{icon}</div>
              <div className="min-w-0">
                <p className="text-xs truncate" style={{ color: T.muted }}>{label}</p>
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
            <input type="text" placeholder="Search by receipt number, student name…" value={searchQuery}
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
          <div className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-5 gap-3" style={{ borderTop: `1px solid ${T.border}` }}>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-neutral-600">Status</label>
              <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : v })}>
                <SelectTrigger className="h-9 text-sm border-[#E8DFD4] text-neutral-800">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-neutral-600">Payment Method</label>
              <Select value={filters.paymentMethod || "all"} onValueChange={(v) => setFilters({ ...filters, paymentMethod: v === "all" ? "" : v })}>
                <SelectTrigger className="h-9 text-sm border-[#E8DFD4] text-neutral-800">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Methods</SelectItem>
                  {(Array.isArray(PAYMENT_METHODS) ? PAYMENT_METHODS : ["Cash","Online Transfer","Cheque","Bank Transfer","Bank Deposit"]).map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-neutral-600">Fee Month</label>
              <Select value={filters.month || "all"} onValueChange={(v) => setFilters({ ...filters, month: v === "all" ? "" : v })}>
                <SelectTrigger className="h-9 text-sm border-[#E8DFD4] text-neutral-800">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">All Months</SelectItem>
                  {(MONTHS || MONTHS_LIST).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-neutral-600">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded border border-[#E8DFD4] text-neutral-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-neutral-600">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded border border-[#E8DFD4] text-neutral-800 focus:outline-none"
              />
            </div>
            {activeFilters > 0 && (
              <div className="md:col-span-5">
                <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-neutral-500 hover:text-neutral-800"><X size={12} /> Clear filters</button>
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
        <EmptyState icon={Receipt} title="No receipts found"
          description={searchQuery || activeFilters > 0 ? "Try adjusting your search or filters" : "Add your first receipt to get started"}
          action={!searchQuery && activeFilters === 0 ? (
            <Link href="/boys/receipts/add" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md" style={{ background: T.green }}>
              <Plus size={14} /> Add Receipt
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
                  {["Receipt", "Student", "Fee Period", "Amount", "Status", ""].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === "" ? "text-right" : "text-left"}`} style={{ color: "#4B5563" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < paginated.length - 1 ? `1px solid ${T.border}` : "none" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = T.hover}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} style={{ accentColor: T.green }} /></td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: T.text }}>{r.receiptNumber}</p>
                      <p className="text-xs mt-0.5" style={{ color: T.muted }}>{formatDate(r.createdAt?.toDate?.() ?? r.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: T.text }}>
                        {r.studentName || r.payerName || "—"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                        {r.rollNumber || r.studentRollNumber
                          ? `${r.rollNumber || r.studentRollNumber}`
                          : r.receiptType && r.receiptType !== "fee"
                          ? r.receiptType.charAt(0).toUpperCase() + r.receiptType.slice(1)
                          : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: T.text }}>{r.feeMonth} {r.feeYear}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: T.text }}>{formatCurrency(r.amount)}</p>
                      <p className="text-xs mt-0.5" style={{ color: T.muted }}>{r.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/boys/receipts/${r.id}`} className="inline-flex items-center justify-center w-7 h-7 rounded border border-[#E8DFD4] text-neutral-500 hover:text-brand hover:border-brand hover:bg-[#F0FAF4] transition-colors" title="View"><Eye size={13} /></Link>
                        <Link href={`/boys/receipts/${r.id}/print`} className="inline-flex items-center justify-center w-7 h-7 rounded border border-[#E8DFD4] text-neutral-500 hover:text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition-colors" title="Print"><Printer size={13} /></Link>
                        <button onClick={() => setDeleteDialog({ open: true, receipt: r })} className="inline-flex items-center justify-center w-7 h-7 rounded border border-[#E8DFD4] text-neutral-500 hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={13} /></button>
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

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, receipt: null })} onConfirm={handleDelete}
        title="Delete Receipt" description={`Delete receipt ${deleteDialog.receipt?.receiptNumber}? This cannot be undone.`} confirmText="Delete" variant="danger" />
      <ConfirmDialog open={bulkDeleteDialog} onClose={() => setBulkDeleteDialog(false)} onConfirm={handleBulkDelete}
        title="Delete Selected" description={`Delete ${selected.length} receipts? This cannot be undone.`} confirmText="Delete All" variant="danger" />
    </div>
  );
}
