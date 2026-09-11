import { Link } from 'react-router-dom';
import { LogoMark } from '../components/Logo';
import { motion } from 'framer-motion';

const sections = [
  {
    title: 'What we collect',
    body: 'Your name, email address, and password hash when you register (or your name and email from Google if you sign in with Google). Inside the app: the accounts, contacts, tickets, and messages your workspace creates. We also store your theme, density, timezone, and notification preferences in your own browser — those never leave your device except notification preferences, which sync to your account.',
  },
  {
    title: 'How we use it',
    body: 'Your data runs the product: authentication, tickets, notifications, and AI reply drafts. Verification codes and team invitations are emailed to the address you provide. We never sell data, never show ads, and never share workspace contents with third parties except the infrastructure below.',
  },
  {
    title: 'Subprocessors',
    body: 'PostgreSQL hosting (Neon), AI drafting and triage (NVIDIA), transactional email (Brevo), and Google OAuth (only if you choose Google sign-in). Each processes the minimum data needed for its job.',
  },
  {
    title: 'Security',
    body: 'Passwords are hashed with bcrypt and never stored in plain text. Sessions are signed tokens kept in your browser; logging out discards them. Support traffic runs over HTTPS, and workspace data is strictly isolated per company — one organization can never read another\u2019s tickets.',
  },
  {
    title: 'Your control',
    body: 'Update your name and email anytime under Settings → Profile. Delete your account anytime under Settings → Account: your messages and notifications are removed, your assigned tickets become unassigned, and your profile is erased. Admins can remove teammates from the Team page.',
  },
  {
    title: 'Data retention',
    body: 'Tickets, contacts, and accounts persist until your workspace deletes them, so support history survives staff changes. Backups follow our hosting provider\u2019s retention. Deleted accounts are gone immediately except where law requires otherwise.',
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="w-7 h-7" />
            <span className="text-[15px] font-semibold text-text">NexusDesk</span>
          </Link>
          <Link to="/login" className="text-sm text-text-muted hover:text-text transition-colors">
            Sign in
          </Link>
        </div>
      </nav>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-12"
      >
        <h1 className="text-2xl font-bold text-text">Privacy Policy</h1>
        <p className="text-sm text-text-muted mt-1 mb-8">
          Last updated September 2026
        </p>
        <div className="space-y-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-semibold text-text mb-1.5">
                {s.title}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </motion.main>
    </div>
  );
}
