import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchAgents, fetchTickets } from "../api";
import { PriorityBadge } from "../components/PriorityBadge";
import { StatusBadge } from "../components/StatusBadge";
import type { Agent, TicketListResponse } from "../types";

const PAGE_SIZE = 10;

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function agentName(agents: Agent[], assigneeId: string | null) {
  if (!assigneeId) return "Unassigned";
  return agents.find((agent) => agent.id === assigneeId)?.name ?? assigneeId;
}

export function TicketList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const [data, setData] = useState<TicketListResponse | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchTickets(page, PAGE_SIZE), fetchAgents()])
      .then(([ticketPage, agentList]) => {
        if (cancelled) return;
        setData(ticketPage);
        setAgents(agentList);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  function goToPage(next: number) {
    setSearchParams({ page: String(next) });
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Tickets</h1>
          <p className="muted">
            {data
              ? `${data.pagination.total} tickets in the queue`
              : "All open work for Northstar Retail IT"}
          </p>
        </div>
      </div>

      {error && <p className="banner error">{error}</p>}
      {loading && !data && <p className="muted">Loading tickets…</p>}

      {data && (
        <>
          <div className="table-wrap">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">
                      No tickets on this page.
                    </td>
                  </tr>
                ) : (
                  data.tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="mono">
                        <Link to={`/tickets/${ticket.id}`}>{ticket.id}</Link>
                      </td>
                      <td>
                        <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                      </td>
                      <td>
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td>{agentName(agents, ticket.assigneeId)}</td>
                      <td className="muted">{formatDate(ticket.updatedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </button>
            <span className="muted">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.pagination.totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
