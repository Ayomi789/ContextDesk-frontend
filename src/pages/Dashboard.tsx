import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { DashboardStats, CrmUser, Account } from '../lib/types';
import { Ticket, AlertTriangle, Clock, CheckCircle2, Inbox, TrendingUp, Check, X, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardSkeleton } from '../components/Skeleton';
import { formatWeekday } from '../lib/dates';

type StatKey = 'total_tickets' | 'new_tickets' | 'in_progress' | 'waiting' | 'resolved' | 'sla_at_risk';

const statCards: { key: StatKey; label: string; icon: LucideIcon; color: string; bg: string }[] = [
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
  const [memberCount, setMemberCount] = useState(1);
  const [accountCount, setAccountCount] = useState(1);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('nexus-onboarding-dismissed') === '1'
  );
  const navigate = useNavigate();

  useEffect(() => {
    api.get<DashboardStats>('/dashboard')
      .then(response => setStats(response.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    api.get<{ users: CrmUser[] }>('/users')
      .then(response => setMemberCount(response.data.users.length))
      .catch(() => {});
    api.get<{ accounts: Account[] }>('/accounts')
      .then(response => setAccountCount(response.data.accounts.length))
      .catch(() => {});
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (!stats) return <div className="text-text-muted">Failed to load dashboard</div>;

  const maxVolume = Math.max(...(stats.volume_over_time?.map(v => v.count) || [1]), 1);

  const steps = [
    {
      key: 'team',
      label: 'Invite your team',
      desc: 'Support is a team sport',
      done: memberCount > 1,
      to: '/app/team',
    },
    {
      key: 'account',
      label: 'Add an account',
      desc: 'A company you support',
      done: accountCount > 0,
      to: '/app/accounts',
    },
    {
      key: 'ticket',
      label: 'Open your first ticket',
      desc: 'Needs an account + contact',
      done: stats.total_tickets > 0,
      to: '/app/tickets',
    },
  ];
  const doneCount = steps.filter(s => s.done).length;
  const showOnboarding =
    !dismissed && doneCount < steps.length;

  const dismiss = () => {
    localStorage.setItem('nexus-onboarding-dismissed', '1');
    setDismissed(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Overview of your support operations</p>
      </div>

      {showOnboarding && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text">
                Getting started ({doneCount}/{steps.length})
              </h3>
              <div className="h-1.5 w-48 bg-bg-elevated rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(doneCount / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={dismiss}
              className="p-1.5 text-text-dim hover:text-text-muted transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {steps.map(step => (
              <button
                key={step.key}
                onClick={() => navigate(step.to)}
                disabled={step.done}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  step.done
                    ? 'border-border bg-bg-elevated/50 opacity-70 cursor-default'
                    : 'border-border hover:border-accent bg-bg-elevated/30'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.done
                      ? 'bg-success-dim text-success'
                      : 'bg-bg-elevated text-text-muted'
                  }`}
                >
                  {step.done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-xs font-semibold">
                      {steps.indexOf(step) + 1}
                    </span>
                  )}
                </span>
                <span>
                  <span className="block text-sm font-medium text-text">
                    {step.label}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {step.desc}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

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
              {stats[card.key] ?? 0}
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
                  {formatWeekday(v.date)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
