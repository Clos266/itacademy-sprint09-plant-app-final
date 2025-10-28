export const FilteringPresets = {
  plants: {
    searchFields: ["nombre_comun", "nombre_cientifico", "especie"],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {
      availability: (plant: any, value: string) => {
        if (value === "available") return plant.disponible;
        if (value === "unavailable") return !plant.disponible;
        return true; // "all"
      },
    },
  },

  events: {
    searchFields: ["title", "location"],
    dateField: "date",
    defaultSort: { field: "date", direction: "desc" as const },
    customFilters: {
      upcoming: (event: any, _value: any) => new Date(event.date) > new Date(),
      past: (event: any, _value: any) => new Date(event.date) <= new Date(),
    },
  },

  swaps: {
    searchFields: [
      "receiver.username",
      "senderPlant.nombre_comun",
      "receiverPlant.nombre_comun",
    ],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {
      multiStatus: (swap: any, statusArray: string[]) => {
        if (statusArray.length === 0) return true;
        return statusArray.includes(swap.status);
      },
    },
  },

  swapPoints: {
    searchFields: ["name", "description", "address", "city"],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {},
  },

  users: {
    searchFields: ["username", "ciudad", "email"],
    defaultSort: { field: "created_at", direction: "desc" as const },
    customFilters: {
      active: (user: any, _value: any) =>
        user.last_seen &&
        new Date(user.last_seen) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  },
} as const;

export type FilteringPresetName = keyof typeof FilteringPresets;

export type FilteringPresetConfig<T extends FilteringPresetName> =
  (typeof FilteringPresets)[T];
