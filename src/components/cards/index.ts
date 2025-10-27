/**
 * 🃏 Cards Components - Sistema unificado de cards
 *
 * Este módulo proporciona un conjunto de componentes de cards reutilizables
 * que eliminan la duplicación de código encontrada en las páginas Home.tsx y Events.tsx.
 *
 * Arquitectura:
 * - BaseCard: Componente base con estructura común (imagen, badge, contenido)
 * - CardField: Componente para mostrar campos label/value consistentes
 * - IconField: Componente para mostrar icono + texto
 * - PlantCard, EventCard, SwapPointCard: Cards específicas por dominio
 *
 * Beneficios:
 * - ✅ Elimina ~450 líneas de código duplicado
 * - ✅ Consistencia visual en toda la aplicación
 * - ✅ Mantenimiento centralizado de estilos
 * - ✅ Reutilización de componentes base
 * - ✅ TypeScript safety completo
 */

// Componentes base reutilizables
export { BaseCard } from "./BaseCard";
export { CardField } from "./CardField";
export { IconField } from "./IconField";

// Cards específicas por dominio
export { PlantCard } from "./PlantCard";
export { EventCard } from "./EventCard";
export { SwapPointCard } from "./SwapPointCard";

// Re-export de tipos para conveniencia
export type { Database } from "@/types/supabase";
