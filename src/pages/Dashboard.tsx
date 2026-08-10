import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { DashboardStats } from '../lib/types';
import { Ticket, AlertTriangle, Clock, CheckCircle2, Inbox, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const statCards = [
  { key: 'total_tickets', label: 'Total Tickets', icon: Ticket, color: 'text-text', bg: 'bg-bg-elevated' },
  { key: 'new_tickets', label: 'New', icon: Inbox, color: 'text-info', bg: 'bg-info-dim' },
  { key: 'in_progress', label: 'In Progress', icon: TrendingUp, color: 'text-warning', bg: 'bg-warning-dim' },
  { key: 'waiting', label: 'Waiting', icon: Clock, color: 'text-warning', bg: 'bg-warning-dim' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-dim' },
  { key: 'sla_at_risk', label: 'SLA At Risk', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-dim' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/dashboard')
      .then(response => setStats(response.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
    </div>
  );

  if (!stats) return <div className="text-text-muted">Failed to load dashboard</div>;

  const maxVolume = Math.max(...(stats.volume_over_time?.map(v => v.count) || [1]), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Overview of your support operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-bg-card border border-border rounded-xl p-4"
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} strokeWidth={1.8} />
            </div>
            <div className="text-2xl font-bold text-text tracking-tight">
              {(stats as any)[card.key] ?? 0}
            </div>
            <div className="text-xs text-text-muted mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-text mb-4">By Priority</h3>
          <div className="space-y-3.5">
            {stats.by_priority?.map(p => {
              const total = stats.total_tickets || 1;
              const pct = Math.round((p.count / total) * 100);
              const colors: Record<string, string> = {
                Low: 'bg-text-dim', Medium: 'bg-info', High: 'bg-warning', Urgent: 'bg-danger'
              };
              return (
                <div key={p.priority}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-text-muted">{p.priority}</span>
                    <span className="text-text font-medium tabular-nums">{p.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[p.priority] || 'bg-accent'} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Volume over time */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-card border border-border rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-text mb-4">Ticket Volume (Last 7 Days)</h3>
          <div className="flex items-end gap-2.5 h-40">
            {stats.volume_over_time?.map((v, i) => (
              <div key={v.date} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-text-muted font-medium tabular-nums">{v.count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v.count / maxVolume) * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                  className="w-full bg-text rounded min-h-[4px]"
                />
                <span className="text-[10px] text-text-dim">
                  {new Date(v.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
