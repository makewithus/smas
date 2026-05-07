"use client";

import { useState, useEffect } from "react";
import {
  CalendarPlus,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { db, storage } from "@/src/lib/firebase";
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast } from "sonner";
import PageHeader from "@/src/components/shared/PageHeader";
import ConfirmDialog from "@/src/components/shared/ConfirmDialog";
import EmptyState from "@/src/components/shared/EmptyState";
import StatusBadge from "@/src/components/shared/StatusBadge";
import LoadingSkeleton from "@/src/components/shared/LoadingSkeleton";
import { formatDate } from "@/src/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Keyword → relevant Unsplash photo (education/hostel theme)
const _FALLBACK_IMG =
  "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&h=200&q=80";
const _onImgErr = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = _FALLBACK_IMG;
};
const _EVENT_KW = [
  {
    kw: [
      "sport",
      "cricket",
      "football",
      "athletics",
      "game",
      "tournament",
      "run",
      "race",
      "ground",
    ],
    photo: "photo-1461896836934-ffe607ba8211",
  },
  {
    kw: [
      "science",
      "exhibition",
      "experiment",
      "project",
      "lab",
      "tech",
      "robot",
    ],
    photo: "photo-1544717302-de2939b7ef71",
  },
  {
    kw: [
      "quran",
      "islamic",
      "recitation",
      "mosque",
      "nasheed",
      "prayer",
      "hifz",
    ],
    photo: "photo-1558618666-fcd25c85cd64",
  },
  {
    kw: ["independence", "national", "flag", "patriot", "republic", "ceremony"],
    photo: "photo-1532375810709-75b1da00537c",
  },
  {
    kw: [
      "prize",
      "award",
      "distribut",
      "achievement",
      "honor",
      "honour",
      "trophy",
    ],
    photo: "photo-1540575467063-178a50c2df87",
  },
  {
    kw: ["parent", "teacher", "meeting", "ptm", "academic", "conference"],
    photo: "photo-1524178232363-1fb2b075b655",
  },
  {
    kw: ["cultural", "dance", "music", "art", "talent", "drama", "perform"],
    photo: "photo-1514320291840-2e0a9bf2a9ae",
  },
  {
    kw: ["graduation", "farewell", "convocation", "pass", "result"],
    photo: "photo-1523050854058-8df90110c9f1",
  },
  {
    kw: ["health", "medical", "camp", "first aid", "dental", "eye"],
    photo: "photo-1546410531-bb4caa6b424d",
  },
  {
    kw: ["seminar", "workshop", "lecture", "training", "skill", "debate"],
    photo: "photo-1503676260728-1c00da094a0b",
  },
  {
    kw: ["library", "book", "reading", "literacy", "study"],
    photo: "photo-1481627834876-b7833e8f5570",
  },
  {
    kw: ["food", "feast", "iftar", "ramadan", "eid", "celebration", "festival"],
    photo: "photo-1530103862676-de8c9debad1d",
  },
];
const getEventImg = (title = "") => {
  const t = title.toLowerCase();
  const match = _EVENT_KW.find(({ kw }) => kw.some((k) => t.includes(k)));
  const photo = match ? match.photo : "photo-1571260899304-425eee4c7efc";
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=600&h=200&q=80`;
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";

const PORTAL = "boys";

const emptyForm = {
  title: "",
  description: "",
  eventDate: "",
  venue: "",
  status: "upcoming",
  isPublic: false,
  posterUrl: "",
};

export default function BoysEventsPage() {
  const [events, setEvents] = useState([]);
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
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
        collection(db, "boys_events"),
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
    setPosterPreview(null);
    setDialogOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate || "",
      venue: event.venue || "",
      status: event.status || "upcoming",
      isPublic: event.isPublic || false,
      posterUrl: event.posterUrl || "",
    });
    setPosterFile(null);
    setPosterPreview(event.posterUrl || null);
    setDialogOpen(true);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Poster must be under 5MB");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.eventDate) {
      toast.error("Title and date are required");
      return;
    }
    try {
      setFormLoading(true);
      let posterUrl = form.posterUrl;
      if (posterFile) {
        const eventId = editingEvent ? editingEvent.id : `evt_${Date.now()}`;
        const storageRef = ref(
          storage,
          `events/${eventId}/poster.${posterFile.name.split(".").pop()}`,
        );
        await uploadBytes(storageRef, posterFile);
        posterUrl = await getDownloadURL(storageRef);
      }
      if (editingEvent) {
        await updateDoc(doc(db, "boys_events", editingEvent.id), {
          ...form,
          posterUrl,
          updatedAt: serverTimestamp(),
        });
        toast.success("Event updated");
      } else {
        await addDoc(collection(db, "boys_events"), {
          ...form,
          posterUrl,
          portal: PORTAL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Event added");
      }
      setDialogOpen(false);
      fetchEvents();
    } catch {
      toast.error("Failed to save event");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.event) return;
    try {
      setDeleteLoading(true);
      await deleteDoc(doc(db, "boys_events", deleteDialog.event.id));
      if (deleteDialog.event.posterUrl) {
        try {
          const storageRef = ref(storage, deleteDialog.event.posterUrl);
          await deleteObject(storageRef);
        } catch {}
      }
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
      await updateDoc(doc(db, "boys_events", event.id), {
        isPublic: newValue,
        updatedAt: serverTimestamp(),
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
            <CalendarPlus size={16} />
            Add Event
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
                {event.posterUrl ? (
                  <img
                    src={getEventImg(event.title)}
                    alt={event.title}
                    onError={_onImgErr}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getEventImg(event.title)}
                    alt={event.title}
                    onError={_onImgErr}
                    className="w-full h-full object-cover"
                  />
                )}
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
                    className="p-1 rounded hover:bg-neutral-50"
                  >
                    <Pencil size={15} color="#8C7B6B" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ open: true, event })}
                    className="p-1 rounded hover:bg-neutral-50"
                  >
                    <Trash2 size={15} color="#8C7B6B" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
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
                className="w-full h-9 border rounded px-3 text-sm focus:outline-none focus:border-brand"
                style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event title"
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
                  className="w-full h-9 border rounded px-3 text-sm focus:outline-none focus:border-brand"
                  style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
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
                className="w-full h-9 border rounded px-3 text-sm focus:outline-none focus:border-brand"
                style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Event venue"
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
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand resize-none"
                style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Event description"
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "#3D3227" }}
              >
                Event Poster
              </label>
              {posterPreview ? (
                <div className="relative">
                  <img
                    src={posterPreview}
                    alt="Poster"
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => {
                      setPosterFile(null);
                      setPosterPreview(null);
                      setForm({ ...form, posterUrl: "" });
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 text-xs text-red-500"
                    style={{ border: "1px solid #E8DFD4" }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center w-full h-24 rounded cursor-pointer"
                  style={{ border: "2px dashed #E8DFD4" }}
                >
                  <span className="text-xs" style={{ color: "#8C7B6B" }}>
                    Click to upload poster (JPG/PNG, max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterChange}
                  />
                </label>
              )}
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
        description="Delete this event? The poster will also be removed. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
