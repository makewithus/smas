"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/src/lib/constants";

export default function ExpenseForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    category: initialData.category || "",
    amount: initialData.amount || "",
    paymentMethod: initialData.paymentMethod || "cash",
    date: initialData.date || new Date().toISOString().split("T")[0],
    vendor: initialData.vendor || "",
    description: initialData.description || "",
    receiptNo: initialData.receiptNo || "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inp = "w-full h-9 border rounded px-3 text-sm focus:outline-none";
  const style = { borderColor: "#E8DFD4", color: "#3D3227" };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Title *
          </label>
          <input
            type="text"
            className={inp}
            style={style}
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Category *
          </label>
          <select
            className={inp}
            style={style}
            required
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select Category</option>
            {(Array.isArray(EXPENSE_CATEGORIES) ? EXPENSE_CATEGORIES : []).map(
              (c) => (
                <option key={c.value || c} value={c.value || c}>
                  {c.label || c}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Amount (₹) *
          </label>
          <input
            type="number"
            className={inp}
            style={style}
            required
            min="0"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Payment Method
          </label>
          <select
            className={inp}
            style={style}
            value={form.paymentMethod}
            onChange={(e) => set("paymentMethod", e.target.value)}
          >
            {(PAYMENT_METHODS || ["Cash", "Cheque", "Online", "DD"]).map(
              (m) => (
                <option key={m} value={m.toLowerCase()}>
                  {m}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Date
          </label>
          <input
            type="date"
            className={inp}
            style={style}
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Vendor
          </label>
          <input
            type="text"
            className={inp}
            style={style}
            value={form.vendor}
            onChange={(e) => set("vendor", e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Receipt No.
          </label>
          <input
            type="text"
            className={inp}
            style={style}
            value={form.receiptNo}
            onChange={(e) => set("receiptNo", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: "#3D3227" }}
        >
          Description
        </label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
          style={{
            borderColor: "#E8DFD4",
            color: "#3D3227",
            minHeight: "70px",
          }}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border"
            style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-md"
          style={{ background: "#1B4332", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            "Save Expense"
          )}
        </button>
      </div>
    </form>
  );
}
