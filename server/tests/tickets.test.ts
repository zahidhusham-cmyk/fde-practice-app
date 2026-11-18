import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { resetDb } from "../src/db";

describe("tickets API", () => {
  beforeEach(() => {
    resetDb();
  });

  it("lists tickets with pagination metadata", async () => {
    const res = await request(app).get("/api/tickets");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tickets)).toBe(true);
    expect(res.body.tickets.length).toBeGreaterThan(0);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: 28,
      totalPages: 3,
    });
  });

  it("honors a custom page size", async () => {
    const res = await request(app).get("/api/tickets?limit=5");

    expect(res.status).toBe(200);
    expect(res.body.tickets).toHaveLength(5);
    expect(res.body.pagination.limit).toBe(5);
    expect(res.body.pagination.total).toBe(28);
    expect(res.body.pagination.totalPages).toBe(6);
  });

  it("page 1 includes the earliest tickets in default order", async () => {
    const res = await request(app).get("/api/tickets?page=1&limit=10");

    expect(res.status).toBe(200);
    expect(res.body.tickets).toHaveLength(10);
    expect(res.body.tickets[0].id).toBe("TCK-1001");
    expect(res.body.tickets[9].id).toBe("TCK-1010");
    expect(res.body.pagination.total).toBe(28);
  });

  it("filters tickets by id, title, description, or requester", async () => {
    const res = await request(app).get("/api/tickets").query({ q: "badge" });

    expect(res.status).toBe(200);
    const ids = res.body.tickets.map((ticket: { id: string }) => ticket.id);
    expect(ids).toContain("TCK-1001");
    expect(ids).not.toContain("TCK-1002");
    expect(res.body.pagination.total).toBe(ids.length);
  });

  it("returns the ticket when the search query is its id", async () => {
    const res = await request(app).get("/api/tickets").query({ q: "TCK-1002" });

    expect(res.status).toBe(200);
    expect(res.body.tickets).toEqual([
      expect.objectContaining({
        id: "TCK-1002",
        title: "POS terminal 3 frozen at checkout",
        requester: "Chris Nguyen",
        status: "in_progress",
      }),
    ]);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it("returns the ticket when the search query matches its title", async () => {
    const res = await request(app).get("/api/tickets").query({ q: "POS terminal 3" });

    expect(res.status).toBe(200);
    expect(res.body.tickets).toHaveLength(1);
    expect(res.body.tickets[0].id).toBe("TCK-1002");
    expect(res.body.tickets[0].title).toBe("POS terminal 3 frozen at checkout");
  });

  it("pages filtered tickets from the first match", async () => {
    const all = await request(app).get("/api/tickets").query({ q: "store", limit: 50 });
    const page = await request(app).get("/api/tickets").query({ q: "store", page: 1, limit: 10 });

    expect(all.status).toBe(200);
    expect(all.body.pagination.total).toBeGreaterThan(10);
    expect(page.status).toBe(200);
    expect(page.body.tickets).toHaveLength(10);
    expect(page.body.tickets[0].id).toBe(all.body.tickets[0].id);
    expect(page.body.pagination.total).toBe(all.body.pagination.total);
  });

  it("returns no tickets when nothing matches", async () => {
    const res = await request(app).get("/api/tickets").query({ q: "zzzz-no-such-ticket" });

    expect(res.status).toBe(200);
    expect(res.body.tickets).toEqual([]);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      total: 0,
      totalPages: 1,
    });
  });

  it("returns a ticket by id", async () => {
    const res = await request(app).get("/api/tickets/TCK-1002");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("TCK-1002");
    expect(res.body.title).toMatch(/POS terminal/i);
    expect(res.body.status).toBe("in_progress");
    expect(res.body.assigneeId).toBe("agt-riley");
  });

  it("returns 404 for an unknown ticket", async () => {
    const res = await request(app).get("/api/tickets/TCK-9999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Ticket not found");
  });

  it("updates ticket status", async () => {
    const res = await request(app)
      .patch("/api/tickets/TCK-1003")
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("TCK-1003");
    expect(res.body.status).toBe("in_progress");
    expect(res.body.updatedAt).not.toBe(res.body.createdAt);
  });

  it("assigns a ticket to an agent", async () => {
    const res = await request(app)
      .patch("/api/tickets/TCK-1003")
      .send({ assigneeId: "agt-jordan" });

    expect(res.status).toBe(200);
    expect(res.body.assigneeId).toBe("agt-jordan");
  });

  it("rejects an invalid status", async () => {
    const res = await request(app)
      .patch("/api/tickets/TCK-1003")
      .send({ status: "done" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status must be one of/i);
  });

  it("rejects an unknown assignee", async () => {
    const res = await request(app)
      .patch("/api/tickets/TCK-1003")
      .send({ assigneeId: "agt-nobody" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/assigneeId/i);
  });

  it("rejects a patch with no fields", async () => {
    const res = await request(app).patch("/api/tickets/TCK-1003").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least one/i);
  });

  it("creates a ticket at the end of the list", async () => {
    const res = await request(app).put("/api/tickets").send({
      title: "Badge printer jam",
      description: "The HQ badge printer jams on every other card.",
      requester: "Alex Kim",
      priority: "high",
      category: "hardware",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: "TCK-1029",
      title: "Badge printer jam",
      requester: "Alex Kim",
      status: "open",
      priority: "high",
      category: "hardware",
      assigneeId: null,
      comments: [],
    });

    const fetched = await request(app).get("/api/tickets/TCK-1029");
    expect(fetched.status).toBe(200);
    expect(fetched.body.title).toBe("Badge printer jam");

    const list = await request(app).get("/api/tickets").query({ limit: 50 });
    expect(list.body.tickets.at(-1).id).toBe("TCK-1029");
    expect(list.body.pagination.total).toBe(29);
  });

  it("rejects a ticket with a missing title", async () => {
    const res = await request(app).put("/api/tickets").send({
      description: "The printer is jammed.",
      requester: "Alex Kim",
      priority: "low",
      category: "hardware",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title, description, and requester/i);

    const list = await request(app).get("/api/tickets");
    expect(list.body.pagination.total).toBe(28);
  });

  it("rejects a ticket with an invalid priority", async () => {
    const res = await request(app).put("/api/tickets").send({
      title: "Badge printer jam",
      description: "The HQ badge printer jams on every other card.",
      requester: "Alex Kim",
      priority: "critical",
      category: "hardware",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/priority must be one of/i);

    const list = await request(app).get("/api/tickets");
    expect(list.body.pagination.total).toBe(28);
  });

  it("returns 404 when updating an unknown ticket", async () => {
    const res = await request(app)
      .patch("/api/tickets/TCK-9999")
      .send({ status: "closed" });

    expect(res.status).toBe(404);
  });
});
