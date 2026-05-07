"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { EVENT_STATUS } from "@/src/lib/constants";
import FileUploader from "@/src/components/shared/FileUploader";

export default function EventForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    date: initialData.date || "",
    time: initialData.time || "",
    venue: initialData.venue || "",
    status: initialData.status || "upcoming",
    isPublic: initialData.isPublic ?? true,
    organizer: initialData.organizer || "",
  });
  const [posterFile, setPosterFile] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inp = "w-full h-9 border rounded px-3 text-sm focus:outline-none";
  const style = { borderColor: "#E8DFD4", color: "#3D3227" };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ ...form, posterFile });
  };

  const statuses = Array.isArray(EVENT_STATUS)
    ? EVENT_STATUS
    : [
        { value: "upcoming", label: "Upcoming" },
        { value: "ongoing", label: "Ongoing" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: "#3D3227" }}
        >
          Event Title *
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
            Time
          </label>
          <input
            type="time"
            className={inp}
            style={style}
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Venue
          </label>
          <input
            type="text"
            className={inp}
            style={style}
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
          />
        </div>
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "#3D3227" }}
          >
            Organizer
          </label>
          <input
            type="text"
            className={inp}
            style={style}
            value={form.organizer}
            onChange={(e) => set("organizer", e.target.value)}
          />
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
            {statuses.map((s) => (
              <option key={s.value || s} value={s.value || s}>
                {s.label || s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-5">
          <input
            type="checkbox"
            id="isPublic"
            checked={form.isPublic}
            onChange={(e) => set("isPublic", e.target.checked)}
            style={{ accentColor: "#1B4332" }}
          />
          <label
            htmlFor="isPublic"
            className="text-sm"
            style={{ color: "#3D3227" }}
          >
            Show on public website
          </label>
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
            minHeight: "80px",
          }}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div>
        <label
          className="block text-xs font-medium mb-1"
          style={{ color: "#3D3227" }}
        >
          Event Poster
        </label>
        <FileUploader
          onFileSelect={setPosterFile}
          accept="image/*"
          label="Upload Poster"
          currentUrl={initialData.posterUrl}
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
            "Save Event"
          )}
        </button>
      </div>
    </form>
  );
}
