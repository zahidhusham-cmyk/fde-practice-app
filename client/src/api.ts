import type { Agent, Ticket, TicketListResponse } from "./types";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function fetchTickets(page = 1, limit = 10, query = ""): Promise<TicketListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const trimmed = query.trim();
  if (trimmed) params.set("q", trimmed);
  return request<TicketListResponse>(`/api/tickets?${params.toString()}`);
}

export function fetchTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`);
}

export function createTicket(body: {
  title: string;
  description: string;
  priority: Ticket["priority"];
  category: Ticket["category"];
  requester: string;
}): Promise<Ticket> {
  return request<Ticket>("/api/tickets", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function updateTicket(
  id: string,
  body: { status?: Ticket["status"]; assigneeId?: string | null },
): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function fetchAgents(): Promise<Agent[]> {
  return request<{ agents: Agent[] }>("/api/agents").then((data) => data.agents);
}
