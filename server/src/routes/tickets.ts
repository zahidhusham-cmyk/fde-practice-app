import { Router } from "express";
import {
  getAgentById,
  getTicketById,
  listTickets,
  updateTicket,
} from "../db";
import { STATUSES, type Status } from "../types";

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

ticketsRouter.get("/", (req, res) => {
  const page = parsePage(req.query.page);
  const limit = parseLimit(req.query.limit);
  const all = listTickets();
  const offset = page * limit;
  const tickets = all.slice(offset, offset + limit);

  res.json({
    tickets,
    pagination: {
      page,
      limit,
      total: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / limit)),
    },
  });
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
