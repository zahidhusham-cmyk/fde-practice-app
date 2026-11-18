export type Status = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export type Priority = "low" | "medium" | "high" | "urgent";
export type Category =
  | "access"
  | "hardware"
  | "software"
  | "network"
  | "facilities";

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

export interface TicketListResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
