import cors from "cors";
import express from "express";
import { agentsRouter } from "./routes/agents";
import { ticketsRouter } from "./routes/tickets";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/tickets", ticketsRouter);
app.use("/api/agents", agentsRouter);
