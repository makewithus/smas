"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
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

const institutionImages = [
  "/images/WhatsApp Image 2026-05-14 at 2.41.56 PM (1).jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.41.57 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.41.58 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.41.59 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.00 PM (1).jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.00 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.01 PM (1).jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.01 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.02 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.03 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.04 PM (1).jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.05 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.06 PM (1).jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.06 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.08 PM (1).jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.08 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.10 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.11 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.12 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.13 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.14 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.15 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.16 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.17 PM.jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.18 PM (1).jpeg",
  "/images/WhatsApp Image 2026-05-14 at 2.42.19 PM.jpeg",
];

const campusVideos = [
  {
    src: "/gif/WhatsApp Video 2026-05-14 at 2.30.09 PM.mp4",
    title: "Campus Walkthrough",
    text: "A calm look at the spaces students use every day.",
  },
  {
    src: "/gif/WhatsApp Video 2026-05-14 at 2.30.10 PM.mp4",
    title: "Learning Environment",
    text: "Classrooms and common areas shaped for focused learning.",
  },
  {
    src: "/gif/WhatsApp Video 2026-05-14 at 2.30.11 PM.mp4",
    title: "Student Life",
    text: "Daily moments from a disciplined and caring campus.",
  },
  {
    src: "/gif/WhatsApp Video 2026-05-14 at 2.30.12 PM.mp4",
    title: "Facilities",
    text: "A quick view of the environment maintained for students.",
  },
];

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
          <p className="text-base md:text-lg text-white/80 mb-4 max-w-125 mx-auto">
            {slides[currentSlide].subtitle}
          </p>
          {/* Institution Motto */}
          <div className="mb-6 flex flex-col items-center gap-1">
            <span className="text-white/90 text-sm md:text-base font-medium tracking-wide">
              Knowledge, Virtue, Leadership
            </span>
            <span className="text-white/80 text-base md:text-lg font-medium" dir="rtl">
              المعرفة، الفضيلة، القيادة
            </span>
          </div>
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

function InstitutionImageCarousel() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % institutionImages.length);
  }, []);

  const prevImage = () => {
    setCurrentImage((prev) =>
      (prev - 1 + institutionImages.length) % institutionImages.length,
    );
  };

  useEffect(() => {
    const interval = setInterval(nextImage, 4500);
    return () => clearInterval(interval);
  }, [nextImage]);

  return (
    <div className="relative overflow-hidden rounded-md border border-[#E8DFD4] bg-white shadow-sm">
      <div className="relative aspect-[16/9]">
        <Image
          src={institutionImages[currentImage]}
          alt={`Institution view ${currentImage + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 46vw"
          className="object-cover"
          priority={currentImage === 0}
        />
      </div>

      <button
        type="button"
        onClick={prevImage}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/85 text-brand shadow-sm transition-colors hover:bg-white"
        aria-label="Previous institution image"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={nextImage}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/85 text-brand shadow-sm transition-colors hover:bg-white"
        aria-label="Next institution image"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1.5 shadow-sm">
        {institutionImages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentImage(idx)}
            className={`h-1.5 rounded-full transition-all ${
              idx === currentImage ? "w-5 bg-brand" : "w-1.5 bg-neutral-400"
            }`}
            aria-label={`Show institution image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
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
            where("enabled", "==", true)
          );
          const snap = await getDocs(q);
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
          .slice(0, 20)
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
      <div className="marquee-container flex-1 overflow-hidden">
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
              Hudaibiyya Arabic College, run by Hudaibiyya Islamic Charitable Trust, Vellanchira, has been a beacon of educational excellence for over two decades. We provide a nurturing environment where students can thrive academically, socially, and spiritually.
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

          <InstitutionImageCarousel />
        </div>
      </div>
    </section>
  );
}

function CampusMediaSection() {
  return (
    <section className="py-18 bg-white">
      <div className="max-w-300 mx-auto px-6">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-accent mb-2 block">
              Campus Glimpses
            </span>
            <h2 className="font-serif text-4xl text-brand">
              A Closer Look at Student Life
            </h2>
          </div>
          <p className="max-w-150 text-sm leading-relaxed text-neutral-700">
            Short campus clips showing the atmosphere, facilities, and everyday
            movement inside Hudaibiyya Arabic College.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {campusVideos.map((item) => (
            <article
              key={item.src}
              className="overflow-hidden rounded-md border border-[#E8DFD4] bg-background"
            >
              <div className="relative aspect-[4/5] bg-neutral-100">
                <video
                  src={item.src}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-medium text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
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
      <CampusMediaSection />
      <EventsSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
