import type { Status } from "../types";

const LABELS: Record<Status, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting: "Waiting",
  resolved: "Resolved",
  closed: "Closed",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge status-${status}`}>{LABELS[status]}</span>;
}
