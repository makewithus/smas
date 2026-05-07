"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Supports two APIs:
 *   Simple: <Pagination currentPage={n} totalPages={n} onPageChange={fn} />
 *   Full:   <Pagination page={n} total={n} pageSize={n} onPageChange={fn} />
 */
export default function Pagination({
  currentPage,
  totalPages: totalPagesProp,
  onPageChange,
  total,
  page,
  pageSize,
}) {
  const _page = currentPage ?? page ?? 1;
  const _totalPages =
    totalPagesProp ??
    (total != null && pageSize ? Math.ceil(total / pageSize) : 1);

  const getPageNumbers = () => {
    const pages = [];
    if (_totalPages <= 7) {
      for (let i = 1; i <= _totalPages; i++) pages.push(i);
    } else if (_page <= 3) {
      pages.push(1, 2, 3, 4, "...", _totalPages);
    } else if (_page >= _totalPages - 2) {
      pages.push(
        1,
        "...",
        _totalPages - 3,
        _totalPages - 2,
        _totalPages - 1,
        _totalPages,
      );
    } else {
      pages.push(1, "...", _page - 1, _page, _page + 1, "...", _totalPages);
    }
    return pages;
  };

  if (_totalPages <= 1) return null;

  const btnBase =
    "min-w-[32px] h-8 px-2 text-sm rounded-md border transition-colors";

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {total != null ? (
        <p className="text-xs" style={{ color: "#8C7B6B" }}>
          Showing{" "}
          <span style={{ color: "#3D3227", fontWeight: 500 }}>
            {(_page - 1) * (pageSize || 10) + 1}
            {"–"}
            {Math.min(_page * (pageSize || 10), total)}
          </span>{" "}
          of <span style={{ color: "#3D3227", fontWeight: 500 }}>{total}</span>
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(_page - 1)}
          disabled={_page === 1}
          className="p-1.5 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
        >
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers().map((pageNum, idx) =>
          pageNum === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1 text-sm"
              style={{ color: "#8C7B6B" }}
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={btnBase}
              style={
                _page === pageNum
                  ? {
                      background: "#1B4332",
                      color: "white",
                      borderColor: "#1B4332",
                    }
                  : { borderColor: "#E8DFD4", color: "#3D3227" }
              }
            >
              {pageNum}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(_page + 1)}
          disabled={_page === _totalPages}
          className="p-1.5 rounded-md border disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: "#E8DFD4", color: "#3D3227" }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
