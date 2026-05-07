"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2 } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/src/lib/constants";
import { use } from "react";
import { useAuth } from "@/src/context/AuthContext";

export default function EditGirlsExpensePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    amount: "",
    vendor: "",
    expenseDate: "",
    paymentMethod: "cash",
    transactionId: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const docSnap = await getDoc(doc(db, "girls_expenses", id));
        if (docSnap.exists()) {
          setFormData({
            ...docSnap.data(),
            amount: String(docSnap.data().amount || ""),
          });
        } else {
          toast.error("Expense not found");
          router.push("/girls/expenses");
        }
      } catch {
        toast.error("Failed to load expense");
      } finally {
        setPageLoading(false);
      }
    };
    if (id) fetchExpense();
  }, [id]);

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
    setLoading(true);
    try {
      await updateDoc(doc(db, "girls_expenses", id), {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        updatedAt: serverTimestamp(),
      });
      toast.success("Expense updated successfully");
      router.push("/girls/expenses");
    } catch {
      toast.error("Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "#1B4332" }}
        />
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Expense"
        subtitle="Update expense details"
        backHref="/girls/expenses"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md p-6"
        style={{ border: "1px solid #E8DFD4" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Title", name: "title", type: "text", required: true },
            { label: "Vendor / Payee", name: "vendor", type: "text" },
            {
              label: "Amount (Rs.)",
              name: "amount",
              type: "number",
              required: true,
            },
            {
              label: "Expense Date",
              name: "expenseDate",
              type: "date",
              required: true,
            },
          ].map((field) => (
            <div key={field.name}>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                {field.label}{" "}
                {field.required && <span style={{ color: "#D39542" }}>*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className="w-full h-9 border rounded px-3 text-sm focus:outline-none"
                style={{
                  borderColor: errors[field.name] ? "#EF4444" : "#E8DFD4",
                  color: "#3D3227",
                }}
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}

          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "#3D3227" }}
            >
              Category <span style={{ color: "#D39542" }}>*</span>
            </label>
            <select
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              className="w-full h-9 border rounded px-3 text-sm focus:outline-none"
              style={{
                borderColor: errors.category ? "#EF4444" : "#E8DFD4",
                color: "#3D3227",
              }}
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "#3D3227" }}
            >
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod || "cash"}
              onChange={handleChange}
              className="w-full h-9 border rounded px-3 text-sm focus:outline-none"
              style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m.toLowerCase()}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "#3D3227" }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none resize-none"
              style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
            />
          </div>
          <div className="md:col-span-2">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "#3D3227" }}
            >
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              rows={2}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none resize-none"
              style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
            />
          </div>
        </div>

        <div
          className="flex justify-end gap-3 mt-6 pt-5"
          style={{ borderTop: "1px solid #E8DFD4" }}
        >
          <Link
            href="/girls/expenses"
            className="px-4 py-2 text-sm rounded"
            style={{ border: "1px solid #E8DFD4", color: "#3D3227" }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded"
            style={{ background: "#1B4332", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Updating...
              </>
            ) : (
              <>
                <Save size={14} /> Update Expense
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
