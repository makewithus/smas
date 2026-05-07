"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { CLASSES } from "@/src/lib/constants";

const SECTIONS = ["A", "B", "C", "D"];

export default function StudentForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  portal = "boys",
}) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    fatherName: initialData.fatherName || "",
    motherName: initialData.motherName || "",
    class: initialData.class || "",
    section: initialData.section || "",
    rollNo: initialData.rollNo || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    admissionDate: initialData.admissionDate || "",
    status: initialData.status || "active",
    notes: initialData.notes || "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inp =
    "w-full h-9 border rounded px-3 text-sm focus:outline-none focus:ring-1";
  const style = { borderColor: "#E8DFD4", color: "#3D3227" };
  const focusStyle = { "--tw-ring-color": "#1B4332" };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Student Name *", key: "name", required: true },
          { label: "Father's Name", key: "fatherName" },
          { label: "Mother's Name", key: "motherName" },
          { label: "Roll Number", key: "rollNo" },
          { label: "Phone", key: "phone", type: "tel" },
          { label: "Admission Date", key: "admissionDate", type: "date" },
        ].map(({ label, key, required, type = "text" }) => (
          <div key={key}>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "#3D3227" }}
            >
              {label}
            </label>
            <input
              type={type}
              className={inp}
              style={style}
              required={required}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          </div>
        ))}

        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Class *
          </label>
          <select
            className={inp}
            style={style}
            required
            value={form.class}
            onChange={(e) => set("class", e.target.value)}
          >
            <option value="">Select Class</option>
            {(CLASSES || []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Section
          </label>
          <select
            className={inp}
            style={style}
            value={form.section}
            onChange={(e) => set("section", e.target.value)}
          >
            <option value="">Select Section</option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Status
          </label>
          <select
            className={inp}
            style={style}
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="alumni">Alumni</option>
          </select>
        </div>
      </div>

      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: "#3D3227" }}
        >
          Address
        </label>
        <input
          type="text"
          className={inp}
          style={style}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </div>

      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: "#3D3227" }}
        >
          Notes
        </label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
          style={{
            borderColor: "#E8DFD4",
            color: "#3D3227",
            minHeight: "80px",
          }}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
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
            "Save Student"
          )}
        </button>
      </div>
    </form>
  );
}
