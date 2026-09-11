import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import EmptyState from '../components/EmptyState';
import {
  CreditCard,
  Shield,
  Loader2,
  Check,
  Users,
  Ticket,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Status {
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd?: string | null;
  };
  usage: {
    seatsUsed: number;
    seatsLimit: number | null;
    ticketsThisMonth: number;
    ticketsLimit: number | null;
  };
}

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: '₦0',
    period: '',
    blurb: 'Try it out — no card needed',
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: '₦15,600',
    period: '/agent/mo',
    blurb: 'For small teams getting started',
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '₦50,700',
    period: '/agent/mo',
    blurb: 'For teams with serious volume',
  },
];

export default function Billing() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [data, setData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Status & { success: boolean }>('/billing/status')
      .then((response) => {
        setData({
          subscription: response.data.subscription,
          usage: response.data.usage,
        });
      })
      .catch((err) => {
        setError(err.message || 'Failed to load billing');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const startCheckout = async (plan: string) => {
    setError('');
    setStarting(plan);
    try {
      const response = await api.post<{
        success: boolean;
        authorization_url: string;
      }>('/billing/initialize', { plan });
      window.location.href = response.data.authorization_url;
    } catch (err: any) {
      setError(err.message || 'Could not start checkout');
      setStarting(null);
    }
  };

  if (!isAdmin) {
    return (
      <EmptyState
        icon={Shield}
        title="Admins only"
        description="Only workspace admins can manage billing"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-text-muted">Failed to load billing</div>;
  }

  const { subscription, usage } = data;

  const bar = (used: number, limit: number | null) => {
    if (limit === null) return 8;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Billing</h1>
        <p className="text-sm text-text-muted mt-1">
          {user?.organization?.name || 'Your workspace'} is on{' '}
          <span className="font-semibold text-text">
            {subscription.plan}
          </span>{' '}
          · {subscription.status}
        </p>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">
          {error}
        </div>
      )}

      {/* Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text mb-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Seats
          </h3>
          <p className="text-2xl font-bold text-text tabular-nums">
            {usage.seatsUsed}
            <span className="text-sm font-medium text-text-dim">
              {usage.seatsLimit === null
                ? ' · unlimited'
                : ` / ${usage.seatsLimit}`}
            </span>
          </p>
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${bar(usage.seatsUsed, usage.seatsLimit)}%` }}
            />
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text mb-1 flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Tickets this month
          </h3>
          <p className="text-2xl font-bold text-text tabular-nums">
            {usage.ticketsThisMonth}
            <span className="text-sm font-medium text-text-dim">
              {usage.ticketsLimit === null
                ? ' · unlimited'
                : ` / ${usage.ticketsLimit}`}
            </span>
          </p>
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{
                width: `${bar(usage.ticketsThisMonth, usage.ticketsLimit)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan, i) => {
          const current = subscription.plan === plan.id;
          const isFree = plan.id === 'FREE';
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl p-6 border ${
                current
                  ? 'border-accent bg-bg-card shadow-lg shadow-accent/10'
                  : 'border-border bg-bg-card'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-text-muted" />
                <h3 className="text-base font-semibold text-text">
                  {plan.name}
                </h3>
                {current && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-success-dim text-success uppercase tracking-wide">
                    <Check className="w-3 h-3" /> Current
                  </span>
                )}
              </div>
              <p className="mt-2">
                <span className="text-2xl font-bold text-text">
                  {plan.price}
                </span>
                <span className="text-sm text-text-dim">{plan.period}</span>
              </p>
              <p className="text-[13px] text-text-muted mt-1">{plan.blurb}</p>
              {isFree ? (
                <p className="mt-5 w-full py-2 text-center text-[13px] text-text-dim">
                  {current ? 'Your plan' : 'No card needed'}
                </p>
              ) : (
                <button
                  onClick={() => startCheckout(plan.id)}
                  disabled={current || starting !== null}
                  className="mt-5 w-full py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {starting === plan.id && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {current ? 'Your plan' : `Upgrade to ${plan.name}`}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs text-text-dim">
        Payments are processed securely by Paystack. Enterprise billing is
        manual — contact sales.
      </p>
    </div>
  );
}
