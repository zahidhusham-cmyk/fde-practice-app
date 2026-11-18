import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { resetDb } from "../src/db";

describe("agents API", () => {
  beforeEach(() => {
    resetDb();
  });

  it("lists support agents", async () => {
    const res = await request(app).get("/api/agents");

    expect(res.status).toBe(200);
    expect(res.body.agents).toHaveLength(4);
    expect(res.body.agents.map((agent: { id: string }) => agent.id)).toEqual([
      "agt-maya",
      "agt-jordan",
      "agt-sam",
      "agt-riley",
    ]);
  });
});
