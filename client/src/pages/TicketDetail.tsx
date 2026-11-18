import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAgents, fetchTicket, updateTicket } from "../api";
import { PriorityBadge } from "../components/PriorityBadge";
import { StatusBadge } from "../components/StatusBadge";
import type { Agent, Status, Ticket } from "../types";

const STATUSES: Status[] = [
  "open",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [status, setStatus] = useState<Status>("open");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchTicket(id), fetchAgents()])
      .then(([nextTicket, agentList]) => {
        if (cancelled) return;
        setTicket(nextTicket);
        setStatus(nextTicket.status);
        setAssigneeId(nextTicket.assigneeId ?? "");
        setAgents(agentList);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setTicket(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const assigneeName = useMemo(() => {
    if (!ticket?.assigneeId) return "Unassigned";
    return agents.find((agent) => agent.id === ticket.assigneeId)?.name ?? ticket.assigneeId;
  }, [agents, ticket]);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!ticket) return;
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const updated = await updateTicket(ticket.id, {
        status,
        assigneeId: assigneeId === "" ? null : assigneeId,
      });
      setTicket(updated);
      setStatus(updated.status);
      setAssigneeId(updated.assigneeId ?? "");
      setNotice("Ticket updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update ticket");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="muted">Loading ticket…</p>;
  }

  if (!ticket) {
    return (
      <section>
        <p className="banner error">{error ?? "Ticket not found"}</p>
        <Link to="/">Back to tickets</Link>
      </section>
    );
  }

  return (
    <section>
      <p className="crumb">
        <Link to="/">Tickets</Link>
        <span aria-hidden="true"> / </span>
        <span className="mono">{ticket.id}</span>
      </p>

      <div className="page-header">
        <div>
          <h1>{ticket.title}</h1>
          <p className="muted">
            Opened by {ticket.requester} · {formatDate(ticket.createdAt)}
          </p>
        </div>
        <div className="badge-row">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {error && <p className="banner error">{error}</p>}
      {notice && <p className="banner ok">{notice}</p>}

      <div className="detail-grid">
        <article className="card">
          <h2>Description</h2>
          <p className="body-text">{ticket.description}</p>

          <h2>Comments</h2>
          {ticket.comments.length === 0 ? (
            <p className="muted">No comments yet.</p>
          ) : (
            <ul className="comment-list">
              {ticket.comments.map((comment) => (
                <li key={comment.id}>
                  <div className="comment-meta">
                    <strong>{comment.author}</strong>
                    <span className="muted">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p>{comment.body}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <aside className="card">
          <h2>Details</h2>
          <dl className="meta-list">
            <div>
              <dt>Category</dt>
              <dd className="capitalize">{ticket.category}</dd>
            </div>
            <div>
              <dt>Assignee</dt>
              <dd>{assigneeName}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(ticket.updatedAt)}</dd>
            </div>
          </dl>

          <form className="update-form" onSubmit={onSave}>
            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as Status)}
              >
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assignee
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.team})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}
