import { Link } from 'react-router-dom';
import { LogoMark } from '../components/Logo';
import { motion } from 'framer-motion';

const groups: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'On the sign-in page, choose Sign up and enter your name, email, password, and company name — you become that workspace\u2019s admin. Or continue with Google. Either way you\u2019ll confirm a 6-digit code (email signups) and land on your dashboard.',
      },
      {
        q: 'I didn\u2019t get a verification code',
        a: 'Check spam first, then hit Resend on the verification page. Codes expire after 15 minutes. If you signed up with Google, no code is needed at all.',
      },
      {
        q: 'How do I invite my team?',
        a: 'Admins open the Team page, enter a teammate\u2019s email, and send the invite. They get an email with a signup link that drops them straight into your workspace with the role you chose.',
      },
    ],
  },
  {
    title: 'Tickets & SLA',
    items: [
      {
        q: 'How do tickets get a priority?',
        a: 'Two ways. Tickets submitted through your public support link are urgency-classified by AI before the clock starts, with the reason shown on the ticket. Tickets your agents create use the priority they pick.',
      },
      {
        q: 'What do the SLA badges mean?',
        a: 'Every priority carries a deadline: Urgent 1 hour, High 4, Medium 8, Low 24. Green means on track, amber means under 2 hours remain, red means breached. Resolved tickets stop the clock.',
      },
      {
        q: 'What is the AI Draft button?',
        a: 'It reads the ticket\u2019s public conversation and drafts a customer-ready reply. Always review and edit before sending — it never sends anything by itself.',
      },
      {
        q: 'How do customers submit complaints?',
        a: 'Share your workspace\u2019s public support link (Team page). Anyone can file a request without an account; it arrives as a ticket with the customer\u2019s first message attached. Spam is filtered by rate limits and bot traps.',
      },
    ],
  },
  {
    title: 'Team & account',
    items: [
      {
        q: 'What can admins do that agents can\u2019t?',
        a: 'Delete tickets, contacts, and accounts; invite and remove teammates; change roles. Everything else — reading, creating, replying — is open to the whole team.',
      },
      {
        q: 'Why can\u2019t I delete something?',
        a: 'Three guards: only admins delete; records with children can\u2019t be deleted (resolve or move tickets first); and the last admin can\u2019t be demoted or deleted — promote someone first.',
      },
      {
        q: 'How do I change my password?',
        a: 'Settings → Password with your current password. Google-only accounts have no password to change — keep signing in with Google.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Settings → Account → Delete. Your messages and notifications are removed and your tickets become unassigned for the team.',
      },
    ],
  },
];

export default function Help() {
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
        <h1 className="text-2xl font-bold text-text">Help Center</h1>
        <p className="text-sm text-text-muted mt-1 mb-8">
          Answers to the questions every workspace asks first.
        </p>
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="text-base font-semibold text-text mb-3">
                {g.title}
              </h2>
              <div className="divide-y divide-border border-y border-border">
                {g.items.map((item) => (
                  <details key={item.q} className="group py-3.5">
                    <summary className="text-sm font-medium text-text cursor-pointer list-none flex items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span className="text-text-dim group-open:rotate-45 transition-transform text-lg leading-none font-light">
                        +
                      </span>
                    </summary>
                    <p className="text-sm text-text-muted leading-relaxed mt-2 pr-6">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </motion.main>
    </div>
  );
}
