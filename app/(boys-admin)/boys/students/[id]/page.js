"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit, Trash2, Phone, User, Calendar,
  BookOpen, MapPin, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react";
import { db } from "@/src/lib/firebase";
import {
  doc, getDoc, updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import StatusBadge from "@/src/components/shared/StatusBadge";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import { deleteFromCloudinary } from "@/src/lib/cloudinary";

const COLLECTION = "boys_students";
const PORTAL = "boys";

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, COLLECTION, id));
        if (!snap.exists()) {
          toast.error("Student not found");
          router.push(`/${PORTAL}/students`);
          return;
        }
        setStudent({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load student");
        router.push(`/${PORTAL}/students`);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  const toggleStatus = async () => {
    if (!student) return;
    setToggling(true);
    try {
      const newStatus = student.status === "active" ? "inactive" : "active";
      await updateDoc(doc(db, COLLECTION, id), { status: newStatus, updatedAt: serverTimestamp() });
      setStudent((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Student marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (student?.photoUrl) {
        await deleteFromCloudinary(student.photoUrl);
      }
      await deleteDoc(doc(db, COLLECTION, id));
      toast.success("Student deleted");
      router.push(`/${PORTAL}/students`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 size={28} className="animate-spin text-brand" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${PORTAL}/students`} className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} /> Students
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-medium text-neutral-900">{student.name}</h1>
            <p className="text-sm text-neutral-600 mt-0.5 font-mono">{student.studentId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleStatus} disabled={toggling}
              className="inline-flex items-center gap-1.5 text-sm btn-ghost">
              {toggling ? <Loader2 size={15} className="animate-spin" />
                : student.status === "active" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {student.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <Link href={`/${PORTAL}/students/${id}/edit`} className="btn-secondary inline-flex items-center gap-1.5 text-sm">
              <Edit size={15} /> Edit
            </Link>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Student"
        description="Delete this student? This cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        variant="danger"
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Info Card */}
        <div className="lg:col-span-2 bg-white border border-[#E8DFD4] rounded-md p-6">
          <h2 className="section-header">Student Details</h2>
          <div className="grid sm:grid-cols-2 gap-y-5 gap-x-8">
            <InfoRow icon={<User size={15} />} label="Full Name" value={student.name} />
            <InfoRow icon={<BookOpen size={15} />} label="Class" value={student.class} />
            <InfoRow icon={<Phone size={15} />} label="Phone" value={student.phone} />
            <InfoRow icon={<User size={15} />} label="Parent / Guardian" value={student.parentName} />
            <InfoRow icon={<Calendar size={15} />} label="Admission Date"
              value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
            <InfoRow icon={null} label="Status"
              value={<StatusBadge status={student.status} />} />
            {student.address && (
              <div className="sm:col-span-2">
                <InfoRow icon={<MapPin size={15} />} label="Address" value={student.address} />
              </div>
            )}
          </div>
        </div>

        {/* Photo + Quick Stats */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#E8DFD4] rounded-md p-5 text-center">
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-[#E8DFD4] mb-3" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mx-auto mb-3 border-2 border-[#E8DFD4]">
                <User size={32} className="text-neutral-400" />
              </div>
            )}
            <p className="font-medium text-neutral-900">{student.name}</p>
            <p className="text-sm text-neutral-600">{student.class}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-1 flex items-center gap-1">
        {icon}{label}
      </p>
      <p className="text-sm text-neutral-900">{value || "—"}</p>
    </div>
  );
}
