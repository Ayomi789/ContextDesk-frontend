import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogoMark } from '../components/Logo';
import { Loader2, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex relative">
      <button
        onClick={toggle}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-bg-card border border-border text-text-dim hover:text-text hover:bg-bg-hover transition-colors"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-bg-card border-r border-border relative overflow-hidden">
        <div className="relative flex flex-col justify-center px-14">
          <div className="flex items-center gap-2.5 mb-10">
            <LogoMark className="w-10 h-10" />
            <span className="text-2xl font-semibold text-text">NexusDesk</span>
          </div>
          <h1 className="text-3xl font-bold text-text leading-tight mb-3">
            CRM & Ticketing,<br />unified.
          </h1>
          <p className="text-base text-text-muted max-w-sm leading-relaxed">
            AI-powered support workflows. Every ticket linked to real customer records.
          </p>
          <div className="mt-12 flex gap-10">
            {[
              { n: '99.9%', l: 'Uptime' },
              { n: '<2m', l: 'Response' },
              { n: '40%', l: 'AI Assist' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-xl font-bold text-text tabular-nums">{s.n}</div>
                <div className="text-[11px] text-text-dim mt-0.5 uppercase tracking-wider font-medium">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[340px]"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <LogoMark className="w-9 h-9" />
            <span className="text-xl font-semibold text-text">NexusDesk</span>
          </div>

          <h2 className="text-lg font-bold text-text mb-0.5">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-text-muted mb-5">
            {isSignUp ? 'Get started with NexusDesk' : 'Sign in to continue'}
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                  placeholder="Jane Doe" required />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors pr-9"
                  placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted">
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-text-dim">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* <button onClick={() => signInWithGoogle('NexusDesk')}
            className="w-full py-2 bg-bg-card border border-border hover:bg-bg-elevated rounded-lg text-sm font-medium text-text transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button> */}

          <p className="text-center text-sm text-text-muted mt-5">
            {isSignUp ? 'Have an account?' : "No account?"}{' '}
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-text underline underline-offset-2 font-medium hover:opacity-70">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {/* <div className="mt-5 p-2.5 rounded-lg bg-bg-elevated border border-border">
            <p className="text-[11px] text-text-dim">Demo: <span className="font-mono text-text-muted">demo@nexusdesk.com</span> / <span className="font-mono text-text-muted">password123</span></p>
          </div> */}

          <Link to="/" className="block text-center text-xs text-text-dim hover:text-text-muted mt-3">
            ← Homepage
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
