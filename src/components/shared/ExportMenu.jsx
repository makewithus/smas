"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

export default function ExportMenu({
  onExportCSV,
  onExportPDF,
  label = "Export",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-opacity"
        style={{
          border: "1px solid #E8DFD4",
          color: "#3D3227",
          background: "white",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Download size={14} style={{ color: "#1B4332" }} />
        {label}
        <ChevronDown
          size={13}
          style={{
            color: "#8C7B6B",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-40 rounded-md bg-white shadow-lg z-50 py-1"
          style={{ border: "1px solid #E8DFD4" }}
        >
          {onExportCSV && (
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ color: "#3D3227" }}
              onClick={() => {
                onExportCSV();
                setOpen(false);
              }}
            >
              <FileSpreadsheet size={14} style={{ color: "#1B4332" }} /> Export
              CSV
            </button>
          )}
          {onExportPDF && (
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              style={{ color: "#3D3227" }}
              onClick={() => {
                onExportPDF();
                setOpen(false);
              }}
            >
              <FileText size={14} style={{ color: "#1B4332" }} /> Export PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}
