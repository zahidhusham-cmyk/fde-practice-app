import { Router } from "express";
import {
  createTicket,
  getAgentById,
  getTicketById,
  listTickets,
  updateTicket,
} from "../db";
import {
  CATEGORIES,
  PRIORITIES,
  STATUSES,
  type Category,
  type Priority,
  type Status,
  type Ticket,
} from "../types";

export const ticketsRouter = Router();

function parsePage(value: unknown): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

function parseLimit(value: unknown): number {
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1) return 10;
  return Math.min(limit, 50);
}

function parseQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function requiredText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && PRIORITIES.includes(value as Priority);
}

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.includes(value as Category);
}

function matchesQuery(ticket: Ticket, query: string): boolean {
  return [ticket.id, ticket.title, ticket.description, ticket.requester].some((field) =>
    field.toLowerCase().includes(query),
  );
}

ticketsRouter.get("/", (req, res) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit);
  const query = parseQuery(req.query.q);
  const matched = listTickets().filter((ticket) => query === "" || matchesQuery(ticket, query));
  const offset = (page - 1) * limit;
  const tickets = matched.slice(offset, offset + limit);

  res.json({
    tickets,
    pagination: {
      page,
      limit,
      total: matched.length,
      totalPages: Math.max(1, Math.ceil(matched.length / limit)),
    },
  });
});

ticketsRouter.put("/", (req, res) => {
  const title = requiredText(req.body?.title);
  const description = requiredText(req.body?.description);
  const requester = requiredText(req.body?.requester);
  const { priority, category } = req.body ?? {};

  if (!title || !description || !requester) {
    res.status(400).json({
      error: "title, description, and requester are required",
    });
    return;
  }

  if (!isPriority(priority)) {
    res.status(400).json({
      error: `priority must be one of: ${PRIORITIES.join(", ")}`,
    });
    return;
  }

  if (!isCategory(category)) {
    res.status(400).json({
      error: `category must be one of: ${CATEGORIES.join(", ")}`,
    });
    return;
  }

  const ticket = createTicket({ title, description, requester, priority, category });
  res.status(201).json(ticket);
});

ticketsRouter.get("/:id", (req, res) => {
  const ticket = getTicketById(req.params.id);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }
  res.json(ticket);
});

ticketsRouter.patch("/:id", (req, res) => {
  const ticket = getTicketById(req.params.id);
  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  const { status, assigneeId } = req.body ?? {};

  if (status === undefined && assigneeId === undefined) {
    res.status(400).json({
      error: "Expected at least one of: status, assigneeId",
    });
    return;
  }

  if (status !== undefined) {
    if (typeof status !== "string" || !STATUSES.includes(status as Status)) {
      res.status(400).json({
        error: `status must be one of: ${STATUSES.join(", ")}`,
      });
      return;
    }
  }

  if (assigneeId !== undefined && assigneeId !== null) {
    if (typeof assigneeId !== "string" || !getAgentById(assigneeId)) {
      res.status(400).json({ error: "assigneeId must be a valid agent id or null" });
      return;
    }
  }

  const updated = updateTicket(req.params.id, {
    ...(status !== undefined ? { status } : {}),
    ...(assigneeId !== undefined ? { assigneeId } : {}),
  });

  res.json(updated);
});
