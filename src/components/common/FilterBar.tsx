import React from "react";

interface FilterBarProps {
  /** Componente de búsqueda, como <SearchInput /> */
  searchComponent?: React.ReactNode;
  /** Filtros adicionales (botones, selects, etc.) */
  filters?: React.ReactNode;
}

/**
 * 🔍 Contenedor reutilizable para barra de búsqueda + filtros.
 * Compatible con tablas, grids o cualquier tipo de listado.
 */
export function FilterBar({ searchComponent, filters }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
      {/* Campo de búsqueda o espacio vacío */}
      <div className="w-full md:w-1/2">{searchComponent}</div>

      {/* Controles de filtro (botones, selects, etc.) */}
      <div className="flex gap-2 md:w-auto flex-wrap justify-end">
        {filters}
      </div>
    </div>
  );
}
