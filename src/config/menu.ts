import {
  CircleAlert,
  Files,
  Gauge,
  LucideIcon,
  HomeIcon,
  LeafIcon,
  ArrowLeftRight,
} from "lucide-react";

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
    url: "/dashboard",
    icon: Gauge,
  },
  {
    title: "Swaps",
    url: "/swaps",
    icon: ArrowLeftRight,
  },
  {
    title: "Plants",
    url: "/plants",
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
