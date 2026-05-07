"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Wallet } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/src/lib/constants";
import { useAuth } from '@/src/context/AuthContext'

export default function EditBoysExpensePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProfile } = useAuth()

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "", amount: "", vendor: "",
    expenseDate: "", paymentMethod: "cash", transactionId: "", notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { fetchExpense(); }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const expenseDoc = await getDoc(doc(db, "boys_expenses", id));
      if (expenseDoc.exists()) {
        const data = expenseDoc.data();
        setFormData({
          title: data.title || "", description: data.description || "", category: data.category || "",
          amount: data.amount?.toString() || "", vendor: data.vendor || "", expenseDate: data.expenseDate || "",
          paymentMethod: data.paymentMethod || "cash", transactionId: data.transactionId || "", notes: data.notes || "",
        });
      } else {
        toast.error("Expense not found");
        router.push("/boys/expenses");
      }
    } catch (error) {
      toast.error("Failed to fetch expense");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.expenseDate) newErrors.expenseDate = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Please fix the errors");
    setSaving(true);
    try {
      await updateDoc(doc(db, "boys_expenses", id), {
        ...formData, amount: parseFloat(formData.amount) || 0, updatedAt: serverTimestamp(),
      });
      toast.success("Expense updated successfully");
      router.push("/boys/expenses");
    } catch (error) {
      toast.error("Failed to update expense");
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = (error) => `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500 bg-red-50" : "border-gray-300"}`;

  if (loading) return <LoadingSkeleton type="form" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Expense" description="Update expense details"
        actions={<Link href="/boys/expenses" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"><ArrowLeft className="h-4 w-4" />Back</Link>} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Wallet className="h-5 w-5 text-blue-600" /></div><h2 className="text-lg font-semibold">Expense Details</h2></div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div><label className="block text-sm font-medium mb-1">Title *</label><input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClasses(errors.title)} />{errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}</div>
            <div><label className="block text-sm font-medium mb-1">Category *</label><select name="category" value={formData.category} onChange={handleChange} className={inputClasses(errors.category)}><option value="">Select category</option>{Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>{errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}</div>
            <div><label className="block text-sm font-medium mb-1">Amount *</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses(errors.amount)} />{errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}</div>
            <div><label className="block text-sm font-medium mb-1">Vendor/Payee</label><input type="text" name="vendor" value={formData.vendor} onChange={handleChange} className={inputClasses()} /></div>
            <div><label className="block text-sm font-medium mb-1">Expense Date *</label><input type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} className={inputClasses(errors.expenseDate)} />{errors.expenseDate && <p className="mt-1 text-sm text-red-500">{errors.expenseDate}</p>}</div>
            <div><label className="block text-sm font-medium mb-1">Payment Method</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={inputClasses()}>{Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium mb-1">Transaction ID</label><input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} className={inputClasses()} /></div>
            <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClasses()} /></div>
            <div className="md:col-span-2 lg:col-span-3"><label className="block text-sm font-medium mb-1">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className={inputClasses()} /></div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/boys/expenses" className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
