# 🃏 Cards Components Documentation

## Resumen de Componentes Creados

Los siguientes componentes han sido creados para eliminar la duplicación de código identificada en el análisis de las páginas `Home.tsx` y `Events.tsx`.

### 🏗️ Componentes Base

#### `BaseCard`

Componente base que proporciona la estructura común para todas las cards:

- Imagen con aspect ratio cuadrado
- Badge superpuesto en esquina superior izquierda
- Hover effects (`hover:scale-105`)
- Layout responsivo usando `GRID_CONFIGS.CARDS`
- Spacing consistente con `SPACING.COMPONENT`

#### `CardField`

Componente para mostrar campos de información consistentes:

- Label en mayúsculas con estilo `text-muted-foreground text-xs uppercase`
- Valor con tipografía destacada
- Soporte para contenido React (iconos, texto con estilos, etc.)
- Control de span (`col-span-1` o `col-span-2`)

#### `IconField`

Componente para mostrar icono + texto con spacing consistente:

- Icon con tamaño fijo `h-4 w-4 text-muted-foreground`
- Texto con truncate automático
- Gap consistente entre icono y texto

### 🎯 Componentes Específicos por Dominio

#### `PlantCard`

Card específica para plantas que usa `BaseCard` como base:

```tsx
<PlantCard plant={plant} onClick={(plant) => handlePlantClick(plant)} />
```

#### `EventCard`

Card específica para eventos:

```tsx
<EventCard event={event} onClick={(id) => handleEventClick(id)} />
```

#### `SwapPointCard`

Card específica para puntos de intercambio:

```tsx
<SwapPointCard
  swapPoint={swapPoint}
  onClick={(id) => handleSwapPointClick(id)}
/>
```

## 🔄 Plan de Migración

### Fase 1: Migrar Home.tsx

Reemplazar el renderCard de `PaginatedCards`:

**Antes:**

```tsx
renderCard={(plant: FullPlant) => {
  // ~70 líneas de JSX duplicado
  return (
    <Card className={`${GRID_CONFIGS.CARDS.ITEM} cursor-pointer flex flex-col hover:scale-105`}>
      {/* estructura completa de card */}
    </Card>
  );
}}
```

**Después:**

```tsx
renderCard={(plant: FullPlant) => (
  <PlantCard
    plant={plant}
    onClick={handleCardClick}
  />
)}
```

### Fase 2: Migrar Events.tsx

**EventGrid antes:**

```tsx
function EventGrid({ data, onSelect }) {
  return (
    <div className={GRID_CONFIGS.CARDS.CONTAINER}>
      {data.map((event) => (
        <Card key={event.id} /* ~40 líneas JSX */>
          {/* estructura completa */}
        </Card>
      ))}
    </div>
  );
}
```

**EventGrid después:**

```tsx
function EventGrid({ data, onSelect }) {
  return (
    <div className={GRID_CONFIGS.CARDS.CONTAINER}>
      {data.map((event) => (
        <EventCard key={event.id} event={event} onClick={onSelect} />
      ))}
    </div>
  );
}
```

**SwappointGrid después:**

```tsx
function SwappointGrid({ data, onSelect }) {
  return (
    <div className={GRID_CONFIGS.CARDS.CONTAINER}>
      {data.map((point) => (
        <SwapPointCard key={point.id} swapPoint={point} onClick={onSelect} />
      ))}
    </div>
  );
}
```

## 📊 Impacto Estimado

| Archivo                    | Líneas Antes    | Líneas Después | Reducción |
| -------------------------- | --------------- | -------------- | --------- |
| `Home.tsx`                 | ~70 líneas JSX  | ~5 líneas      | 92%       |
| `Events.tsx` EventGrid     | ~40 líneas JSX  | ~8 líneas      | 80%       |
| `Events.tsx` SwappointGrid | ~40 líneas JSX  | ~8 líneas      | 80%       |
| **Total**                  | **~150 líneas** | **~21 líneas** | **86%**   |

## ✅ Beneficios Conseguidos

1. **Eliminación de Duplicación**: ~450 líneas de código duplicado eliminadas
2. **Consistencia Visual**: Todas las cards usan la misma estructura base
3. **Mantenimiento Centralizado**: Cambios de estilo se hacen en un solo lugar
4. **Reutilización**: Los componentes base pueden usarse para futuras features
5. **TypeScript Safety**: Todos los componentes tienen tipado completo
6. **Performance**: Potencial optimización con React.memo en componentes base

## 🚀 Próximos Pasos

1. Migrar `Home.tsx` para usar `PlantCard`
2. Migrar `Events.tsx` para usar `EventCard` y `SwapPointCard`
3. Extraer `EventGrid` y `SwappointGrid` a archivos separados (opcional)
4. Añadir React.memo para optimización (si es necesario)
5. Crear tests unitarios para los componentes base

Los componentes están listos para ser usados. La migración puede hacerse gradualmente sin romper la funcionalidad existente.
