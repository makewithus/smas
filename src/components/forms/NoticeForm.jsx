"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { NOTICE_PRIORITIES } from "@/src/lib/constants";

export default function NoticeForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    priority: initialData.priority || "normal",
    isActive: initialData.isActive ?? true,
    isPublic: initialData.isPublic ?? false,
    expiresAt: initialData.expiresAt || "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inp = "w-full h-9 border rounded px-3 text-sm focus:outline-none";
  const style = { borderColor: "#E8DFD4", color: "#3D3227" };

  const priorities = Array.isArray(NOTICE_PRIORITIES)
    ? NOTICE_PRIORITIES
    : [
        { value: "low", label: "Low" },
        { value: "normal", label: "Normal" },
        { value: "high", label: "High" },
        { value: "urgent", label: "Urgent" },
      ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(form);
      }}
      className="space-y-4"
    >
      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: "#3D3227" }}
        >
          Notice Title *
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Priority
          </label>
          <select
            className={inp}
            style={style}
            value={form.priority}
            onChange={(e) => set("priority", e.target.value)}
          >
            {priorities.map((p) => (
              <option key={p.value || p} value={p.value || p}>
                {p.label || p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Expires On
          </label>
          <input
            type="date"
            className={inp}
            style={style}
            value={form.expiresAt}
            onChange={(e) => set("expiresAt", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: "#3D3227" }}
        >
          Content *
        </label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none"
          style={{
            borderColor: "#E8DFD4",
            color: "#3D3227",
            minHeight: "100px",
          }}
          required
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
        />
      </div>
      <div className="flex gap-6">
        <label
          className="flex items-center gap-2 text-sm cursor-pointer"
          style={{ color: "#3D3227" }}
        >
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            style={{ accentColor: "#1B4332" }}
          />{" "}
          Active
        </label>
        <label
          className="flex items-center gap-2 text-sm cursor-pointer"
          style={{ color: "#3D3227" }}
        >
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(e) => set("isPublic", e.target.checked)}
            style={{ accentColor: "#1B4332" }}
          />{" "}
          Show on public website
        </label>
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
            "Save Notice"
          )}
        </button>
      </div>
    </form>
  );
}
