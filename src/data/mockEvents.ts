export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  user_id: string;
  image_url?: string;
}

export const mockEvents: Event[] = [
  {
    id: 1,
    title: "Plant Swap Swapi Swapi",
    description: "Trae tus esquejes y conoce a otros amantes de las plantas.",
    date: "2025-10-25",
    location: "Parque Central, Barcelona",
    user_id: "u1",
    image_url: "/mockevents/event2.webp",
  },
  {
    id: 2,
    title: "Taller de Macetas Recicladas",
    description:
      "Aprende a crear macetas sostenibles con materiales reutilizados.",
    date: "2025-09-12",
    location: "Casa Verde, Madrid",
    user_id: "u2",
    image_url: "/mockevents/friday-event.jpeg",
  },
  {
    id: 3,
    title: "🌵 Quedada Cactus Lovers",
    description: "Un encuentro para compartir y admirar colecciones de cactus.",
    date: "2025-08-15",
    location: "Jardín Botánico, Valencia",
    user_id: "u3",
    image_url: "/mockevents/tallerdecactus.webp",
  },
  {
    id: 4,
    title: "Intercambio de Semillas",
    description: "Comparte y consigue semillas de distintas especies.",
    date: "2025-11-05",
    location: "Centro Cultural La Tierra, Sevilla",
    user_id: "u4",
    image_url: "/mockevents/event2.webp",
  },
  {
    id: 5,
    title: "Paseo Botánico Guiado",
    description:
      "Un recorrido por el jardín botánico para aprender sobre flora local.",
    date: "2025-12-10",
    location: "Jardín Botánico, Madrid",
    user_id: "u5",
    image_url: "/mockevents/tallerdemacetas.jpeg",
  },
  {
    id: 6,
    title: "Plant Swap Swapi Swapi",
    description:
      "Un evento para intercambiar plantas y aprender sobre jardinería.",
    date: "2025-10-25",
    location: "Parque Central, Barcelona",
    user_id: "u1",
    image_url: "mockevents/tallerdecactus.webp",
  },
  {
    id: 7,
    title: " Taller de Macetas Recicladas",
    description:
      "Aprende a crear macetas sostenibles con materiales reutilizados.",
    date: "2025-09-12",
    location: "Casa Verde, Madrid",
    user_id: "u2",
    image_url: "/mockevents/tallerdemacetas.jpeg",
  },
  {
    id: 8,
    title: "🌵 Quedada Cactus Lovers",
    description: "Un encuentro para compartir y admirar colecciones de cactus.",
    date: "2025-08-15",
    location: "Jardín Botánico, Valencia",
    user_id: "u3",
    image_url: "/mockevents/tallerdecactus.webp",
  },
  {
    id: 9,
    title: "Intercambio de Semillas",
    description: "Comparte y consigue semillas de distintas especies.",
    date: "2025-11-05",
    location: "Centro Cultural La Tierra, Sevilla",
    user_id: "u4",
    image_url: "/mockevents/event2.webp",
  },
];
