export interface Plant {
  id: number;
  nombre_comun: string;
  nombre_cientifico?: string | null;
  especie?: string | null;
  familia?: string | null;
  disponible?: boolean;
  interval_days?: number;
  last_watered?: string;
  image_url?: string;
}

export const mockPlants: Plant[] = [
  {
    id: 1,
    nombre_comun: "Aloe Vera",
    nombre_cientifico: "Aloe barbadensis",
    especie: "Aloe",
    familia: "Asphodelaceae",
    disponible: true,
    interval_days: 7,
    last_watered: "2025-10-08",
    image_url:
      "https://cdn.shopify.com/s/files/1/0691/8363/5772/files/610a35cdac0dc0202a479bc93fcb9f96_1_600x600.jpg?v=1732798850",
  },
  {
    id: 2,
    nombre_comun: "Cactus San Pedro",
    nombre_cientifico: "Echinopsis pachanoi",
    especie: "Echinopsis",
    familia: "Cactaceae",
    disponible: false,
    interval_days: 14,
    last_watered: "2025-10-04",
    image_url:
      "https://www.aprilplants.com/cdn/shop/files/minicactus_cocoblanca_1024x.jpg?v=1729516684",
  },
  {
    id: 3,
    nombre_comun: "Lengua de suegra",
    nombre_cientifico: "Sansevieria trifasciata",
    especie: "Sansevieria",
    familia: "Asparagaceae",
    disponible: true,
    interval_days: 10,
    last_watered: "2025-10-06",
    image_url:
      "https://www.hola.com/horizon/landscape/c060cf5a048c-adobestock267651211.jpg?im=Resize=(960),type=downsize",
  },
  {
    id: 4,
    nombre_comun: "Monstera deliciosa",
    nombre_cientifico: "Monstera deliciosa",
    especie: "Monstera",
    familia: "Araceae",
    disponible: true,
    interval_days: 5,
    last_watered: "2025-10-09",
    image_url:
      "https://florastore.com/cdn/shop/files/3512101-POKON_Productimage_02_SQ.jpg?v=1751965853&width=1800",
  },
  {
    id: 5,
    nombre_comun: "Suculenta Echeveria",
    nombre_cientifico: "Echeveria elegans",
    especie: "Echeveria",
    familia: "Crassulaceae",
    disponible: false,
    interval_days: 12,
    last_watered: "2025-10-02",
    image_url:
      "https://i0.wp.com/www.sucupop.com/wp-content/uploads/2023/03/Echeveria-azulita-805-01-scaled.jpg?fit=2560%2C2560&ssl=1",
  },
  {
    id: 6,
    nombre_comun: "Poto",
    nombre_cientifico: "Epipremnum aureum",
    especie: "Epipremnum",
    familia: "Araceae",
    disponible: true,
    interval_days: 4,
    last_watered: "2025-10-09",
    image_url:
      "https://abeautifulmess.com/wp-content/uploads/2023/06/GoldenPothos-1.jpg",
  },
  {
    id: 7,
    nombre_comun: "Cinta",
    nombre_cientifico: "Chlorophytum comosum",
    especie: "Chlorophytum",
    familia: "Asparagaceae",
    disponible: true,
    interval_days: 5,
    last_watered: "2025-10-07",
    image_url:
      "https://simplegardenlife.com/wp-content/uploads/2023/11/spider-plant-easy-care-1080x1080.jpg.webp",
  },
  {
    id: 8,
    nombre_comun: "Ficus Lyrata",
    nombre_cientifico: "Ficus lyrata",
    especie: "Ficus",
    familia: "Moraceae",
    disponible: false,
    interval_days: 6,
    last_watered: "2025-10-05",
    image_url:
      "https://ornameplant.com/wp-content/uploads/2022/12/Ficus-Lyrata-Multitronco-c19.jpg",
  },
  {
    id: 9,
    nombre_comun: "Helecho Boston",
    nombre_cientifico: "Nephrolepis exaltata",
    especie: "Nephrolepis",
    familia: "Nephrolepidaceae",
    disponible: true,
    interval_days: 3,
    last_watered: "2025-10-09",
    image_url:
      "https://ornameplant.com/wp-content/uploads/2022/12/Ficus-Lyrata-Multitronco-c19.jpg",
  },
  {
    id: 10,
    nombre_comun: "Palmera Areca",
    nombre_cientifico: "Dypsis lutescens",
    especie: "Dypsis",
    familia: "Arecaceae",
    disponible: true,
    interval_days: 6,
    last_watered: "2025-10-08",
    image_url:
      "https://ornameplant.com/wp-content/uploads/2022/12/Ficus-Lyrata-Multitronco-c19.jpg",
  },
  {
    id: 11,
    nombre_comun: "Cactus orejas de conejo",
    nombre_cientifico: "Opuntia microdasys",
    especie: "Opuntia",
    familia: "Cactaceae",
    disponible: true,
    interval_days: 15,
    last_watered: "2025-10-01",
    image_url:
      "https://ornameplant.com/wp-content/uploads/2022/12/Ficus-Lyrata-Multitronco-c19.jpg",
  },
  {
    id: 12,
    nombre_comun: "Lirio de la paz",
    nombre_cientifico: "Spathiphyllum wallisii",
    especie: "Spathiphyllum",
    familia: "Araceae",
    disponible: false,
    interval_days: 4,
    last_watered: "2025-10-03",
    image_url:
      "https://ornameplant.com/wp-content/uploads/2022/12/Ficus-Lyrata-Multitronco-c19.jpg",
  },
  {
    id: 13,
    nombre_comun: "Hiedra inglesa",
    nombre_cientifico: "Hedera helix",
    especie: "Hedera",
    familia: "Araliaceae",
    disponible: true,
    interval_days: 6,
    last_watered: "2025-10-09",
    image_url:
      "https://cdn.shopify.com/s/files/1/0691/8363/5772/files/610a35cdac0dc0202a479bc93fcb9f96_1_600x600.jpg?v=1732798850",
  },
  {
    id: 14,
    nombre_comun: "Jade",
    nombre_cientifico: "Crassula ovata",
    especie: "Crassula",
    familia: "Crassulaceae",
    disponible: true,
    interval_days: 10,
    last_watered: "2025-10-07",
    image_url:
      "https://ornameplant.com/wp-content/uploads/2022/12/Ficus-Lyrata-Multitronco-c19.jpg",
  },
  {
    id: 15,
    nombre_comun: "Maranta",
    nombre_cientifico: "Maranta leuconeura",
    especie: "Maranta",
    familia: "Marantaceae",
    disponible: false,
    interval_days: 5,
    last_watered: "2025-10-04",
    image_url:
      "https://cdn.shopify.com/s/files/1/0691/8363/5772/files/610a35cdac0dc0202a479bc93fcb9f96_1_600x600.jpg?v=1732798850",
  },
];
