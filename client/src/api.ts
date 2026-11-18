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

export function fetchTickets(page = 1, limit = 10): Promise<TicketListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return request<TicketListResponse>(`/api/tickets?${params.toString()}`);
}

export function fetchTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/api/tickets/${id}`);
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
