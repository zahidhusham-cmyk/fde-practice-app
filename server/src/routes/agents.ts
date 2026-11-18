import { Router } from "express";
import { getAgents } from "../db";

export const agentsRouter = Router();

agentsRouter.get("/", (_req, res) => {
  res.json({ agents: getAgents() });
});
