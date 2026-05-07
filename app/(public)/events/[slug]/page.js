"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
const getEventImg = (title = "", w = 1200, h = 400) => {
  const t = title.toLowerCase();
  const match = _EVENT_KW.find(({ kw }) => kw.some((k) => t.includes(k)));
  const photo = match ? match.photo : _FALLBACK_PHOTO;
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};
import { ArrowLeft, MapPin, Calendar, Clock, Users } from "lucide-react";
import { formatDate } from "@/src/lib/utils";
import StatusBadge from "@/src/components/shared/StatusBadge";

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated event data fetch
    const mockEvents = {
      1: {
        id: "1",
        title: "Annual Sports Day",
        description:
          "Join us for the annual sports competition featuring track events, team sports, and more. Students from all classes will participate in various athletic activities including running, jumping, throwing, and team sports like football and basketball.",
        fullDescription:
          "The Annual Sports Day is one of our most anticipated events of the year. This full-day event brings together students, teachers, and parents for a celebration of athletic achievement and school spirit.\n\nActivities include:\n- 100m, 200m, and 400m races\n- Long jump and high jump\n- Shot put and discus throw\n- Relay races\n- Football and basketball matches\n- Fun games for younger students\n\nAll students are encouraged to participate and showcase their athletic abilities. Parents are welcome to attend and cheer for their children.",
        date: "2024-03-15",
        time: "9:00 AM - 5:00 PM",
        venue: "Main Ground",
        organizer: "Sports Department",
        expectedAttendees: "500+",
        status: "upcoming",
      },
      2: {
        id: "2",
        title: "Science Exhibition",
        description:
          "Students showcase their innovative science projects and experiments. Judges will evaluate projects based on creativity, scientific method, and presentation.",
        fullDescription:
          "The annual Science Exhibition provides students with an opportunity to apply classroom learning to real-world problems through creative and innovative projects.\n\nCategories include:\n- Physics\n- Chemistry\n- Biology\n- Environmental Science\n- Technology & Innovation\n\nProjects will be judged by a panel of scientists and educators. Winners will receive certificates and prizes.",
        date: "2024-03-20",
        time: "10:00 AM - 4:00 PM",
        venue: "Science Block",
        organizer: "Science Department",
        expectedAttendees: "300+",
        status: "upcoming",
      },
    };

    const eventData = mockEvents[params.slug] || {
      id: params.slug,
      title: "Event Details",
      description: "Event information will be displayed here.",
      fullDescription: "Detailed event information is currently unavailable.",
      date: new Date().toISOString(),
      time: "TBA",
      venue: "TBA",
      organizer: "Administration",
      expectedAttendees: "TBA",
      status: "upcoming",
    };

    setEvent(eventData);
    setLoading(false);
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-300 mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-32 mb-6" />
            <div className="h-100 bg-neutral-200 rounded-md mb-8" />
            <div className="h-8 bg-neutral-200 rounded w-2/3 mb-4" />
            <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
          </div>
        </div>
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
        {/* Back Button */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 mb-6"
        >
          <ArrowLeft size={16} />
          All Events
        </Link>

        {/* Event Poster */}
        <div className="relative h-75 md:h-100 rounded-md overflow-hidden mb-8">
          <Image
            src={getEventImg(event.title, 1200, 400)}
            alt={event.title}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&h=400&q=80`;
            }}
          />
        </div>

        {/* Event Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
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

          {/* Sidebar Info */}
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
