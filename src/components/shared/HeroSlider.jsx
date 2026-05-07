"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: "Welcome to Our Institution",
    subtitle: "Excellence in Education Since 1995",
    bg: "#1B4332",
  },
  {
    id: 2,
    title: "Student Administration",
    subtitle: "Managing academics with care and precision",
    bg: "#3D3227",
  },
  {
    id: 3,
    title: "Building Tomorrow's Leaders",
    subtitle: "Holistic development for every student",
    bg: "#D39542",
  },
];

export default function HeroSlider({
  slides = DEFAULT_SLIDES,
  autoplayDelay = 5000,
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      autoplayDelay,
    );
    return () => clearInterval(timer);
  }, [slides.length, autoplayDelay]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  const slide = slides[current];

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        height: "400px",
        background: slide?.bg || "#1B4332",
        transition: "background 0.5s ease",
      }}
    >
      {slide?.image && (
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8 text-center">
        <h2
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: "Newsreader, serif" }}
        >
          {slide?.title}
        </h2>
        {slide?.subtitle && (
          <p className="text-lg opacity-80 max-w-xl">{slide.subtitle}</p>
        )}
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
        style={{ background: "rgba(255,255,255,0.2)" }}
      >
        <ChevronLeft size={20} color="white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
        style={{ background: "rgba(255,255,255,0.2)" }}
      >
        <ChevronRight size={20} color="white" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: i === current ? "#D39542" : "rgba(255,255,255,0.5)",
              width: i === current ? "20px" : "8px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
