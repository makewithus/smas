"use client";

export default function NoticeTicker({ notices = [] }) {
  if (!notices.length) return null;
  const text = notices.map((n) => n.title || n.content).join("   •   ");
  return (
    <div
      className="overflow-hidden flex items-center gap-3"
      style={{ background: "#1B4332", color: "#FAF6F1", height: "36px" }}
    >
      <span
        className="shrink-0 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-sm"
        style={{ background: "#D39542", color: "#1B4332" }}
      >
        Notices
      </span>
      <div className="overflow-hidden flex-1">
        <span
          className="inline-block whitespace-nowrap text-xs"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
        </span>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
    </div>
  );
}
