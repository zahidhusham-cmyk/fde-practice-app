export const STATUSES = [
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const;

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const CATEGORIES = [
  "access",
  "hardware",
  "software",
  "network",
  "facilities",
] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Category = (typeof CATEGORIES)[number];

export interface Agent {
  id: string;
  name: string;
  email: string;
  team: string;
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  category: Category;
  requester: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}
