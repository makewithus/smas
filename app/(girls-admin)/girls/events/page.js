"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, Pencil, Trash2, Calendar, MapPin } from "lucide-react";
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
} from "firebase/firestore";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import EmptyState from "@/src/components/shared/EmptyState";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import FileUploader from "@/src/components/shared/FileUploader";
import { formatDate } from "@/src/lib/utils";
import { deleteFromCloudinary, uploadToCloudinary } from "@/src/lib/cloudinary";
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
import { useAuth } from "@/src/context/AuthContext";

const PORTAL = "girls";
const emptyForm = {
  title: "",
  description: "",
  eventDate: "",
  venue: "",
  status: "upcoming",
  isPublic: true,
  posterUrl: "",
};

export default function GirlsEventsPage() {
  const [events, setEvents] = useState([]);
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [posterFile, setPosterFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    event: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    fetchEvents();
  }, [userProfile?.uid]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "girls_events"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      setEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setPosterFile(null);
    setDialogOpen(true);
  };
  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate || event.date || "",
      venue: event.venue || "",
      status: event.status || "upcoming",
      isPublic: event.isPublic || false,
      posterUrl: event.posterUrl || "",
    });
    setPosterFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.eventDate) {
      toast.error("Title and date are required");
      return;
    }
    try {
      setFormLoading(true);

      let uploadedUrl = form.posterUrl;
      if (posterFile) {
        try {
          uploadedUrl = await uploadToCloudinary(posterFile);
        } catch (error) {
          toast.error(error.message || "Failed to upload poster");
          setFormLoading(false);
          return;
        }
      }

      const payload = {
        ...form,
        date: form.eventDate,
        posterUrl: uploadedUrl || "",
        updatedAt: new Date().toISOString(),
      };

      if (editingEvent) {
        const eventRef = doc(db, "girls_events", editingEvent.id);
        await updateDoc(eventRef, { ...payload });
        if (editingEvent.posterUrl && editingEvent.posterUrl !== payload.posterUrl) {
          await deleteFromCloudinary(editingEvent.posterUrl);
        }
        toast.success("Event updated");
      } else {
        const eventRef = await addDoc(collection(db, "girls_events"), {
          ...payload,
          portal: PORTAL,
          createdAt: new Date().toISOString(),
        });
        toast.success("Event added");
      }
      setDialogOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err?.message || "Failed to save event");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.event) return;
    try {
      setDeleteLoading(true);
      if (deleteDialog.event.posterUrl) {
        await deleteFromCloudinary(deleteDialog.event.posterUrl);
      }
      await deleteDoc(doc(db, "girls_events", deleteDialog.event.id));
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e.id !== deleteDialog.event.id));
    } catch {
      toast.error("Failed to delete event");
    } finally {
      setDeleteLoading(false);
      setDeleteDialog({ open: false, event: null });
    }
  };

  const toggleVisibility = async (event) => {
    const newValue = !event.isPublic;
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, isPublic: newValue } : e)),
    );
    try {
      await updateDoc(doc(db, "girls_events", event.id), {
        isPublic: newValue,
        updatedAt: new Date().toISOString(),
      });
      toast.success(
        newValue ? "Event is now public" : "Event hidden from public site",
      );
    } catch {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, isPublic: event.isPublic } : e,
        ),
      );
      toast.error("Failed to update visibility");
    }
  };

  const statusColor = {
    upcoming: "#1B4332",
    ongoing: "#D39542",
    completed: "#8C7B6B",
  };

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Manage events and public listings"
        actions={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md"
            style={{ background: "#1B4332" }}
          >
            <CalendarPlus size={16} /> Add Event
          </button>
        }
      />

      {loading ? (
        <LoadingSkeleton variant="card" rows={6} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Add your first event to get started"
          action={{ label: "Add Event", onClick: openAdd }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-md overflow-hidden"
              style={{ border: "1px solid #E8DFD4" }}
            >
              <div className="relative" style={{ height: 200 }}>
                <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
                  <span className="text-xs text-neutral-500">No poster</span>
                </div>
                {event.posterUrl ? (
                  <img
                    src={event.posterUrl}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <span
                  className="absolute top-3 right-3 text-white text-xs px-2 py-1 rounded"
                  style={{ background: statusColor[event.status] || "#8C7B6B" }}
                >
                  {event.status}
                </span>
                {event.isPublic && (
                  <span
                    className="absolute top-3 left-3 text-xs px-2 py-1 rounded"
                    style={{
                      background: "#fff",
                      color: "#1B4332",
                      border: "1px solid #E8DFD4",
                    }}
                  >
                    Public
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3
                  className="font-medium text-sm"
                  style={{ color: "#3D3227" }}
                >
                  {event.title}
                </h3>
                <div
                  className="flex items-center gap-1 mt-2"
                  style={{ color: "#8C7B6B" }}
                >
                  <Calendar size={13} />
                  <span className="text-xs">
                    {event.eventDate
                      ? formatDate(event.eventDate)
                      : "No date set"}
                  </span>
                </div>
                {event.venue && (
                  <div
                    className="flex items-center gap-1 mt-1"
                    style={{ color: "#8C7B6B" }}
                  >
                    <MapPin size={13} />
                    <span className="text-xs">{event.venue}</span>
                  </div>
                )}
                {event.description && (
                  <p
                    className="text-xs mt-2 line-clamp-2"
                    style={{ color: "#8C7B6B" }}
                  >
                    {event.description}
                  </p>
                )}
              </div>
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: "1px solid #E8DFD4" }}
              >
                <div className="flex items-center gap-2">
                  <Switch
                    checked={event.isPublic}
                    onCheckedChange={() => toggleVisibility(event)}
                    className="scale-75"
                  />
                  <span className="text-xs" style={{ color: "#8C7B6B" }}>
                    {event.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(event)}
                    className="p-1 rounded"
                  >
                    <Pencil size={15} color="#8C7B6B" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, event })}
                    className="p-1 rounded"
                  >
                    <Trash2 size={15} color="#8C7B6B" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Newsreader, serif" }}>
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                Event Title <span style={{ color: "#D39542" }}>*</span>
              </label>
              <input
                className="w-full h-9 border rounded px-3 text-sm focus:outline-none"
                style={{ borderColor: "#E8DFD4" }}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: "#3D3227" }}
                >
                  Date <span style={{ color: "#D39542" }}>*</span>
                </label>
                <input
                  type="date"
                  className="w-full h-9 border rounded px-3 text-sm focus:outline-none"
                  style={{ borderColor: "#E8DFD4" }}
                  value={form.eventDate}
                  onChange={(e) =>
                    setForm({ ...form, eventDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: "#3D3227" }}
                >
                  Status
                </label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger
                    className="h-9 text-sm"
                    style={{ borderColor: "#E8DFD4" }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                Venue
              </label>
              <input
                className="w-full h-9 border rounded px-3 text-sm focus:outline-none"
                style={{ borderColor: "#E8DFD4" }}
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                Description
              </label>
              <textarea
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none resize-none"
                style={{ borderColor: "#E8DFD4" }}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
                onFileSelect={(file) => {
                  setPosterFile(file);
                  if (!file) {
                    setForm({ ...form, posterUrl: "" });
                  }
                }}
                accept="image/*"
                label="Upload Poster"
                currentUrl={form.posterUrl}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isPublic}
                onCheckedChange={(v) => setForm({ ...form, isPublic: v })}
              />
              <span className="text-sm" style={{ color: "#3D3227" }}>
                Show on public website
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
                : editingEvent
                  ? "Update Event"
                  : "Save Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, event: null })}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Delete this event? The poster will also be removed."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
