export interface PlantSuggestion {
  nombre_cientifico: string;
  familia: string;
  especie: string;
}

export const plantSuggestions: Record<string, PlantSuggestion> = {
  // 🌿 Plantas comunes de interior
  monstera: {
    nombre_cientifico: "Monstera deliciosa",
    familia: "Araceae",
    especie: "Monstera",
  },
  pothos: {
    nombre_cientifico: "Epipremnum aureum",
    familia: "Araceae",
    especie: "Epipremnum",
  },
  ficus: {
    nombre_cientifico: "Ficus elastica",
    familia: "Moraceae",
    especie: "Ficus",
  },
  sansevieria: {
    nombre_cientifico: "Sansevieria trifasciata",
    familia: "Asparagaceae",
    especie: "Sansevieria",
  },
  zamioculca: {
    nombre_cientifico: "Zamioculcas zamiifolia",
    familia: "Araceae",
    especie: "Zamioculcas",
  },
  dracaena: {
    nombre_cientifico: "Dracaena fragrans",
    familia: "Asparagaceae",
    especie: "Dracaena",
  },
  calathea: {
    nombre_cientifico: "Calathea orbifolia",
    familia: "Marantaceae",
    especie: "Calathea",
  },
  philodendron: {
    nombre_cientifico: "Philodendron hederaceum",
    familia: "Araceae",
    especie: "Philodendron",
  },
  spathiphyllum: {
    nombre_cientifico: "Spathiphyllum wallisii",
    familia: "Araceae",
    especie: "Spathiphyllum",
  },

  // 🌸 Flores
  rosa: {
    nombre_cientifico: "Rosa spp.",
    familia: "Rosaceae",
    especie: "Rosa",
  },
  geranio: {
    nombre_cientifico: "Pelargonium hortorum",
    familia: "Geraniaceae",
    especie: "Pelargonium",
  },
  lavanda: {
    nombre_cientifico: "Lavandula angustifolia",
    familia: "Lamiaceae",
    especie: "Lavandula",
  },
  margarita: {
    nombre_cientifico: "Bellis perennis",
    familia: "Asteraceae",
    especie: "Bellis",
  },
  jazmin: {
    nombre_cientifico: "Jasminum officinale",
    familia: "Oleaceae",
    especie: "Jasminum",
  },
  hortensia: {
    nombre_cientifico: "Hydrangea macrophylla",
    familia: "Hydrangeaceae",
    especie: "Hydrangea",
  },
  violeta: {
    nombre_cientifico: "Viola odorata",
    familia: "Violaceae",
    especie: "Viola",
  },

  // 🌵 Cactus y suculentas
  cactus: {
    nombre_cientifico: "Cactaceae",
    familia: "Cactaceae",
    especie: "Cactus",
  },
  aloe: {
    nombre_cientifico: "Aloe vera",
    familia: "Asphodelaceae",
    especie: "Aloe",
  },
  echeveria: {
    nombre_cientifico: "Echeveria elegans",
    familia: "Crassulaceae",
    especie: "Echeveria",
  },
  crassula: {
    nombre_cientifico: "Crassula ovata",
    familia: "Crassulaceae",
    especie: "Crassula",
  },
  haworthia: {
    nombre_cientifico: "Haworthia fasciata",
    familia: "Asphodelaceae",
    especie: "Haworthia",
  },
  sedum: {
    nombre_cientifico: "Sedum morganianum",
    familia: "Crassulaceae",
    especie: "Sedum",
  },
  opuntia: {
    nombre_cientifico: "Opuntia microdasys",
    familia: "Cactaceae",
    especie: "Opuntia",
  },
  mammillaria: {
    nombre_cientifico: "Mammillaria spinosissima",
    familia: "Cactaceae",
    especie: "Mammillaria",
  },

  // 🪴 Plantas comunes caseras
  albahaca: {
    nombre_cientifico: "Ocimum basilicum",
    familia: "Lamiaceae",
    especie: "Ocimum",
  },
  menta: {
    nombre_cientifico: "Mentha spicata",
    familia: "Lamiaceae",
    especie: "Mentha",
  },
  romero: {
    nombre_cientifico: "Rosmarinus officinalis",
    familia: "Lamiaceae",
    especie: "Rosmarinus",
  },
  perejil: {
    nombre_cientifico: "Petroselinum crispum",
    familia: "Apiaceae",
    especie: "Petroselinum",
  },
  cilantro: {
    nombre_cientifico: "Coriandrum sativum",
    familia: "Apiaceae",
    especie: "Coriandrum",
  },
  hierbabuena: {
    nombre_cientifico: "Mentha piperita",
    familia: "Lamiaceae",
    especie: "Mentha",
  },
  tomillo: {
    nombre_cientifico: "Thymus vulgaris",
    familia: "Lamiaceae",
    especie: "Thymus",
  },
};
