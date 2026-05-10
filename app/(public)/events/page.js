"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import { db } from "@/src/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import StatusBadge from "@/src/components/shared/StatusBadge";
import EmptyState from "@/src/components/shared/EmptyState";

// Keyword → relevant Unsplash photo (education/hostel theme)
const _FALLBACK_PHOTO = "photo-1571260899304-425eee4c7efc";
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
const getEventImg = (title = "", w = 400, h = 220) => {
  const t = title.toLowerCase();
  const match = _EVENT_KW.find(({ kw }) => kw.some((k) => t.includes(k)));
  const photo = match ? match.photo : _FALLBACK_PHOTO;
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

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
                    <Image
                      src={getEventImg(event.title, 400, 220)}
                      alt={event.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=400&h=220&q=80`;
                      }}
                    />
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
