import {
  LucideIcon,
  Compass,
  LeafIcon,
  ArrowLeftRight,
  Earth,
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
    title: "Browse Plants",
    url: "/",
    icon: Compass,
  },

  {
    title: "Community",
    url: "/events",
    icon: Earth,
  },
  {
    title: "Swaps",
    url: "/swaps",
    icon: ArrowLeftRight,
  },
  {
    title: "Herbarium",
    url: "/plants",
    icon: LeafIcon,
  },
];
