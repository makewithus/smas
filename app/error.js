"use client";

import { useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#FAF6F1" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#F5EFE8" }}
        >
          <AlertCircle size={28} style={{ color: "#1B4332" }} />
        </div>
        <h2 className="text-xl font-medium mb-2" style={{ color: "#3D3227" }}>
          Something went wrong
        </h2>
        <p className="text-sm mb-8" style={{ color: "#8C7B6B" }}>
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-md"
          style={{ background: "#1B4332" }}
        >
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    </div>
  );
}
