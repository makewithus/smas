"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Receipt, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/src/components/shared/StatusBadge";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import { formatDate, getInitials } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";

const PORTAL = "boys";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchStudent = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data
      setStudent({
        id: params.id,
        fullName: "Ahmed Khan",
        class: "Class 10",
        phone: "9876543210",
        parentName: "Mohammad Khan",
        address: "123 Main Street, City - 123456",
        admissionDate: "2024-01-15",
        status: "active",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-03-10T14:45:00Z",
        createdBy: "Admin",
      });
      setLoading(false);
    };

    fetchStudent();
  }, [params.id]);

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Student deleted successfully");
    router.push(`/${PORTAL}/students`);
  };

  const handleStatusToggle = async () => {
    const newStatus = student.status === "active" ? "inactive" : "active";
    setStudent((prev) => ({ ...prev, status: newStatus }));
    toast.success(`Student marked as ${newStatus}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-24 mb-4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E8DFD4] rounded-md p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 bg-neutral-200 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-neutral-200 rounded w-48 mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-24" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-neutral-200 rounded w-full" />
              ))}
            </div>
          </div>
          <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-neutral-200 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <h2 className="font-serif text-2xl text-neutral-900 mb-2">
          Student Not Found
        </h2>
        <p className="text-neutral-600 mb-6">
          The student you are looking for does not exist.
        </p>
        <Link href={`/${PORTAL}/students`} className="btn-primary">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            href={`/${PORTAL}/students`}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
          >
            <ArrowLeft size={16} />
            Students
          </Link>
          <h1 className="text-xl font-medium text-neutral-900">
            {student.fullName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${PORTAL}/students/${student.id}/edit`}
            className="btn-outline"
          >
            <Pencil size={15} />
            Edit
          </Link>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center text-brand font-serif text-3xl">
                {getInitials(student.fullName)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-xl text-brand">
                      {student.fullName}
                    </h2>
                    <p className="text-sm text-neutral-600">{student.class}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-surface border border-[#E8DFD4] rounded text-xs font-mono text-neutral-600">
                      {student.id}
                    </span>
                  </div>
                  <StatusBadge status={student.status} />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8DFD4] pt-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                    Phone
                  </p>
                  <p className="text-sm text-neutral-900">{student.phone}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                    Parent / Guardian
                  </p>
                  <p className="text-sm text-neutral-900">
                    {student.parentName}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                    Address
                  </p>
                  <p className="text-sm text-neutral-900">
                    {student.address || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
                    Admission Date
                  </p>
                  <p className="text-sm text-neutral-900">
                    {formatDate(student.admissionDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Future Modules Placeholder */}
          <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
            <h3 className="text-md font-medium text-neutral-900 mb-4">
              Additional Information
            </h3>
            <div className="flex border-b border-[#E8DFD4]">
              {["Attendance", "Marks", "Documents", "Fees"].map((tab, idx) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm ${idx === 0 ? "border-b-2 border-brand text-brand" : "text-neutral-500"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="py-12 text-center text-neutral-500">
              <p className="text-sm">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">
              Quick Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-[#E8DFD4]">
                <span className="text-sm text-neutral-500">Created At</span>
                <span className="text-sm text-neutral-900">
                  {formatDate(student.createdAt)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E8DFD4]">
                <span className="text-sm text-neutral-500">Updated At</span>
                <span className="text-sm text-neutral-900">
                  {formatDate(student.updatedAt)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-neutral-500">Created By</span>
                <span className="text-sm text-neutral-900">
                  {student.createdBy}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href={`/${PORTAL}/students/${student.id}/edit`}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-[#E8DFD4] rounded-md hover:bg-surface"
              >
                <Pencil size={14} className="text-brand" />
                Edit Student
              </Link>
              <Link
                href={`/${PORTAL}/receipts/add?studentId=${student.id}`}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-[#E8DFD4] rounded-md hover:bg-surface"
              >
                <Receipt size={14} className="text-accent" />
                Generate Receipt
              </Link>
              <button
                onClick={handleStatusToggle}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-[#E8DFD4] rounded-md hover:bg-surface text-left"
              >
                <RefreshCw size={14} className="text-neutral-600" />
                Mark as {student.status === "active" ? "Inactive" : "Active"}
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-red-200 text-red-500 rounded-md hover:bg-red-50"
              >
                <Trash2 size={14} />
                Delete Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Student?"
        description={`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
