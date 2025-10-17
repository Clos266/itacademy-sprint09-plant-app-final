// src/data/plantSuggestions.ts

export interface PlantSuggestion {
  nombre_cientifico: string;
  familia: string;
  especie: string;
  categoria?: string;
}

export const plantSuggestions: Record<string, PlantSuggestion> = {
  monstera: {
    nombre_cientifico: "Monstera deliciosa",
    familia: "Araceae",
    especie: "Monstera",
    categoria: "Tropical",
  },
  pothos: {
    nombre_cientifico: "Epipremnum aureum",
    familia: "Araceae",
    especie: "Epipremnum",
    categoria: "Trepadora",
  },
  ficus: {
    nombre_cientifico: "Ficus elastica",
    familia: "Moraceae",
    especie: "Ficus",
    categoria: "Interior",
  },
  ficus_lyrata: {
    nombre_cientifico: "Ficus lyrata",
    familia: "Moraceae",
    especie: "Ficus",
    categoria: "Interior",
  },
  sansevieria: {
    nombre_cientifico: "Sansevieria trifasciata",
    familia: "Asparagaceae",
    especie: "Sansevieria",
    categoria: "Interior / resistente",
  },
  zamioculca: {
    nombre_cientifico: "Zamioculcas zamiifolia",
    familia: "Araceae",
    especie: "Zamioculcas",
    categoria: "Interior / baja luz",
  },
  calathea: {
    nombre_cientifico: "Calathea orbifolia",
    familia: "Marantaceae",
    especie: "Calathea",
    categoria: "Interior / hoja decorativa",
  },
  alocasia: {
    nombre_cientifico: "Alocasia macrorrhiza",
    familia: "Araceae",
    especie: "Alocasia",
    categoria: "Tropical",
  },
  dracaena: {
    nombre_cientifico: "Dracaena fragrans",
    familia: "Asparagaceae",
    especie: "Dracaena",
    categoria: "Interior",
  },
  aloe: {
    nombre_cientifico: "Aloe vera",
    familia: "Asphodelaceae",
    especie: "Aloe",
    categoria: "Suculenta",
  },
  cactus: {
    nombre_cientifico: "Cactaceae",
    familia: "Cactaceae",
    especie: "Cactus",
    categoria: "Suculenta",
  },
  echeveria: {
    nombre_cientifico: "Echeveria elegans",
    familia: "Crassulaceae",
    especie: "Echeveria",
    categoria: "Suculenta",
  },
  crassula: {
    nombre_cientifico: "Crassula ovata",
    familia: "Crassulaceae",
    especie: "Crassula",
    categoria: "Suculenta",
  },
  peperomia: {
    nombre_cientifico: "Peperomia obtusifolia",
    familia: "Piperaceae",
    especie: "Peperomia",
    categoria: "Interior / compacta",
  },
  pothos_neon: {
    nombre_cientifico: "Epipremnum aureum 'Neon'",
    familia: "Araceae",
    especie: "Epipremnum",
    categoria: "Trepadora variegada",
  },
  philodendron: {
    nombre_cientifico: "Philodendron hederaceum",
    familia: "Araceae",
    especie: "Philodendron",
    categoria: "Interior / trepadora",
  },
  monstera_adansonii: {
    nombre_cientifico: "Monstera adansonii",
    familia: "Araceae",
    especie: "Monstera",
    categoria: "Interior / hojas perforadas",
  },
  spathiphyllum: {
    nombre_cientifico: "Spathiphyllum wallisii",
    familia: "Araceae",
    especie: "Spathiphyllum",
    categoria: "Interior / flor",
  },
  hermaphrodita: {
    nombre_cientifico: "Tradescantia zebrina",
    familia: "Commelinaceae",
    especie: "Tradescantia",
    categoria: "Colgante",
  },
  zebra_plant: {
    nombre_cientifico: "Aphelandra squarrosa",
    familia: "Acanthaceae",
    especie: "Aphelandra",
    categoria: "Interior / flor",
  },
  begonia: {
    nombre_cientifico: "Begonia rex",
    familia: "Begoniaceae",
    especie: "Begonia",
    categoria: "Interior / hojas decorativas",
  },
  ficus_benjamina: {
    nombre_cientifico: "Ficus benjamina",
    familia: "Moraceae",
    especie: "Ficus",
    categoria: "Interior / árbol",
  },
  monstera_obliqua: {
    nombre_cientifico: "Monstera obliqua",
    familia: "Araceae",
    especie: "Monstera",
    categoria: "Exótica",
  },
  hoya: {
    nombre_cientifico: "Hoya carnosa",
    familia: "Apocynaceae",
    especie: "Hoya",
    categoria: "Colgante / trepadora",
  },
  ficus_microcarpa: {
    nombre_cientifico: "Ficus microcarpa",
    familia: "Moraceae",
    especie: "Ficus",
    categoria: "Interior / bonsái",
  },
  aspidistra: {
    nombre_cientifico: "Aspidistra elatior",
    familia: "Asparagaceae",
    especie: "Aspidistra",
    categoria: "Sombras profundas",
  },
  peperomia_unifolia: {
    nombre_cientifico: "Peperomia prostrata",
    familia: "Piperaceae",
    especie: "Peperomia",
    categoria: "Colgante / compacto",
  },
  ficus_microcarpa_ginseng: {
    nombre_cientifico: "Ficus microcarpa 'Ginseng'",
    familia: "Moraceae",
    especie: "Ficus",
    categoria: "Interior / bonsái",
  },
  schefflera: {
    nombre_cientifico: "Schefflera arboricola",
    familia: "Araliaceae",
    especie: "Schefflera",
    categoria: "Interior / arbusto",
  },
  zz: {
    nombre_cientifico: "Zamioculcas zamiifolia",
    familia: "Araceae",
    especie: "Zamioculcas",
    categoria: "Interior / resistente",
  },
  philodendron_birkin: {
    nombre_cientifico: "Philodendron Birkin",
    familia: "Araceae",
    especie: "Philodendron",
    categoria: "Interior / hoja variegada",
  },
  monstera_borbonica: {
    nombre_cientifico: "Monstera deliciosa var. albo",
    familia: "Araceae",
    especie: "Monstera",
    categoria: "Interior / hoja variegada",
  },
  dracaena_marginata: {
    nombre_cientifico: "Dracaena marginata",
    familia: "Asparagaceae",
    especie: "Dracaena",
    categoria: "Interior / ornamental",
  },
  aglaonema: {
    nombre_cientifico: "Aglaonema commutatum",
    familia: "Araceae",
    especie: "Aglaonema",
    categoria: "Interior / hojas decorativas",
  },
  ficus_rubiginosa: {
    nombre_cientifico: "Ficus rubiginosa",
    familia: "Moraceae",
    especie: "Ficus",
    categoria: "Interior / bonsái",
  },
};
