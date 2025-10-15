import { useState } from "react";

export function usePagination<T>(items: T[], itemsPerPage = 5) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginated = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  return { page, totalPages, paginated, nextPage, prevPage, goToPage };
}
