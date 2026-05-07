"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus, Download, ChevronDown, Eye, Pencil,
  Trash2, X, Users, RefreshCw,
} from "lucide-react";
import { db } from "@/src/lib/firebase";
import {
  collection, query, getDocs, deleteDoc, doc,
  orderBy, writeBatch,
} from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import SearchBar from "@/src/components/shared/SearchBar";
import Pagination from "@/src/components/shared/Pagination";
import StatusBadge from "@/src/components/shared/StatusBadge";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import EmptyState from "@/src/components/shared/EmptyState";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import { formatDate, getInitials, exportToCSV } from "@/src/lib/utils";
import { CLASSES, DEFAULT_PAGE_SIZE } from "@/src/lib/constants";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/src/context/AuthContext";

const PORTAL = "boys";
const COLLECTION = "boys_students";

export default function StudentsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const snap = await getDocs(
        query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
      );
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = useMemo(() => {
    let list = students;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.studentId?.toLowerCase().includes(q) ||
          s.phone?.includes(q)
      );
    }
    if (classFilter) list = list.filter((s) => s.class === classFilter);
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    return list;
  }, [students, search, classFilter, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    inactive: students.filter((s) => s.status === "inactive").length,
  }), [students]);

  const handleSelectAll = (checked) =>
    setSelectedRows(checked ? paginated.map((s) => s.id) : []);
  const handleSelectRow = (id, checked) =>
    setSelectedRows((prev) => checked ? [...prev, id] : prev.filter((r) => r !== id));

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteDoc(doc(db, COLLECTION, studentToDelete.id));
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      toast.success(`${studentToDelete.name} deleted`);
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setStudentToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);
      selectedRows.forEach((id) => batch.delete(doc(db, COLLECTION, id)));
      await batch.commit();
      setStudents((prev) => prev.filter((s) => !selectedRows.includes(s.id)));
      toast.success(`${selectedRows.length} student(s) deleted`);
      setSelectedRows([]);
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  const handleExport = () => {
    exportToCSV(
      filtered.map((s) => ({
        "Student ID": s.studentId || s.id,
        Name: s.name,
        Class: s.class,
        Phone: s.phone,
        Parent: s.parentName,
        Status: s.status,
        "Admitted On": formatDate(s.admissionDate),
      })),
      "boys-students"
    );
    toast.success("Exported");
  };

  const clearFilters = () => { setSearch(""); setClassFilter(""); setStatusFilter(""); setPage(1); };
  const hasFilters = search || classFilter || statusFilter;

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${stats.total} enrolled`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStudents}
              className="p-2 text-neutral-500 hover:text-neutral-900 border border-[#E8DFD4] rounded-md"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <Link href={`/${PORTAL}/students/add`} className="btn-primary">
              <UserPlus size={16} /> Add Student
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search by name, ID or phone…"
          width="280px"
        />

        <Select
          value={classFilter || "all"}
          onValueChange={(v) => { setClassFilter(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-40 h-9.5 border-[#E8DFD4]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-35 h-9.5 border-[#E8DFD4]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900">
            <X size={14} /> Clear filters
          </button>
        )}

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 h-9.5 border border-[#E8DFD4] rounded-md text-sm hover:bg-surface">
                <Download size={16} /> Export <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-surface border border-[#E8DFD4] text-neutral-900">Total: {stats.total}</span>
        <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-surface border border-brand text-brand">Active: {stats.active}</span>
        <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-surface border border-neutral-400 text-neutral-600">Inactive: {stats.inactive}</span>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-3 mb-4 bg-surface border border-[#E8DFD4] rounded-md">
          <span className="text-sm text-neutral-900">{selectedRows.length} student{selectedRows.length > 1 ? "s" : ""} selected</span>
          <div className="flex gap-2">
            <button onClick={() => setBulkDeleteOpen(true)} className="px-3 py-1.5 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-50">Delete Selected</button>
            <button onClick={() => setSelectedRows([])} className="px-3 py-1.5 text-sm border border-[#E8DFD4] rounded-md hover:bg-surface">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E8DFD4] rounded-md overflow-hidden">
        {loading ? (
          <LoadingSkeleton rows={10} variant="table" />
        ) : paginated.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={selectedRows.length === paginated.length && paginated.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  {["Student ID", "Student", "Phone", "Parent", "Status", "Admitted", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((student) => (
                  <tr
                    key={student.id}
                    className={`border-t border-[#E8DFD4] hover:bg-background transition-colors ${selectedRows.includes(student.id) ? "bg-brand/5" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox checked={selectedRows.includes(student.id)} onCheckedChange={(c) => handleSelectRow(student.id, c)} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{student.studentId || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-brand text-xs font-medium shrink-0">
                          {getInitials(student.name || "")}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{student.name}</p>
                          <p className="text-xs text-neutral-500">{student.class}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{student.phone || "—"}</td>
                    <td className="px-4 py-3 text-neutral-700">{student.parentName || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={student.status} /></td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">{formatDate(student.admissionDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/${PORTAL}/students/${student.id}`)} className="p-1.5 text-neutral-500 hover:text-brand rounded" title="View"><Eye size={15} /></button>
                        <button onClick={() => router.push(`/${PORTAL}/students/${student.id}/edit`)} className="p-1.5 text-neutral-500 hover:text-accent rounded" title="Edit"><Pencil size={15} /></button>
                        <button onClick={() => { setStudentToDelete(student); setDeleteDialogOpen(true); }} className="p-1.5 text-neutral-500 hover:text-red-500 rounded" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="min-h-75 flex items-center justify-center">
            <EmptyState
              icon={Users}
              title={hasFilters ? "No students match filters" : "No students yet"}
              description={hasFilters ? "Try adjusting your search or filters" : "Add your first student to get started"}
              action={!hasFilters ? { label: "Add Student", href: `/${PORTAL}/students/add` } : undefined}
            />
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <Pagination
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Student?"
        description={`Delete ${studentToDelete?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedRows.length} students?`}
        description="This action cannot be undone."
        confirmLabel="Delete All"
        variant="danger"
      />
    </div>
  );
}
