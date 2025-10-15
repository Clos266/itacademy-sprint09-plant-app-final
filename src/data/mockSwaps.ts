export interface Swap {
  id: number;
  myPlantId: number;
  otherPlantId: number;
  userId: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  date: string; // ISO date string
}

export const mockSwaps: Swap[] = [
  {
    id: 1,
    myPlantId: 1,
    otherPlantId: 6,
    userId: "u1",
    status: "pending",
    date: "2025-10-09",
  },
  {
    id: 2,
    myPlantId: 2,
    otherPlantId: 8,
    userId: "u2",
    status: "accepted",
    date: "2025-10-07",
  },
  {
    id: 3,
    myPlantId: 3,
    otherPlantId: 4,
    userId: "u3",
    status: "completed",
    date: "2025-10-05",
  },
  {
    id: 4,
    myPlantId: 5,
    otherPlantId: 9,
    userId: "u4",
    status: "pending",
    date: "2025-10-08",
  },
  {
    id: 5,
    myPlantId: 7,
    otherPlantId: 10,
    userId: "u5",
    status: "rejected",
    date: "2025-10-03",
  },
  {
    id: 6,
    myPlantId: 1,
    otherPlantId: 2,
    userId: "u2",
    status: "completed",
    date: "2025-09-30",
  },
  {
    id: 7,
    myPlantId: 3,
    otherPlantId: 5,
    userId: "u3",
    status: "accepted",
    date: "2025-10-01",
  },
  {
    id: 8,
    myPlantId: 4,
    otherPlantId: 6,
    userId: "u4",
    status: "pending",
    date: "2025-10-02",
  },
  {
    id: 9,
    myPlantId: 7,
    otherPlantId: 8,
    userId: "u1",
    status: "completed",
    date: "2025-09-29",
  },
  {
    id: 10,
    myPlantId: 9,
    otherPlantId: 10,
    userId: "u5",
    status: "rejected",
    date: "2025-09-28",
  },
];
