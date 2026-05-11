"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock, Users } from "lucide-react";
import { db } from "@/src/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { formatDate } from "@/src/lib/utils";

const toIsoDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const m = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  let date;
  if (value?.toDate) date = value.toDate();
  else if (value?.seconds) date = new Date(value.seconds * 1000);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const computeStatus = (dateKey) => {
  if (!dateKey) return "upcoming";
  const todayKey = new Date().toISOString().slice(0, 10);
  if (dateKey === todayKey) return "ongoing";
  return dateKey > todayKey ? "upcoming" : "completed";
};

export default function EventDetailsPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const id = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posterOk, setPosterOk] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const fetchEvent = async () => {
      setLoading(true);
      setPosterOk(true);

      try {
        const loadFrom = async (collectionName) => {
          const snap = await getDoc(doc(db, collectionName, id));
          if (!snap.exists()) return null;
          return { id: snap.id, ...snap.data() };
        };

        const raw =
          (await loadFrom("boys_events")) ?? (await loadFrom("girls_events"));

        if (cancelled) return;

        if (!raw || raw.isPublic !== true) {
          setEvent(null);
          return;
        }

        const rawDate = raw.eventDate || raw.date;
        const dateKey = toIsoDateKey(rawDate);
        const status = raw.status || computeStatus(dateKey);

        setEvent({
          id: raw.id,
          title: raw.title || "Event",
          description: raw.description || "",
          fullDescription: raw.fullDescription || raw.description || "",
          date: rawDate,
          time: raw.time || "TBA",
          venue: raw.venue || "TBA",
          expectedAttendees: raw.expectedAttendees || "—",
          organizer: raw.organizer || "SMAS",
          status,
          posterUrl: raw.posterUrl || "",
        });
      } catch (e) {
        console.error("Failed to load event", e);
        if (!cancelled) setEvent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEvent();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-neutral-600">Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-neutral-900 mb-2">
            Event Not Found
          </h2>
          <p className="text-neutral-600 mb-6">
            The event you are looking for does not exist.
          </p>
          <Link href="/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-300 mx-auto px-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft size={16} />
          All Events
        </Link>

        <div className="relative h-75 md:h-100 rounded-md overflow-hidden mb-8">
          {event.posterUrl && posterOk ? (
            <img
              src={event.posterUrl}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setPosterOk(false)}
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
              <span className="text-sm text-neutral-500">No poster</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-serif text-3xl text-brand">{event.title}</h1>
              <StatusBadge status={event.status} />
            </div>

            <p className="text-md text-neutral-700 mb-6">{event.description}</p>

            <div className="bg-white border border-[#E8DFD4] rounded-md p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                Event Details
              </h3>
              <div className="prose prose-neutral max-w-none text-neutral-700 whitespace-pre-line">
                {event.fullDescription}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-[#E8DFD4] rounded-md p-6 sticky top-8">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                Event Information
              </h3>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Calendar size={18} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase">Date</p>
                    <p className="text-sm text-neutral-900">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={18} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase">Time</p>
                    <p className="text-sm text-neutral-900">{event.time}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase">Venue</p>
                    <p className="text-sm text-neutral-900">{event.venue}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users size={18} className="text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase">
                      Expected Attendees
                    </p>
                    <p className="text-sm text-neutral-900">
                      {event.expectedAttendees}
                    </p>
                  </div>
                </li>
              </ul>

              <div className="border-t border-[#E8DFD4] mt-6 pt-6">
                <p className="text-xs text-neutral-500 mb-1">Organized by</p>
                <p className="text-sm font-medium text-neutral-900">
                  {event.organizer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
