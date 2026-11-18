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

  it("returns 404 when updating an unknown ticket", async () => {
    const res = await request(app)
      .patch("/api/tickets/TCK-9999")
      .send({ status: "closed" });

    expect(res.status).toBe(404);
  });
});
