"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Phone,
  Home,
  CreditCard,
  Calendar,
  Mail,
  MapPin,
  Building,
  FileText,
  Receipt,
  Plus,
} from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import { formatDate, formatCurrency } from "@/src/lib/utils";
import { FEE_TYPES } from "@/src/lib/constants";
import { useAuth } from '@/src/context/AuthContext'

export default function ViewGirlStudentPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProfile } = useAuth()

  const [student, setStudent] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const studentDoc = await getDoc(doc(db, "girls_students", id));
      if (studentDoc.exists()) {
        setStudent({ id: studentDoc.id, ...studentDoc.data() });
        
        // Fetch receipts for this student
        const receiptsRef = collection(db, "girls_receipts");
        const q = query(receiptsRef, where("studentId", "==", id), orderBy("createdAt", "desc"));
        const receiptsSnapshot = await getDocs(q);
        const receiptsData = receiptsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReceipts(receiptsData);
      } else {
        toast.error("Student not found");
        router.push("/girls/students");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("Failed to fetch student details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "girls_students", id));
      toast.success("Student deleted successfully");
      router.push("/girls/students");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  if (loading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!student) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.name}
        description={`Roll Number: ${student.rollNumber}`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/girls/students"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/girls/students/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setDeleteDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <User className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Full Name" value={student.name} />
                <InfoItem label="Father's Name" value={student.fatherName} />
                <InfoItem label="Mother's Name" value={student.motherName || "-"} />
                <InfoItem label="Aadhar Number" value={student.aadharNumber || "-"} />
                <InfoItem label="Blood Group" value={student.bloodGroup || "-"} />
                <InfoItem label="Email" value={student.email || "-"} />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Phone className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem label="Phone Number" value={student.phone} />
                <InfoItem label="Alternate Phone" value={student.alternatePhone || "-"} />
                <InfoItem label="Emergency Contact Name" value={student.emergencyContactName || "-"} />
                <InfoItem label="Emergency Contact" value={student.emergencyContact || "-"} />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Home className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InfoItem label="Address" value={student.address || "-"} />
                </div>
                <InfoItem label="City" value={student.city || "-"} />
                <InfoItem label="State" value={student.state || "-"} />
                <InfoItem label="Pincode" value={student.pincode || "-"} />
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Receipt className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              </div>
              <Link
                href={`/girls/receipts/add?studentId=${id}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Receipt
              </Link>
            </div>
            <div className="p-6">
              {receipts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No payment records found</p>
              ) : (
                <div className="space-y-4">
                  {receipts.slice(0, 5).map((receipt) => (
                    <div
                      key={receipt.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Receipt #{receipt.receiptNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(receipt.paymentDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(receipt.amount)}
                        </p>
                        <StatusBadge status={receipt.status} />
                      </div>
                    </div>
                  ))}
                  {receipts.length > 5 && (
                    <Link
                      href={`/girls/receipts?studentId=${id}`}
                      className="block text-center text-pink-600 hover:text-pink-700 text-sm"
                    >
                      View all {receipts.length} receipts
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-pink-600">
                  {student.name?.charAt(0) || "?"}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{student.name}</h3>
              <p className="text-gray-500">Roll: {student.rollNumber}</p>
              <div className="mt-3">
                <StatusBadge status={student.paymentStatus} size="lg" />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Building className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Academic Info</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <InfoItem label="Class" value={student.class} />
              <InfoItem label="College/School" value={student.college || "-"} />
              <InfoItem label="Room Number" value={student.roomNumber ? `Room ${student.roomNumber}` : "-"} />
              <InfoItem label="Bed Number" value={student.bedNumber || "-"} />
              <InfoItem label="Join Date" value={formatDate(student.joinDate)} />
            </div>
          </div>

          {/* Fee Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-pink-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Fee Information</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <InfoItem label="Fee Type" value={FEE_TYPES[student.feeType] || student.feeType} />
              <InfoItem label="Monthly Fee" value={formatCurrency(student.monthlyFee)} />
              <InfoItem label="Security Deposit" value={formatCurrency(student.securityDeposit || 0)} />
              <InfoItem label="Admission Fee" value={formatCurrency(student.admissionFee || 0)} />
            </div>
          </div>

          {/* Notes */}
          {student.notes && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <FileText className="h-5 w-5 text-pink-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 whitespace-pre-wrap">{student.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Student"
        description={`Are you sure you want to delete ${student.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
