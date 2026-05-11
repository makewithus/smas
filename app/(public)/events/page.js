"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import EmptyState from "@/src/components/shared/EmptyState";
import StatusBadge from "@/src/components/shared/StatusBadge";
import { formatDate } from "@/src/lib/utils";
import { db } from "@/src/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";


// Page Hero Component
function PageHero({ title, breadcrumbs }) {
  return (
    <section className="h-70 bg-brand flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-serif text-4xl text-white mb-4">{title}</h1>
      <nav className="flex items-center gap-1 text-sm text-white/60">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight size={14} />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </section>
  );
}

// Filter Tabs
const filterTabs = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const load = async (collectionName) => {
          const q = query(
            collection(db, collectionName),
            where("isPublic", "==", true),
            limit(200),
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        };

        const [boys, girls] = await Promise.all([
          load("boys_events"),
          load("girls_events"),
        ]);

        const merged = [...boys, ...girls]
          .filter((e) => e.isPublic)
          .map((e) => {
            const rawDate = e.eventDate || e.date;
            const dateKey = toIsoDateKey(rawDate);
            return {
              id: e.id,
              title: e.title || "Event",
              description: e.description || "",
              date: rawDate,
              venue: e.venue || "TBA",
              status: computeStatus(dateKey),
              __dateKey: dateKey,
            };
          })
          .sort((a, b) => (a.__dateKey || "").localeCompare(b.__dateKey || ""));

        setEvents(merged.map(({ __dateKey, ...rest }) => rest));
      } catch (e) {
        console.error("Failed to load public events", e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on active filter
  const filteredEvents =
    activeFilter === "all"
      ? events
      : events.filter((event) => event.status === activeFilter);

  return (
    <>
      <PageHero
        title="Upcoming Events"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
      />

      <section className="py-12 bg-background">
        <div className="max-w-300 mx-auto px-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  activeFilter === tab.value
                    ? "bg-brand text-white"
                    : "bg-white border border-[#E8DFD4] text-neutral-700 hover:bg-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E8DFD4] rounded-md overflow-hidden animate-pulse"
                >
                  <div className="h-55 bg-neutral-200" />
                  <div className="p-5">
                    <div className="h-5 bg-neutral-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white border border-[#E8DFD4] rounded-md overflow-hidden"
                >
                  {/* Event Image */}
                  <div className="relative h-55">
                    {event.posterUrl ? (
                      <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
                        <span className="text-xs text-neutral-500">No poster</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-brand text-white text-xs px-2 py-1 rounded">
                      {formatDate(event.date)}
                    </span>
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={event.status} />
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-5">
                    <h3 className="text-md font-medium text-neutral-900 mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-600 mb-2">
                      <MapPin size={12} />
                      <span>{event.venue}</span>
                    </div>
                    <p className="text-sm text-neutral-600 line-clamp-3 mb-4">
                      {event.description}
                    </p>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-sm font-medium text-accent hover:text-accent-500 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No events found"
              description="There are no events matching your filter criteria."
            />
          )}
        </div>
      </section>
    </>
  );
}
