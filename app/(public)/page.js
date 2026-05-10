"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { INSTITUTION, DEFAULT_NOTICES } from "@/src/lib/constants";
import { formatDate } from "@/src/lib/utils";

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
const getEventImg = (title = "", w = 400, h = 200) => {
  const t = title.toLowerCase();
  const match = _EVENT_KW.find(({ kw }) => kw.some((k) => t.includes(k)));
  const photo = match ? match.photo : _FALLBACK_PHOTO;
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
};

// Hero Slider Component
function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoKey, setAutoKey] = useState(0); // reset timer on manual nav

  const slides = [
    {
      image: "/image4.jpeg",
      title: "Excellence in Education Since 2005",
      subtitle: "Empowering students with knowledge and values for a brighter future",
      label: "Welcome",
    },
    {
      image: "/image1.jpeg",
      title: "Comprehensive Student Management",
      subtitle: "Modern administration system for efficient institutional operations",
      label: "Administration",
    },
    {
      image: "/image2.jpeg",
      title: "Building Tomorrow's Leaders Today",
      subtitle: "Join our community of dedicated educators and motivated learners",
      label: "Community",
    },
    {
      image: "/image3.jpeg",
      title: "Nurturing Every Student's Potential",
      subtitle: "A caring environment where every student thrives and grows",
      label: "Growth",
    },
    {
      image: "/image5.jpeg",
      title: "Safe & Comfortable Hostel Life",
      subtitle: "Modern facilities and a home-like atmosphere for all students",
      label: "Hostel",
    },
    {
      image: "/image6.jpeg",
      title: "A Legacy of Academic Excellence",
      subtitle: "Shaping futures through discipline, dedication, and devotion",
      label: "Excellence",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoKey((k) => k + 1); // reset auto-play timer
  };

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
    setAutoKey((k) => k + 1); // reset auto-play timer
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, autoKey]);

  const handleNext = () => {
    nextSlide();
    setAutoKey((k) => k + 1);
  };

  return (
    <section
      className="relative h-95 md:h-145 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slides[currentSlide].image}
          alt="Hero background"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-brand/65" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center px-6">
        <div className="max-w-175">
          <span className="inline-block px-3 py-1 text-xs border border-white/50 text-white rounded-full mb-4">
            {slides[currentSlide].label}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white font-normal mb-4 text-balance">
            {slides[currentSlide].title}
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-6 max-w-125 mx-auto">
            {slides[currentSlide].subtitle}
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-white text-brand px-5 py-2.5 rounded-md text-sm font-medium hover:bg-neutral-100 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentSlide ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// Notice Marquee Component
function NoticeTicker() {
  const [notices, setNotices] = useState(DEFAULT_NOTICES);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const loadNotices = async (collectionName) => {
          const q = query(
            collection(db, collectionName),
            orderBy("createdAt", "desc"),
            limit(20)
          );
          const snap = await getDocs(q);
          return snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((n) => n.enabled === true);
        };

        const [boys, girls] = await Promise.all([
          loadNotices("boys_notices"),
          loadNotices("girls_notices"),
        ]);

        const getMillis = (ts) =>
          ts?.toMillis ? ts.toMillis() : ts?.seconds ? ts.seconds * 1000 : 0;

        const merged = [...boys, ...girls].sort(
          (a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)
        );
        const texts = merged
          .map((n) => n.title || n.text || n.content)
          .filter(Boolean);

        if (texts.length > 0) setNotices(texts);
      } catch {
        // fallback to defaults
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="h-11 bg-brand flex items-center overflow-hidden">
      <div className="bg-accent text-white text-xs uppercase px-4 h-full flex items-center font-medium shrink-0">
        Notices
      </div>
      <div className="h-full w-px bg-white/20" />
      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-sm text-white">
          {notices.join("  |  ")}
        </div>
      </div>
    </div>
  );
}

// Introduction Section
function IntroSection() {
  const stats = [
    { value: "500+", label: "Students" },
    { value: "20+", label: "Years" },
    { value: "100%", label: "Results" },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-300 mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <span className="text-xs uppercase tracking-wider text-accent mb-3 block">
              About Our Institution
            </span>
            <h2 className="font-serif text-4xl text-brand mb-2">
              Nurturing Excellence
            </h2>
            <div className="w-12 h-0.5 bg-accent mb-5" />
            <p className="text-md text-neutral-800/80 leading-relaxed mb-4">
              Hudaibiyya Arabic College, run by Hudaibiyya Islamic Charitable Trust, Vottancheri, has been a beacon of educational excellence for over two decades. We provide a nurturing environment where students can thrive academically, socially, and spiritually.
            </p>
            <p className="text-md text-neutral-800/80 leading-relaxed mb-8">
              With dedicated faculty, modern facilities, and a comprehensive curriculum rooted in Islamic values, we prepare our students for the challenges of tomorrow while instilling values that will guide them throughout their lives.
            </p>

            {/* Stats */}
            <div className="flex items-center divide-x divide-[#E8DFD4]">
              {stats.map((stat, idx) => (
                <div key={idx} className="px-6 first:pl-0 last:pr-0">
                  <p className="font-serif text-4xl text-brand">{stat.value}</p>
                  <p className="text-xs text-neutral-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <Image
              src="/image3.jpeg"
              alt="Institution building"
              width={600}
              height={450}
              loading="eager"
              className="rounded-md border border-[#E8DFD4] object-cover w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Events Section
function EventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const loadEvents = async (collectionName) => {
          const q = query(
            collection(db, collectionName),
            where("isPublic", "==", true),
            // Avoid composite-index requirement by sorting client-side.
            limit(50)
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        };

        const [boys, girls] = await Promise.all([
          loadEvents("boys_events"),
          loadEvents("girls_events"),
        ]);

        const todayKey = new Date().toISOString().slice(0, 10);

        const merged = [...boys, ...girls]
          .filter((e) => e.isPublic)
          .map((e) => ({
            ...e,
            __dateKey: toIsoDateKey(e.eventDate || e.date),
          }))
          .filter((e) => e.__dateKey && e.__dateKey >= todayKey)
          .sort((a, b) => a.__dateKey.localeCompare(b.__dateKey))
          .slice(0, 3);

        const items = merged;
        if (items.length > 0) {
          setEvents(items.map(({ __dateKey, ...rest }) => rest));
        } else {
          // fallback placeholder
          setEvents([]);
        }
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section className="py-18 bg-surface">
      <div className="max-w-300 mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-wider text-accent mb-2 block">
            Stay Updated
          </span>
          <h2 className="font-serif text-4xl text-brand">Upcoming Events</h2>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {loading ? (
            // Skeleton Cards
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E8DFD4] rounded-md overflow-hidden animate-pulse"
              >
                <div className="h-50 bg-neutral-200" />
                <div className="p-5">
                  <div className="h-5 bg-neutral-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-[#E8DFD4] rounded-md overflow-hidden"
              >
                {/* Event Image */}
                <div className="relative h-50">
                  <Image
                    src={getEventImg(event.title, 400, 200)}
                    alt={event.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=400&h=200&q=80`;
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-brand text-white text-xs px-2 py-1 rounded">
                    {formatDate(event.eventDate || event.date)}
                  </span>
                </div>

                {/* Event Content */}
                <div className="p-5">
                  <h3 className="text-md font-medium text-neutral-900 mb-1.5">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-neutral-600 mb-2">
                    <MapPin size={12} />
                    <span>{event.venue}</span>
                  </div>
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
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
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <Calendar size={48} className="mx-auto text-[#E8DFD4] mb-4" />
              <p className="text-neutral-600">No upcoming events</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Statistics Section
function StatsSection() {
  const stats = [
    { icon: Users, value: "500+", label: "Students Enrolled" },
    { icon: Award, value: "20+", label: "Years of Excellence" },
    { icon: Calendar, value: "50+", label: "Events Per Year" },
    { icon: TrendingUp, value: "98%", label: "Success Rate" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-300 mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E8DFD4]">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-8 text-center hover:bg-background transition-colors"
              >
                <Icon size={24} className="mx-auto text-brand mb-3" />
                <p className="font-serif text-4xl text-brand">{stat.value}</p>
                <p className="text-sm text-neutral-600 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-18 bg-surface">
      <div className="max-w-160 mx-auto px-6 text-center">
        <span className="text-xs uppercase tracking-wider text-accent mb-2 block">
          Get Started
        </span>
        <h2 className="font-serif text-4xl text-brand mb-4">
          Ready to Join Us?
        </h2>
        <p className="text-md text-neutral-800/80 mb-8">
          Access the admin portal to manage students, track expenses, organize
          events, and more. Everything you need in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="btn-primary py-3 px-7">
            Admin Portal
          </Link>
          <Link href="/about" className="btn-outline py-3 px-7">
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main Home Page
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <NoticeTicker />
      <IntroSection />
      <EventsSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
