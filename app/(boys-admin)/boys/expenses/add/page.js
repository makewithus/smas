"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/src/lib/constants";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

const COLLECTION = "boys_expenses";
const PORTAL = "boys";

export default function AddExpensePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    amount: "",
    paymentMethod: "",
    vendor: "",
    expenseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.category) e.category = "Category is required";
    if (!formData.amount) e.amount = "Amount is required";
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0)
      e.amount = "Enter a valid positive amount";
    if (!formData.paymentMethod) e.paymentMethod = "Payment method is required";
    if (!formData.expenseDate) e.expenseDate = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, COLLECTION), {
        ...formData,
        amount: Number(formData.amount),
        portal: PORTAL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Expense added successfully");
      router.push(`/${PORTAL}/expenses`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href={`/${PORTAL}/expenses`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-2">
          <ArrowLeft size={16} /> Expenses
        </Link>
        <h1 className="text-xl font-medium text-neutral-900">Add New Expense</h1>
        <p className="text-sm text-neutral-600 mt-0.5">Record a new hostel expense</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-2xl bg-white border border-[#E8DFD4] rounded-md p-6">
          <div className="section-header">Expense Details</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label label-required">Title</label>
              <input name="title" value={formData.title} onChange={handleChange}
                className={`input ${errors.title ? "input-error" : ""}`} placeholder="e.g. Electricity bill for May" />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="label label-required">Category</label>
              <Select value={formData.category} onValueChange={(v) => handleSelect("category", v)}>
                <SelectTrigger className={`w-full h-9.5 ${errors.category ? "border-red-500" : "border-[#E8DFD4]"}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="label label-required">Amount (Rs.)</label>
              <input name="amount" type="number" min="0" step="0.01" value={formData.amount}
                onChange={handleChange}
                className={`input ${errors.amount ? "input-error" : ""}`} placeholder="0.00" />
              {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="label label-required">Payment Method</label>
              <Select value={formData.paymentMethod} onValueChange={(v) => handleSelect("paymentMethod", v)}>
                <SelectTrigger className={`w-full h-9.5 ${errors.paymentMethod ? "border-red-500" : "border-[#E8DFD4]"}`}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethod && <p className="text-sm text-red-500 mt-1">{errors.paymentMethod}</p>}
            </div>

            <div>
              <label className="label label-required">Expense Date</label>
              <input type="date" name="expenseDate" value={formData.expenseDate}
                onChange={handleChange}
                className={`input ${errors.expenseDate ? "input-error" : ""}`} />
              {errors.expenseDate && <p className="text-sm text-red-500 mt-1">{errors.expenseDate}</p>}
            </div>

            <div>
              <label className="label">Vendor / Supplier</label>
              <input name="vendor" value={formData.vendor} onChange={handleChange}
                className="input" placeholder="Vendor name (optional)" />
            </div>

            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={3} className="input h-auto py-2.5 resize-none"
                placeholder="Additional details about this expense" />
            </div>

            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange}
                rows={2} className="input h-auto py-2.5 resize-none" placeholder="Internal notes (optional)" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E8DFD4]">
            <Link href={`/${PORTAL}/expenses`} className="btn-ghost">Cancel</Link>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Expense</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
