import {
  Files,
  LucideIcon,
  HomeIcon,
  LeafIcon,
  ArrowLeftRight,
  MapPin,
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
    icon: MapPin,
  },
  {
    title: "Swaps",
    url: "/swaps",
    icon: ArrowLeftRight,
  },
  {
    title: "my Plants",
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
      {
        title: "Create Profile",
        url: "/pages/new-profile",
        icon: Files,
      },
    ],
  },
];
