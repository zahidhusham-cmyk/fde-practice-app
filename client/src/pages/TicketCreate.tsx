import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTicket } from "../api";
import type { Category, Priority } from "../types";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
const CATEGORIES: Category[] = [
  "access",
  "hardware",
  "software",
  "network",
  "facilities",
];

export function TicketCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requester, setRequester] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("software");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const ticket = await createTicket({
        title,
        description,
        requester,
        priority,
        category,
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create ticket");
      setSaving(false);
    }
  }

  return (
    <section>
      <p className="crumb">
        <Link to="/">Tickets</Link>
        <span aria-hidden="true"> / </span>
        <span>New ticket</span>
      </p>

      <div className="page-header">
        <div>
          <h1>New ticket</h1>
          <p className="muted">Opens as unassigned with status open.</p>
        </div>
      </div>

      {error && <p className="banner error">{error}</p>}

      <form className="update-form create-form" onSubmit={onSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </label>
        <label>
          Requester
          <input
            value={requester}
            onChange={(event) => setRequester(event.target.value)}
            required
          />
        </label>
        <label>
          Priority
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            {PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create ticket"}
        </button>
      </form>
    </section>
  );
}
