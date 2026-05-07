"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Download,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import SearchBar from "@/src/components/shared/SearchBar";
import Pagination from "@/src/components/shared/Pagination";
import StatusBadge from "@/src/components/shared/StatusBadge";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import EmptyState from "@/src/components/shared/EmptyState";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import { formatDate, getInitials, debounce } from "@/src/lib/utils";
import { CLASSES, DEFAULT_PAGE_SIZE } from "@/src/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/src/context/AuthContext";

const PORTAL = "boys";

export default function StudentsPage() {
  const router = useRouter();

  // State
  const [students, setStudents] = useState([]);
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    const mockStudents = [
      {
        id: "STU-B-2024-0001",
        fullName: "Ahmed Khan",
        class: "Class 10",
        phone: "9876543210",
        parentName: "Mohammad Khan",
        status: "active",
        admissionDate: "2024-01-15",
      },
      {
        id: "STU-B-2024-0002",
        fullName: "Bilal Ahmad",
        class: "Class 9",
        phone: "9876543211",
        parentName: "Ismail Ahmad",
        status: "active",
        admissionDate: "2024-01-16",
      },
      {
        id: "STU-B-2024-0003",
        fullName: "Hamza Ali",
        class: "Class 8",
        phone: "9876543212",
        parentName: "Ali Hassan",
        status: "active",
        admissionDate: "2024-01-17",
      },
      {
        id: "STU-B-2024-0004",
        fullName: "Usman Malik",
        class: "Class 7",
        phone: "9876543213",
        parentName: "Tariq Malik",
        status: "inactive",
        admissionDate: "2024-01-18",
      },
      {
        id: "STU-B-2024-0005",
        fullName: "Zain Abbas",
        class: "Class 6",
        phone: "9876543214",
        parentName: "Abbas Ali",
        status: "active",
        admissionDate: "2024-01-19",
      },
      {
        id: "STU-B-2024-0006",
        fullName: "Faisal Raza",
        class: "Class 10",
        phone: "9876543215",
        parentName: "Raza Khan",
        status: "active",
        admissionDate: "2024-01-20",
      },
      {
        id: "STU-B-2024-0007",
        fullName: "Adnan Shah",
        class: "Class 9",
        phone: "9876543216",
        parentName: "Shah Hussain",
        status: "active",
        admissionDate: "2024-01-21",
      },
      {
        id: "STU-B-2024-0008",
        fullName: "Imran Qureshi",
        class: "Class 8",
        phone: "9876543217",
        parentName: "Qureshi Ahmad",
        status: "inactive",
        admissionDate: "2024-01-22",
      },
    ];

    // Apply filters
    let filtered = mockStudents;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchLower) ||
          s.id.toLowerCase().includes(searchLower),
      );
    }

    if (classFilter) {
      filtered = filtered.filter((s) => s.class === classFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Calculate stats
    const activeCount = mockStudents.filter(
      (s) => s.status === "active",
    ).length;
    const inactiveCount = mockStudents.filter(
      (s) => s.status === "inactive",
    ).length;
    setStats({
      total: mockStudents.length,
      active: activeCount,
      inactive: inactiveCount,
    });

    setStudents(filtered);
    setTotal(filtered.length);
    setLoading(false);
  }, [search, classFilter, statusFilter, page, pageSize]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 300),
    [],
  );

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(students.map((s) => s.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle select row
  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!studentToDelete) return;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setStudents(students.filter((s) => s.id !== studentToDelete.id));
    toast.success("Student deleted successfully");
    setStudentToDelete(null);
  };

  // Clear filters
  const clearFilters = () => {
    setSearch("");
    setClassFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const hasFilters = search || classFilter || statusFilter;

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage enrolled students"
        actions={
          <Link href={`/${PORTAL}/students/add`} className="btn-primary">
            <UserPlus size={16} />
            Add Student
          </Link>
        }
      />

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchBar
          value={search}
          onChange={debouncedSearch}
          placeholder="Search by name or ID..."
          width="280px"
        />

        <Select
          value={classFilter}
          onValueChange={(value) => {
            setClassFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40 h-9.5 border-[#E8DFD4]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-35 h-9.5 border-[#E8DFD4]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <X size={14} />
            Clear Filters
          </button>
        )}

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 h-9.5 border border-[#E8DFD4] rounded-md text-sm hover:bg-surface">
                <Download size={16} />
                Export
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem>Export PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-surface border border-[#E8DFD4] text-neutral-900">
          Total: {stats.total}
        </span>
        <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-surface border border-brand text-brand">
          Active: {stats.active}
        </span>
        <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-surface border border-neutral-400 text-neutral-600">
          Inactive: {stats.inactive}
        </span>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-3 mb-4 bg-surface border border-[#E8DFD4] rounded-md">
          <span className="text-sm text-neutral-900">
            {selectedRows.length} student{selectedRows.length > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm border border-accent text-accent rounded-md hover:bg-accent/5">
              Deactivate Selected
            </button>
            <button className="px-3 py-1.5 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-50">
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-[#E8DFD4] rounded-md overflow-hidden">
        {loading ? (
          <LoadingSkeleton rows={10} variant="table" />
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <Checkbox
                      checked={
                        selectedRows.length === students.length &&
                        students.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Admitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className={`border-t border-[#E8DFD4] hover:bg-background ${
                      selectedRows.includes(student.id) ? "bg-brand/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedRows.includes(student.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(student.id, checked)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-neutral-600">
                      {student.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-brand text-xs font-medium">
                          {getInitials(student.fullName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {student.class}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {student.phone}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {student.parentName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {formatDate(student.admissionDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            router.push(`/${PORTAL}/students/${student.id}`)
                          }
                          className="p-1.5 text-neutral-500 hover:text-brand"
                          title="View"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/${PORTAL}/students/${student.id}/edit`,
                            )
                          }
                          className="p-1.5 text-neutral-500 hover:text-accent"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
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
              title="No students found"
              description={
                hasFilters
                  ? "Try adjusting your search or filters"
                  : "Add your first student to get started"
              }
              action={
                !hasFilters
                  ? { label: "Add Student", href: `/${PORTAL}/students/add` }
                  : undefined
              }
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && students.length > 0 && (
        <Pagination
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Student?"
        description={`Are you sure you want to delete ${studentToDelete?.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
