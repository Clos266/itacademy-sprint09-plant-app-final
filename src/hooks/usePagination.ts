import { useState, useMemo } from "react";

interface UsePaginationOptions {
  /** Número de elementos por página */
  itemsPerPage?: number;
  /** Página inicial */
  initialPage?: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const { itemsPerPage = 5, initialPage = 1 } = options;

  const [page, setPage] = useState(initialPage);

  // Cálculos de paginación
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const validPage = Math.min(Math.max(1, page), totalPages || 1);

  // Datos paginados
  const paginated = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, validPage, itemsPerPage]);

  // Información de paginación para mostrar
  const showingStart =
    items.length > 0 ? (validPage - 1) * itemsPerPage + 1 : 0;
  const showingEnd = Math.min(validPage * itemsPerPage, items.length);

  // Funciones de navegación
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (p: number) => {
    const clampedPage = Math.max(1, Math.min(p, totalPages || 1));
    setPage(clampedPage);
  };

  // Reset de página cuando cambian los datos
  const resetPage = () => setPage(1);

  return {
    page: validPage,
    totalPages,
    paginated,
    showingStart,
    showingEnd,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    setPage: goToPage,
  };
}
