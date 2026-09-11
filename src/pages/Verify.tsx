import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { LogoMark } from '../components/Logo';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Verify() {
  const location = useLocation();
  const initialEmail =
    (location.state as { email?: string } | null)?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    initialEmail
      ? `We sent a 6-digit code to ${initialEmail}`
      : 'Enter your email to get a verification code'
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { verify } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verify(email.trim(), code.trim());
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Enter your email first');
      return;
    }
    setError('');
    setResending(true);
    try {
      await api.post('/auth/resend-code', { email: email.trim() });
      setInfo(`A new code is on its way to ${email.trim()}`);
    } catch (err: any) {
      setError(err.message || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px]"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <LogoMark className="w-9 h-9" />
          <span className="text-xl font-semibold text-text">NexusDesk</span>
        </div>

        <h2 className="text-lg font-bold text-text mb-0.5">
          Check your email
        </h2>
        <p className="text-sm text-text-muted mb-5">{info}</p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              placeholder="you@company.com" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">6-digit code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors font-mono tracking-[0.3em] text-center"
              placeholder="••••••" required minLength={6} maxLength={6} inputMode="numeric" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Verify account
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-5">
          No code?{' '}
          <button onClick={handleResend} disabled={resending} className="text-text underline underline-offset-2 font-medium hover:opacity-70 disabled:opacity-50">
            {resending ? 'Sending...' : 'Resend it'}
          </button>
        </p>

        <Link to="/login" className="block text-center text-xs text-text-dim hover:text-text-muted mt-3">
          ← Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
