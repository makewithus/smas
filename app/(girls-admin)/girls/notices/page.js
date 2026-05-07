"use client";

import { useState, useEffect } from "react";
import { BellPlus, Pencil, Trash2, Bell } from "lucide-react";
import { db } from "@/src/lib/firebase";
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import EmptyState from "@/src/components/shared/EmptyState";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";

const PRIORITIES = [
  { value: "high", label: "High", borderColor: "#1B4332" },
  { value: "medium", label: "Medium", borderColor: "#D39542" },
  { value: "low", label: "Low", borderColor: "#E8DFD4" },
];
const priorityBadge = {
  high: { bg: "rgba(27,67,50,0.08)", text: "#1B4332" },
  medium: { bg: "rgba(211,149,66,0.08)", text: "#D39542" },
  low: { bg: "rgba(140,123,107,0.08)", text: "#8C7B6B" },
};
const emptyForm = { text: "", priority: "medium", enabled: true };

export default function GirlsNoticesPage() {
  const [notices, setNotices] = useState([]);
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    notice: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    fetchNotices();
  }, [userProfile?.uid]);
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "girls_notices"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      setNotices(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingNotice(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (notice) => {
    setEditingNotice(notice);
    setForm({
      text: notice.text || "",
      priority: notice.priority || "medium",
      enabled: notice.enabled !== false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.text.trim()) {
      toast.error("Notice text is required");
      return;
    }
    if (form.text.length > 200) {
      toast.error("Notice must be 200 chars or less");
      return;
    }
    try {
      setFormLoading(true);
      if (editingNotice) {
        await updateDoc(doc(db, "girls_notices", editingNotice.id), {
          ...form,
          updatedAt: serverTimestamp(),
        });
        toast.success("Notice updated");
      } else {
        await addDoc(collection(db, "girls_notices"), {
          ...form,
          portal: "girls",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Notice added");
      }
      setDialogOpen(false);
      fetchNotices();
    } catch {
      toast.error("Failed to save notice");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.notice) return;
    try {
      setDeleteLoading(true);
      await deleteDoc(doc(db, "girls_notices", deleteDialog.notice.id));
      toast.success("Notice deleted");
      setNotices((prev) => prev.filter((n) => n.id !== deleteDialog.notice.id));
    } catch {
      toast.error("Failed to delete notice");
    } finally {
      setDeleteLoading(false);
      setDeleteDialog({ open: false, notice: null });
    }
  };

  const toggleEnabled = async (notice) => {
    const newValue = !notice.enabled;
    setNotices((prev) =>
      prev.map((n) => (n.id === notice.id ? { ...n, enabled: newValue } : n)),
    );
    try {
      await updateDoc(doc(db, "girls_notices", notice.id), {
        enabled: newValue,
        updatedAt: serverTimestamp(),
      });
      toast.success(newValue ? "Notice enabled" : "Notice disabled");
    } catch {
      setNotices((prev) =>
        prev.map((n) =>
          n.id === notice.id ? { ...n, enabled: notice.enabled } : n,
        ),
      );
      toast.error("Failed to update notice");
    }
  };

  const activeNotices = notices.filter((n) => n.enabled);

  return (
    <div>
      <PageHeader
        title="Notices"
        subtitle="Manage public notice board"
        actions={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md"
            style={{ background: "#1B4332" }}
          >
            <BellPlus size={16} /> Add Notice
          </button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-md animate-pulse"
              style={{ background: "#E8DFD4" }}
            />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notices yet"
          description="Add your first notice"
          action={{ label: "Add Notice", onClick: openAdd }}
        />
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => {
            const p =
              PRIORITIES.find((pr) => pr.value === notice.priority) ||
              PRIORITIES[1];
            const badge =
              priorityBadge[notice.priority] || priorityBadge.medium;
            return (
              <div
                key={notice.id}
                className="bg-white rounded-md px-5 py-4 flex items-start justify-between"
                style={{
                  border: "1px solid #E8DFD4",
                  borderLeft: `4px solid ${p.borderColor}`,
                }}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <span
                    className="inline-block text-xs font-medium px-2 py-0.5 rounded uppercase"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {notice.priority}
                  </span>
                  <p className="text-sm mt-1.5" style={{ color: "#3D3227" }}>
                    {notice.text}
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: "#8C7B6B" }}>
                    Created{" "}
                    {notice.createdAt?.toDate
                      ? formatDate(notice.createdAt.toDate())
                      : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={notice.enabled !== false}
                      onCheckedChange={() => toggleEnabled(notice)}
                      className="scale-75"
                    />
                    <span className="text-xs" style={{ color: "#8C7B6B" }}>
                      {notice.enabled !== false ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(notice)}
                      className="p-1 rounded"
                    >
                      <Pencil size={14} color="#8C7B6B" />
                    </button>
                    <button
                      onClick={() => setDeleteDialog({ open: true, notice })}
                      className="p-1 rounded"
                    >
                      <Trash2 size={14} color="#8C7B6B" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notices.length > 0 && (
        <div className="mt-8">
          <div
            className="text-xs uppercase tracking-widest mb-3"
            style={{
              color: "#8C7B6B",
              borderTop: "1px solid #E8DFD4",
              paddingTop: 20,
            }}
          >
            Public Marquee Preview
          </div>
          <div
            className="flex items-center overflow-hidden rounded"
            style={{ background: "#1B4332", height: 44 }}
          >
            <div
              className="shrink-0 flex items-center px-4 h-full text-white text-xs font-medium uppercase tracking-wide"
              style={{ background: "#D39542" }}
            >
              NOTICES
            </div>
            <div
              className="w-px h-full"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <div className="flex-1 overflow-hidden">
              {activeNotices.length > 0 ? (
                <div
                  className="whitespace-nowrap text-white text-xs"
                  style={{ animation: "marquee 20s linear infinite" }}
                >
                  {activeNotices.map((n) => n.text).join(" | ")}
                </div>
              ) : (
                <span
                  className="text-xs px-4"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  No enabled notices
                </span>
              )}
            </div>
          </div>
          <p className="text-xs mt-2 italic" style={{ color: "#8C7B6B" }}>
            This is how notices appear on the public homepage.
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Newsreader, serif" }}>
              {editingNotice ? "Edit Notice" : "Add New Notice"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                Notice Text <span style={{ color: "#D39542" }}>*</span>
              </label>
              <textarea
                rows={3}
                maxLength={200}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none resize-none"
                style={{ borderColor: "#E8DFD4" }}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Enter notice text..."
              />
              <div
                className="text-right text-xs mt-1"
                style={{ color: "#8C7B6B" }}
              >
                {form.text.length}/200
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                Priority
              </label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger
                  className="h-9 text-sm"
                  style={{ borderColor: "#E8DFD4" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => setForm({ ...form, enabled: v })}
              />
              <span className="text-sm" style={{ color: "#3D3227" }}>
                Enable this notice
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={formLoading}
              style={{ background: "#1B4332", color: "#fff" }}
            >
              {formLoading
                ? "Saving..."
                : editingNotice
                  ? "Update"
                  : "Save Notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, notice: null })}
        onConfirm={handleDelete}
        title="Delete Notice"
        description="This notice will be permanently deleted."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
