# Interviewer notes

**Spoilers.** Do not read this before a practice run. It is for self-review afterward, or for a friend acting as interviewer.

## The planted bug

**Where.** `server/src/routes/tickets.ts`, in `GET /api/tickets`. The offset is computed as `page * limit` instead of `(page - 1) * limit`.

**What you'll see.** The list is 1-indexed in the UI (page defaults to 1, page size 10). With the bug, page 1 skips the first 10 tickets and starts at `TCK-1011`. Page 3 is empty even though `pagination.total` is 28. Ticket `TCK-1001` never appears on any page.

**How it is revealed.** `server/tests/tickets.test.ts` — `"page 1 includes the earliest tickets in default order"` — is intentionally failing. Manual check: open the dashboard, confirm the first row is not `TCK-1001`, and page through to a blank last page. Other existing tests still pass; they assert on shape, totals, detail, and updates, not on which ticket is first.

**Good fix.** Use `const offset = (page - 1) * limit`. Keep 1-based page numbers in the API and UI. Optionally clamp `page` to `totalPages` (nice, not required). Re-run `npm test` and confirm page 1 shows `TCK-1001`–`TCK-1010`.

**Weaker fixes.** Changing the test to match the bug. Switching the API to 0-based pages without updating the UI. Rewriting pagination from scratch when a one-line correction would do. "Fixing" it only in the frontend by requesting `page=0`.

## What good solutions look like

### Task 1 — Fix the list bug

A strong candidate runs the tests or clicks through the list, forms a hypothesis, reads the list endpoint, and makes a small fix. They verify with the previously failing test and a quick UI check. They do not need to find it on the first guess, but they should work from evidence.

### Task 2 — Filter or search, end to end

A solid solution adds query params to `GET /api/tickets` (for example `q` and/or `status`) and corresponding controls on the list page.

Look for:

- Filtering **before** pagination, so page totals reflect the filtered set. A common miss is paginating first, then filtering the page.
- Reusing the existing list response shape (`tickets` + `pagination`).
- An empty state when nothing matches.
- Case-insensitive search over a reasonable field set (title, description, id, requester).
- Status filter values that match the existing status model (`open`, `in_progress`, and so on).

Debouncing the search box is a plus, not a requirement. Building only the API or only the UI is incomplete.

### Task 3 — Create a ticket

A solid solution adds `POST /api/tickets`, a form in the UI, and tests.

Look for:

- Following the existing PATCH validation style (allow-lists, `400` with an `{ error: string }` body).
- Required fields such as title, description, requester, and a valid priority and category.
- `201` and the created ticket, including a new id in the `TCK-10xx` pattern.
- `assigneeId` optional, but rejected when it does not match a real agent (same idea as PATCH).
- A test for the happy path and at least one validation failure.
- UI that lets an agent submit a ticket and then see it (navigate to the detail page, or refresh the list).

Weaker: no validation, mutating the array from the client only, or a large custom form library that doesn't match the rest of the app.

### Task 4 — Summarize (stretch)

A solid solution puts the summarizer behind a small interface or injected function so it can later be swapped for an LLM, then ships a stub (first sentence plus status/priority, or title + latest comment, etc.).

Look for:

- An endpoint such as `POST /api/tickets/:id/summary` (or GET) that returns `{ summary: string }`.
- A button on the detail page and a place to render the result.
- A test that mocks or stubs the summarizer and does not call a real model.
- A 404 when the ticket does not exist.

Weaker: calling a real LLM from the test, hard-coding the stub in the route with no seam, or a large framework for a one-function feature.

## Rubric — working with an AI agent

Score the process, not just the diff.

| Signal | Strong | Weak |
| --- | --- | --- |
| Explore first | Reads the repo, runs the app or tests, and restates how pieces connect before generating a large change | Asks the agent to "do all the tasks" immediately |
| Prompting | Small, specific steps that point at existing files or patterns | One-shot prompts that try to finish the interview at once |
| Diff review | Reads each diff, edits or rejects mistakes, keeps unrelated refactors out | Accepts large diffs unread |
| Verification | Runs tests or clicks through the UI after changes | Assumes the agent got it right |
| Narration | Thinks out loud: hypothesis, tradeoff, next step | Long silences while the agent works |
| Handling mistakes | Pushes back when the agent is wrong, off-pattern, or too broad | Rubber-stamps bad or bloated changes |
| Review pass | Reviews their own diff first, then asks Cursor's review agent (or the chat agent) for a brief bugs/edge-cases pass before calling a task done | Declares done without reading the diff, or burns minutes on a vague "review everything" prompt |
| Time | Leaves a few minutes to summarize; can say what they'd do next | Still generating code when time is called |

A strong 45-minute session typically finishes tasks 1 and 2 cleanly, gets a solid start on 3, and may or may not reach 4. Finishing all four with sloppy process is a worse signal than finishing two carefully.
