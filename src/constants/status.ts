export const SWAP_STATUSES = {
  NEW: "pending",
  ACCEPTED: "accepted",
  DECLINED: "rejected",
  COMPLETED: "completed",
} as const;

export type SwapStatus = (typeof SWAP_STATUSES)[keyof typeof SWAP_STATUSES];

export const SWAP_STATUS_LIST: readonly SwapStatus[] =
  Object.values(SWAP_STATUSES);

export const SWAP_STATUS_LABELS: Record<SwapStatus, string> = {
  [SWAP_STATUSES.NEW]: "Pending",
  [SWAP_STATUSES.ACCEPTED]: "Accepted",
  [SWAP_STATUSES.DECLINED]: "Declined",
  [SWAP_STATUSES.COMPLETED]: "Completed",
} as const;

export const SWAP_STATUS_FILTERS = ["all", ...SWAP_STATUS_LIST] as const;

export type SwapStatusFilter = (typeof SWAP_STATUS_FILTERS)[number];

export const SWAP_STATUS_TRANSITIONS = {
  [SWAP_STATUSES.NEW]: [SWAP_STATUSES.ACCEPTED, SWAP_STATUSES.DECLINED],
  [SWAP_STATUSES.ACCEPTED]: [SWAP_STATUSES.COMPLETED, SWAP_STATUSES.DECLINED],
  [SWAP_STATUSES.DECLINED]: [],
  [SWAP_STATUSES.COMPLETED]: [],
} as const;

export const SWAP_STATUS_COLORS = {
  [SWAP_STATUSES.NEW]: "bg-yellow-100 text-yellow-800",
  [SWAP_STATUSES.ACCEPTED]: "bg-green-100 text-green-800",
  [SWAP_STATUSES.DECLINED]: "bg-red-100 text-red-800",
  [SWAP_STATUSES.COMPLETED]: "bg-blue-100 text-blue-800",
} as const;
