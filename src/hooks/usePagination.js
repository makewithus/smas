import { useState, useCallback } from "react";

export function usePagination({ initialPage = 1, initialPageSize = 10 } = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const resetPage = useCallback(() => setPage(1), []);

  const changePageSize = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const paginate = useCallback(
    (items) => {
      const start = (page - 1) * pageSize;
      return items.slice(start, start + pageSize);
    },
    [page, pageSize],
  );

  return {
    page,
    pageSize,
    setPage,
    setPageSize: changePageSize,
    resetPage,
    paginate,
  };
}
