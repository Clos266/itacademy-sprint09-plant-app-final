export interface User {
  id: string;
  username: string;
  avatar_url?: string;
}

export const mockUsers: User[] = [
  {
    id: "u1",
    username: "flora_lover",
    avatar_url: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "u2",
    username: "green_guru",
    avatar_url: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "u3",
    username: "plant_swapper",
    avatar_url: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "u4",
    username: "suculentas_lover",
    avatar_url: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: "u5",
    username: "leafy_friend",
    avatar_url: "https://i.pravatar.cc/150?img=5",
  },
];
