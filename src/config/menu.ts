import {
  CircleAlert,
  Files,
  Gauge,
  LucideIcon,
  HomeIcon,
  LeafIcon,
} from "lucide-react";
import { homedir } from "os";

type MenuItemType = {
  title: string;
  url: string;
  external?: string;
  icon?: LucideIcon;
  items?: MenuItemType[];
};
type MenuType = MenuItemType[];

export const mainMenu: MenuType = [
  {
    title: "Home",
    url: "/",
    icon: HomeIcon,
  },
  {
    title: "Dashboard",
    url: "/",
    icon: Gauge,
  },
  {
    title: "Plants",
    url: "/pages/feature",
    icon: LeafIcon,
  },

  {
    title: "Pages",
    url: "/pages",
    icon: Files,
    items: [
      {
        title: "Sample Page",
        url: "/pages/sample",
        icon: Files,
      },
    ],
  },
  {
    title: "Error",
    url: "/404",
    icon: CircleAlert,
  },
];
