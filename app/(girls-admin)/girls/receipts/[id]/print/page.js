"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import { formatDate, formatCurrency, numberToWords } from "@/src/lib/utils";
import { PAYMENT_METHODS, INSTITUTION } from "@/src/lib/constants";
import { useAuth } from '@/src/context/AuthContext'

export default function PrintGirlsReceiptPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProfile } = useAuth()

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReceipt(); }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const receiptDoc = await getDoc(doc(db, "girls_receipts", id));
      if (receiptDoc.exists()) setReceipt({ id: receiptDoc.id, ...receiptDoc.data() });
      else { toast.error("Receipt not found"); router.push("/girls/receipts"); }
    } catch (error) {
      toast.error("Failed to fetch receipt");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return <LoadingSkeleton type="detail" />;
  if (!receipt) return null;

  return (
    <div>
      <div className="print:hidden mb-6 flex items-center justify-between">
        <Link href={`/girls/receipts/${id}`} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><ArrowLeft className="h-4 w-4" />Back</Link>
        <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"><Printer className="h-4 w-4" />Print Receipt</button>
      </div>

      <div id="print-content" className="print-area bg-white rounded-xl border border-gray-200 p-8 print:border-none print:rounded-none print:p-6 max-w-3xl mx-auto">
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">{INSTITUTION.name}</h1>
          <p className="text-gray-600 mt-1">{INSTITUTION.fullName}</p>
          <p className="text-gray-500 text-sm mt-1">{INSTITUTION.address}</p>
          <p className="text-gray-500 text-sm">Phone: {INSTITUTION.phone}</p>
        </div>

        <div className="text-center mb-6"><h2 className="text-xl font-bold text-gray-900 bg-gray-100 py-2 px-4 inline-block rounded">FEE RECEIPT</h2></div>

        <div className="flex justify-between mb-6 text-sm">
          <div><p><span className="font-semibold">Receipt No:</span> {receipt.receiptNumber}</p><p><span className="font-semibold">Date:</span> {formatDate(receipt.paymentDate)}</p></div>
          <div className="text-right"><p><span className="font-semibold">Fee Month:</span> {receipt.feeMonth}</p><p><span className="font-semibold">Status:</span> <span className="uppercase">{receipt.status}</span></p></div>
        </div>

        <div className="border border-gray-300 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Student Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p><span className="text-gray-500">Name:</span> <span className="font-medium">{receipt.studentName}</span></p><p><span className="text-gray-500">Roll Number:</span> <span className="font-medium">{receipt.studentRollNumber}</span></p></div>
            <div><p><span className="text-gray-500">Class:</span> <span className="font-medium">{receipt.studentClass}</span></p><p><span className="text-gray-500">Phone:</span> <span className="font-medium">{receipt.studentPhone || "N/A"}</span></p></div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-100"><tr><th className="px-4 py-2 text-left font-semibold">Description</th><th className="px-4 py-2 text-right font-semibold">Amount</th></tr></thead>
            <tbody><tr className="border-t"><td className="px-4 py-3">Hostel Fee for {receipt.feeMonth}</td><td className="px-4 py-3 text-right">{formatCurrency(receipt.amount)}</td></tr></tbody>
            <tfoot className="bg-gray-50"><tr className="border-t-2 border-gray-300"><td className="px-4 py-3 font-bold">Total Amount</td><td className="px-4 py-3 text-right font-bold text-lg">{formatCurrency(receipt.amount)}</td></tr></tfoot>
          </table>
        </div>

        <div className="mb-6 text-sm"><p><span className="font-semibold">Amount in Words:</span> <span className="italic">{numberToWords(receipt.amount)} Rupees Only</span></p></div>
        <div className="mb-6 text-sm"><p><span className="font-semibold">Payment Method:</span> {PAYMENT_METHODS[receipt.paymentMethod]}{receipt.transactionId && <span className="ml-2 text-gray-500">(Ref: {receipt.transactionId})</span>}</p></div>
        {receipt.notes && <div className="mb-6 text-sm"><p className="font-semibold">Notes:</p><p className="text-gray-600 mt-1">{receipt.notes}</p></div>}

        <div className="flex justify-between mt-12 pt-6 border-t border-gray-200">
          <div className="text-center"><div className="w-40 border-b border-gray-400 mb-2"></div><p className="text-sm text-gray-600">Student Signature</p></div>
          <div className="text-center"><div className="w-40 border-b border-gray-400 mb-2"></div><p className="text-sm text-gray-600">Authorized Signature</p></div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>This is a computer-generated receipt. No signature is required for online payments.</p>
          <p className="mt-1">Thank you for your payment!</p>
        </div>
      </div>

      <style jsx global>{`@media print { nav, aside, header, [data-sidebar], .print\\:hidden { display: none !important; } body { background: white !important; } .print-area { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: white; } }`}</style>
    </div>
  );
}
