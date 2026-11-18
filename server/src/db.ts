import { seedAgents, seedTickets } from "./data/seed";
import type { Agent, Category, Priority, Ticket } from "./types";

let tickets: Ticket[] = [];
let agents: Agent[] = [];

export function resetDb() {
  tickets = structuredClone(seedTickets);
  agents = structuredClone(seedAgents);
}

resetDb();

export function listTickets(): Ticket[] {
  return tickets;
}

export function getTicketById(id: string): Ticket | undefined {
  return tickets.find((ticket) => ticket.id === id);
}

export function getAgents(): Agent[] {
  return agents;
}

export function getAgentById(id: string): Agent | undefined {
  return agents.find((agent) => agent.id === id);
}

export function createTicket(input: {
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  requester: string;
}): Ticket {
  const nextNumber = tickets.reduce((max, ticket) => {
    const match = /^TCK-(\d+)$/.exec(ticket.id);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 1000);
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: `TCK-${nextNumber + 1}`,
    title: input.title,
    description: input.description,
    status: "open",
    priority: input.priority,
    category: input.category,
    requester: input.requester,
    assigneeId: null,
    createdAt: now,
    updatedAt: now,
    comments: [],
  };
  tickets.push(ticket);
  return ticket;
}

export function updateTicket(
  id: string,
  patch: Partial<Pick<Ticket, "status" | "assigneeId">>,
): Ticket | undefined {
  const ticket = getTicketById(id);
  if (!ticket) return undefined;

  if (patch.status !== undefined) {
    ticket.status = patch.status;
  }
  if (patch.assigneeId !== undefined) {
    ticket.assigneeId = patch.assigneeId;
  }
  ticket.updatedAt = new Date().toISOString();
  return ticket;
}
