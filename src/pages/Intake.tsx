import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { LogoMark } from '../components/Logo';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Intake() {
  const { slug } = useParams();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api
      .get<{
        success: boolean;
        organization: { name: string };
      }>(`/intake/${slug}`)
      .then((response) => {
        setOrgName(response.data.organization.name);
      })
      .catch(() => {
        setMissing(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await api.post(`/intake/${slug}`, {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        website: website || undefined,
        startedAt,
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send your request');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (missing) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
        <p className="text-sm text-text-muted">
          This support form doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-3 text-sm text-accent hover:underline"
        >
          Homepage
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
          <h2 className="text-lg font-bold text-text">
            Request received
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Thanks — {orgName} will be in touch at {email}.
          </p>
          <Link
            to="/"
            className="inline-block mt-5 text-sm text-accent hover:underline"
          >
            Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <LogoMark className="w-9 h-9" />
          <span className="text-xl font-semibold text-text">
            {orgName} support
          </span>
        </div>

        <h2 className="text-lg font-bold text-text mb-0.5">
          How can we help?
        </h2>
        <p className="text-sm text-text-muted mb-5">
          Describe your issue and we'll get back to you.
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              placeholder="Brief summary of the issue"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">
              Details
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors resize-none"
              placeholder="What happened, and what did you expect?"
              required
            />
          </div>
          {/* Honeypot: humans never see this */}
          <input
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Send request
          </button>
        </form>
      </motion.div>
    </div>
  );
}
