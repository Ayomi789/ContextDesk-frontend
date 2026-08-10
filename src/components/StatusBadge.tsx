const statusColors: Record<string, string> = {
  New: 'bg-info-dim text-info border border-info/20',
  'In Progress': 'bg-warning-dim text-warning border border-warning/20',
  Waiting: 'bg-bg-elevated text-text-muted border border-border',
  Resolved: 'bg-success-dim text-success border border-success/20',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-bg-elevated text-text-muted border border-border',
  Medium: 'bg-info-dim text-info border border-info/20',
  High: 'bg-warning-dim text-warning border border-warning/20',
  Urgent: 'bg-danger-dim text-danger border border-danger/20',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${statusColors[status] || 'bg-bg-elevated text-text-muted'}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${priorityColors[priority] || 'bg-bg-elevated text-text-muted'}`}>
      {priority}
    </span>
  );
}

export function TagBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-bg-elevated text-text-muted border border-border">
      {label}
    </span>
  );
}
