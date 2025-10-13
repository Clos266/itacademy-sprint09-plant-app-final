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
    title: "Events",
    url: "/events",
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
        title: "Login",
        url: "/pages/login",
        icon: Files,
      },
      {
        title: "Signup",
        url: "/pages/signup",
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
