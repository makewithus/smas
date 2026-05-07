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

const T = { green: "#1B4332", text: "#3D3227", muted: "#8C7B6B", border: "#E8DFD4", hover: "#F5EFE8", accent: "#D39542" };
const MONTHS_LIST = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function BoysReceiptsPage() {
  const { userProfile } = useAuth();
  const searchParams = useSearchParams();
  const studentIdFilter = searchParams.get("studentId");

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ status: "", paymentMethod: "", month: "" });
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

  const filtered = useMemo(() => receipts.filter((r) => {
    if (searchQuery && !r.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.paymentMethod && r.paymentMethod !== filters.paymentMethod) return false;
    if (filters.month && r.feeMonth !== filters.month) return false;
    if (studentIdFilter && r.studentId !== studentIdFilter) return false;
    return true;
  }), [receipts, searchQuery, filters, studentIdFilter]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE), [filtered, currentPage]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const stats = useMemo(() => {
    const total = receipts.reduce((s, r) => s + (r.amount || 0), 0);
    const paid = receipts.filter((r) => r.status === "paid").reduce((s, r) => s + (r.amount || 0), 0);
    return { count: receipts.length, total, paid, pending: total - paid };
  }, [receipts]);

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
    exportToCSV(filtered.map((r) => ({ "Receipt #": r.receiptNumber, Student: r.studentName, "Roll No": r.rollNumber, Month: r.feeMonth, Amount: r.amount, Method: r.paymentMethod, Status: r.status })), "boys-receipts");
    toast.success("Exported");
  };

  const clearFilters = () => { setFilters({ status: "", paymentMethod: "", month: "" }); setSearchQuery(""); };

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
          <div className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4" style={{ borderTop: `1px solid ${T.border}` }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: T.muted }}>Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded border focus:outline-none" style={{ borderColor: T.border, color: T.text }}>
                <option value="">All Status</option>
                <option value="paid">Paid</option><option value="pending">Pending</option>
                <option value="partial">Partial</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: T.muted }}>Payment Method</label>
              <select value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded border focus:outline-none" style={{ borderColor: T.border, color: T.text }}>
                <option value="">All Methods</option>
                {PAYMENT_METHODS ? Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)
                  : ["Cash","Online Transfer","Cheque","Bank Deposit"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: T.muted }}>Fee Month</label>
              <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded border focus:outline-none" style={{ borderColor: T.border, color: T.text }}>
                <option value="">All Months</option>
                {(MONTHS || MONTHS_LIST).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {activeFilters > 0 && (
              <div className="md:col-span-3">
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
                    <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === "" ? "text-right" : "text-left"}`} style={{ color: T.muted }}>{h}</th>
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
                      <p className="text-sm font-medium" style={{ color: T.text }}>{r.studentName}</p>
                      <p className="text-xs mt-0.5" style={{ color: T.muted }}>{r.rollNumber || r.studentRollNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: T.text }}>{r.feeMonth} {r.feeYear}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: T.text }}>{formatCurrency(r.amount)}</p>
                      <p className="text-xs mt-0.5" style={{ color: T.muted }}>{r.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/boys/receipts/${r.id}`} style={{ color: T.muted }} className="p-1.5 rounded hover:bg-[#F5EFE8]"><Eye size={15} /></Link>
                        <Link href={`/boys/receipts/${r.id}/print`} style={{ color: T.muted }} className="p-1.5 rounded hover:bg-[#F5EFE8]"><Printer size={15} /></Link>
                        <button onClick={() => setDeleteDialog({ open: true, receipt: r })} style={{ color: T.muted }} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
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
