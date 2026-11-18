# Northstar Desk

An internal IT support dashboard used by Northstar Retail's help desk. Agents review tickets, open a ticket's details, and update status or assignee.

This repo is a timed practice app for a live coding interview where you work in an existing codebase with Cursor (or another AI-assisted editor). It is a small full-stack app: a TypeScript Express API and a React (Vite) frontend, with in-memory seed data.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173). The API runs on [http://localhost:3001](http://localhost:3001) and the Vite dev server proxies `/api` to it.

## Tests

```bash
npm test
```

Run `npm test` before you start. Some tests may already be failing.

## Practice

1. Read [PRACTICE_GUIDE.md](./PRACTICE_GUIDE.md) and set a 45-minute timer.
2. Work through [TASKS.md](./TASKS.md). You are not expected to finish every task.
3. After the timer, use the self-review checklist in the practice guide. Only then read [INTERVIEWER_NOTES.md](./INTERVIEWER_NOTES.md) — it contains spoilers.

A starter Cursor rules file lives at [`.cursor/rules/project.mdc`](./.cursor/rules/project.mdc).
