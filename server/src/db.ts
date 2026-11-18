import { seedAgents, seedTickets } from "./data/seed";
import type { Agent, Ticket } from "./types";

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
