import { useState, useMemo } from "react";

interface FilterConfig<T, F = string> {
  /** Función para extraer el texto de búsqueda de un item */
  searchFields: (item: T) => string[];
  /** Función para aplicar filtros específicos */
  filterFn?: (item: T, filterType: F, search: string) => boolean;
  /** Configuración de paginación */
  itemsPerPage?: number;
}

interface UseFilteringOptions<T, F = string> {
  /** Array de items a filtrar */
  data: T[];
  /** Configuración de filtros */
  config: FilterConfig<T, F>;
  /** Valor inicial del filtro */
  initialFilter?: F;
  /** Valor inicial de búsqueda */
  initialSearch?: string;
  /** Página inicial */
  initialPage?: number;
}

export function useFiltering<T, F = string>({
  data,
  config,
  initialFilter = "all" as F,
  initialSearch = "",
  initialPage = 1,
}: UseFilteringOptions<T, F>) {
  const [search, setSearch] = useState(initialSearch);
  const [filterType, setFilterType] = useState<F>(initialFilter);
  const [page, setPage] = useState(initialPage);

  const { searchFields, filterFn, itemsPerPage = 5 } = config;

  // 🔍 Filtrado y búsqueda combinados
  const filtered = useMemo(() => {
    return data.filter((item) => {
      // Búsqueda por texto
      const searchMatch = search
        ? searchFields(item).some((field) =>
            field.toLowerCase().includes(search.toLowerCase())
          )
        : true;

      // Filtro específico (si existe)
      const filterMatch = filterFn ? filterFn(item, filterType, search) : true;

      return searchMatch && filterMatch;
    });
  }, [data, search, filterType, searchFields, filterFn]);

  // 📄 Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const validPage = Math.min(Math.max(1, page), totalPages || 1);

  const paginated = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filtered.slice(start, end);
  }, [filtered, validPage, itemsPerPage]);

  // 📊 Información de paginación
  const showingStart =
    filtered.length > 0 ? (validPage - 1) * itemsPerPage + 1 : 0;
  const showingEnd = Math.min(validPage * itemsPerPage, filtered.length);

  // 🧹 Funciones de control
  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setFilterType(initialFilter);
    setPage(1);
  };

  const updateSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset a página 1 al buscar
  };

  const updateFilter = (newFilter: F) => {
    setFilterType(newFilter);
    setPage(1); // Reset a página 1 al filtrar
  };

  const updatePage = (newPage: number) => {
    const clampedPage = Math.min(Math.max(1, newPage), totalPages || 1);
    setPage(clampedPage);
  };

  return {
    // Estado actual
    search,
    filterType,
    page: validPage,

    // Datos filtrados
    filtered,
    paginated,

    // Información de paginación
    totalPages,
    showingStart,
    showingEnd,

    // Funciones de control
    setSearch: updateSearch,
    setFilterType: updateFilter,
    setPage: updatePage,
    clearSearch,
    resetFilters,
  };
}
