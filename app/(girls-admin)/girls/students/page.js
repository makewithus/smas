"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  Clock,
  X,
} from "lucide-react";
import { db } from "@/src/lib/firebase";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  where,
  writeBatch,
} from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import Pagination from "@/src/components/shared/Pagination";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import EmptyState from "@/src/components/shared/EmptyState";
import { formatDate, formatCurrency, exportToCSV, debounce } from "@/src/lib/utils";
import { PAYMENT_STATUS, CLASS_OPTIONS, FEE_TYPES } from "@/src/lib/constants";
import { useAuth } from '@/src/context/AuthContext'

export default function GirlsStudentsPage() {
  const router = useRouter();
  const { userProfile } = useAuth()

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    class: "",
    paymentStatus: "",
    feeType: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, student: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!userProfile) return
   fetchStudents();
  }, [userProfile?.uid]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsRef = collection(db, "girls_students");
      const q = query(studentsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        searchQuery === "" ||
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.phone?.includes(searchQuery);

      const matchesClass = filters.class === "" || student.class === filters.class;
      const matchesPayment =
        filters.paymentStatus === "" || student.paymentStatus === filters.paymentStatus;
      const matchesFeeType = filters.feeType === "" || student.feeType === filters.feeType;

      return matchesSearch && matchesClass && matchesPayment && matchesFeeType;
    });
  }, [students, searchQuery, filters]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const stats = useMemo(() => {
    return {
      total: students.length,
      paid: students.filter((s) => s.paymentStatus === "paid").length,
      pending: students.filter((s) => s.paymentStatus === "pending").length,
      overdue: students.filter((s) => s.paymentStatus === "overdue").length,
    };
  }, [students]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(paginatedStudents.map((s) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteStudent = async () => {
    if (!deleteDialog.student) return;
    try {
      await deleteDoc(doc(db, "girls_students", deleteDialog.student.id));
      setStudents((prev) => prev.filter((s) => s.id !== deleteDialog.student.id));
      toast.success("Student deleted successfully");
      setDeleteDialog({ open: false, student: null });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const batch = writeBatch(db);
      selectedStudents.forEach((id) => {
        batch.delete(doc(db, "girls_students", id));
      });
      await batch.commit();
      setStudents((prev) => prev.filter((s) => !selectedStudents.includes(s.id)));
      setSelectedStudents([]);
      toast.success(`${selectedStudents.length} students deleted successfully`);
      setBulkDeleteDialog(false);
    } catch (error) {
      console.error("Error bulk deleting:", error);
      toast.error("Failed to delete students");
    }
  };

  const handleExport = () => {
    const data = filteredStudents.map((s) => ({
      "Roll Number": s.rollNumber,
      Name: s.name,
      "Father Name": s.fatherName,
      Class: s.class,
      Phone: s.phone,
      "Fee Type": s.feeType,
      "Monthly Fee": s.monthlyFee,
      "Payment Status": s.paymentStatus,
      "Join Date": formatDate(s.joinDate),
    }));
    exportToCSV(data, "girls-students-export");
    toast.success("Export completed");
  };

  const clearFilters = () => {
    setFilters({ class: "", paymentStatus: "", feeType: "" });
    setSearchQuery("");
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage all girl students in the hostel"
        actions={
          <Link
            href="/girls/students/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Link>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, roll number, father name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={filters.class}
                  onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">All Classes</option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentStatus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">All Status</option>
                  {Object.entries(PAYMENT_STATUS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Type
                </label>
                <select
                  value={filters.feeType}
                  onChange={(e) => setFilters({ ...filters, feeType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">All Types</option>
                  {Object.entries(FEE_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-pink-600 hover:text-pink-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-pink-800">
            <span className="font-semibold">{selectedStudents.length}</span> student(s)
            selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setBulkDeleteDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedStudents([])}
              className="px-4 py-2 border border-pink-300 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={
            searchQuery || activeFiltersCount > 0
              ? "Try adjusting your search or filters"
              : "Get started by adding your first student"
          }
          action={
            !searchQuery && activeFiltersCount === 0 ? (
              <Link
                href="/girls/students/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Student
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.length === paginatedStudents.length &&
                        paginatedStudents.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <span className="text-pink-600 font-semibold">
                            {student.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            Roll: {student.rollNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{student.class}</td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900">{student.phone}</p>
                      <p className="text-sm text-gray-500">{student.fatherName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(student.monthlyFee)}
                      </p>
                      <p className="text-sm text-gray-500">{FEE_TYPES[student.feeType]}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={student.paymentStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/girls/students/${student.id}`}
                          className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/girls/students/${student.id}/edit`}
                          className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteDialog({ open: true, student })}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, student: null })}
        onConfirm={handleDeleteStudent}
        title="Delete Student"
        description={`Are you sure you want to delete ${deleteDialog.student?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialog}
        onClose={() => setBulkDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Students"
        description={`Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
      />
    </div>
  );
}
