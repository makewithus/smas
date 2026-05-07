"use client";

import {
  UserPlus,
  Receipt,
  FileText,
  Calendar,
  Megaphone,
  Wallet,
} from "lucide-react";

const ICONS = {
  student: UserPlus,
  receipt: Receipt,
  notice: Megaphone,
  event: Calendar,
  expense: Wallet,
  default: FileText,
};

function timeAgo(date) {
  if (!date) return "";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityFeed({ activities = [], maxItems = 10 }) {
  const items = activities.slice(0, maxItems);

  if (!items.length) {
    return (
      <p className="text-sm text-center py-6" style={{ color: "#8C7B6B" }}>
        No recent activity
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((a, i) => {
        const Icon = ICONS[a.type] || ICONS.default;
        return (
          <div
            key={a.id || i}
            className="flex items-start gap-3 py-2"
            style={{ borderBottom: "1px solid #E8DFD4" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "#F5EFE8" }}
            >
              <Icon size={14} style={{ color: "#1B4332" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: "#3D3227" }}>
                {a.message || a.description || "Activity logged"}
              </p>
              {a.meta && (
                <p className="text-xs mt-0.5" style={{ color: "#8C7B6B" }}>
                  {a.meta}
                </p>
              )}
            </div>
            <span className="text-xs shrink-0" style={{ color: "#8C7B6B" }}>
              {timeAgo(a.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
