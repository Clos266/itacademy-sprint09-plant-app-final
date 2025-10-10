type AppConfigType = {
  name: string;
  github: {
    title: string;
    url: string;
  };
  author: {
    name: string;
    url: string;
  };
};

export const appConfig: AppConfigType = {
  name: import.meta.env.VITE_APP_NAME ?? "PlantApp",
  github: {
    title: "PlantApp",
    url: "https://github.com/Clos266/itacademy-sprint09-plant-app-final",
  },
  author: {
    name: "Clos266",
    url: "https://github.com/Clos266",
  },
};

export const baseUrl = import.meta.env.VITE_BASE_URL ?? "";
