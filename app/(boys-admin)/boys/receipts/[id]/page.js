"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Trash2, Receipt, User, Calendar, CreditCard } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import StatusBadge from "@/src/components/shared/StatusBadge";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import { formatDate, formatCurrency } from "@/src/lib/utils";
import { PAYMENT_METHODS } from "@/src/lib/constants";
import { useAuth } from '@/src/context/AuthContext'

export default function ViewBoysReceiptPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProfile } = useAuth()

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const receiptDoc = await getDoc(doc(db, "boys_receipts", id));
      if (receiptDoc.exists()) {
        setReceipt({ id: receiptDoc.id, ...receiptDoc.data() });
      } else {
        toast.error("Receipt not found");
        router.push("/boys/receipts");
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
      toast.error("Failed to fetch receipt details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "boys_receipts", id));
      toast.success("Receipt deleted successfully");
      router.push("/boys/receipts");
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast.error("Failed to delete receipt");
    }
  };

  if (loading) {
    return <LoadingSkeleton type="detail" />;
  }

  if (!receipt) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Receipt #${receipt.receiptNumber}`}
        description={`Created on ${formatDate(receipt.createdAt)}`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/boys/receipts"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/boys/receipts/${id}/print`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
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
        {/* Main Receipt Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{receipt.receiptType === "donation" ? "Donation Receipt" : receipt.receiptType === "miscellaneous" ? "Miscellaneous Receipt" : "Fee Receipt"}</h2>
                    <p className="text-blue-100">#{receipt.receiptNumber}</p>
                  </div>
                </div>
                <StatusBadge status={receipt.status} size="lg" />
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Student / Payer Info */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-xl">
                    {(receipt.studentName || receipt.payerName || receipt.name || receipt.donorName || "—").charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{receipt.studentName || receipt.payerName || receipt.name || receipt.donorName || "—"}</p>
                  {receipt.studentRollNumber && <p className="text-gray-600">Roll Number: {receipt.studentRollNumber}</p>}
                  {receipt.studentClass && <p className="text-gray-600">Class: {receipt.studentClass}</p>}
                  {receipt.studentPhone && (
                    <p className="text-gray-600">Phone: {receipt.studentPhone}</p>
                  )}
                  {receipt.receiptType && receipt.receiptType !== "fee" && (
                    <p className="text-xs mt-1 text-blue-600 font-semibold uppercase">{receipt.receiptType}</p>
                  )}
                </div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{receipt.receiptType === "donation" || receipt.receiptType === "miscellaneous" ? "Period" : "Fee Month"}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{receipt.feeMonth || "—"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Payment Date</span>
                  </div>
                  <p className="font-semibold text-gray-900">{formatDate(receipt.paymentDate)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">Payment Method</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {PAYMENT_METHODS[receipt.paymentMethod] || receipt.paymentMethod}
                  </p>
                </div>
                {receipt.transactionId && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-gray-500 text-sm mb-1">Transaction ID</div>
                    <p className="font-semibold text-gray-900 font-mono">{receipt.transactionId}</p>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-blue-600 text-sm mb-1">Amount Paid</p>
                <p className="text-4xl font-bold text-blue-700">{formatCurrency(receipt.amount)}</p>
              </div>

              {/* Notes */}
              {receipt.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{receipt.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/boys/receipts/${id}/print`}
                className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Printer className="h-5 w-5 text-gray-400" />
                <span>Print Receipt</span>
              </Link>
              {receipt.studentId && (
                <Link
                  href={`/boys/students/${receipt.studentId}`}
                  className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5 text-gray-400" />
                  <span>View Student Profile</span>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Receipt Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt Number</span>
                <span className="font-medium text-gray-900">#{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-900">{formatDate(receipt.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium text-gray-900">{formatDate(receipt.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Receipt"
        description={`Are you sure you want to delete receipt #${receipt.receiptNumber}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
