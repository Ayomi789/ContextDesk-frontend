import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { LogoMark } from '../components/Logo';
import { Ticket, Users, BarChart3, Shield, ArrowRight, Check, Brain, MessageSquare, Sun, Moon, Zap } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

/* ── Scroll-reveal wrapper ── */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: inView ? delay : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger children one-by-one ── */
function StaggerItem({ children, index, className = '' }: { children: ReactNode; index: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: inView ? index * 0.08 : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: Ticket, title: 'Unified Ticketing', desc: 'Every support ticket linked to real customer records. No more context switching between tools.' },
  { icon: Brain, title: 'AI Reply Drafting', desc: 'Context-aware draft replies using full ticket history and customer data. Review and send in seconds.' },
  { icon: Users, title: 'CRM Built In', desc: 'Contacts, accounts, and relationship history — all in one place. Auto-link by domain.' },
  { icon: BarChart3, title: 'Real-time Dashboard', desc: 'Ticket volume, SLA tracking, priority distribution. Know your support health at a glance.' },
  { icon: Shield, title: 'SLA Management', desc: 'Set response time targets. Get alerts before breaches. Keep your promises to customers.' },
  { icon: MessageSquare, title: 'Internal Notes', desc: 'Private team discussions alongside customer conversations. Keep context without the noise.' },
];

const plans = [
  { name: 'Starter', price: '$29', period: '/agent/mo', features: ['Up to 5 agents', '1,000 tickets/mo', 'Basic AI drafting', 'Email support'], cta: 'Start free trial', popular: false },
  { name: 'Pro', price: '$79', period: '/agent/mo', features: ['Unlimited agents', 'Unlimited tickets', 'Advanced AI features', 'SLA management', 'Priority support', 'Custom integrations'], cta: 'Start free trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'SSO & SAML', 'Dedicated instance', '99.99% SLA', 'Custom onboarding', 'Phone support'], cta: 'Contact sales', popular: false },
];

export default function Landing() {
  const { theme, toggle } = useTheme();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  // Parallax for hero text
  const heroY = useTransform(smoothProgress, [0, 0.25], [0, -50]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);

  // Nav bg opacity on scroll
  const navBorder = useTransform(smoothProgress, [0, 0.02], [0, 1]);

  return (
    <div ref={containerRef} className="min-h-screen bg-bg">
      {/* Nav */}
      <motion.nav
        className="fixed top-0 w-full z-50 bg-bg/90 backdrop-blur-md border-b border-border"
        style={{ borderBottomColor: useTransform(navBorder, v => `rgba(0,0,0,${v * 0.08})`) }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-7 h-7" />
            <span className="text-[15px] font-semibold text-text">NexusDesk</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-text-muted hover:text-text transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-text-muted hover:text-text transition-colors">Pricing</a>
            <a href="#about" className="text-sm text-text-muted hover:text-text transition-colors">About</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-text-dim hover:text-text hover:bg-bg-hover transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <Link to="/login" className="text-sm text-text-muted hover:text-text transition-colors px-2">Sign in</Link>
            <Link to="/login" className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-bg-card text-text-muted text-xs font-medium mb-7">
              <Zap className="w-3 h-3 text-accent" /> Now with AI-powered workflows
            </div>
          </motion.div>

          <motion.h1
            className="text-[2.5rem] sm:text-5xl font-bold text-text leading-[1.08] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Customer support,<br />
            finally unified.
          </motion.h1>

          <motion.p
            className="mt-5 text-base sm:text-lg text-text-muted max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            One platform for tickets, contacts, and accounts. AI drafts replies using real customer context so your team resolves issues faster.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors">
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-border-light bg-bg-card text-text rounded-lg text-sm font-medium transition-colors">
              Live Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats — fade up on scroll */}
        <div className="mt-16 flex justify-center gap-12 sm:gap-16">
          {[
            { n: '40%', l: 'Faster resolution' },
            { n: '3×', l: 'Agent productivity' },
            { n: '99.9%', l: 'Uptime' },
          ].map((s, i) => (
            <StaggerItem key={s.l} index={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-text tabular-nums">{s.n}</div>
              <div className="text-[11px] text-text-dim mt-1 uppercase tracking-wider font-medium">{s.l}</div>
            </StaggerItem>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-text">Everything your team needs</h2>
              <p className="text-text-muted mt-2 text-sm max-w-md mx-auto">CRM context without the complexity. Built for support teams.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {features.map((f, i) => (
              <StaggerItem key={f.title} index={i} className="bg-bg-card p-6 hover:bg-bg-elevated/40 transition-colors">
                <f.icon className="w-4.5 h-4.5 text-accent mb-3" strokeWidth={1.8} />
                <h3 className="text-sm font-semibold text-text mb-1.5">{f.title}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed">{f.desc}</p>
              </StaggerItem>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-text">Pricing</h2>
              <p className="text-text-muted mt-2 text-sm">Start free. Scale as you grow.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {plans.map((p, i) => (
              <StaggerItem
                key={p.name}
                index={i}
                className={`rounded-xl p-6 border ${
                  p.popular
                    ? 'bg-text border-text text-bg'
                    : 'bg-bg-card border-border'
                }`}
              >
                {p.popular && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-bg/15 text-bg mb-3 uppercase tracking-wide">
                    Popular
                  </span>
                )}
                <h3 className={`text-base font-semibold ${p.popular ? 'text-bg' : 'text-text'}`}>{p.name}</h3>
                <div className="mt-2">
                  <span className={`text-2xl font-bold ${p.popular ? 'text-bg' : 'text-text'}`}>{p.price}</span>
                  <span className={`text-sm ${p.popular ? 'text-bg/50' : 'text-text-dim'}`}>{p.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-[13px] ${p.popular ? 'text-bg/70' : 'text-text-muted'}`}>
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${p.popular ? 'text-bg/80' : 'text-text'}`} strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`mt-6 block text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                  p.popular
                    ? 'bg-bg text-text hover:opacity-90'
                    : 'bg-text text-bg hover:opacity-90'
                }`}>
                  {p.cta}
                </Link>
              </StaggerItem>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 sm:px-6 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <h2 className="text-2xl font-bold text-text text-center mb-8">Why NexusDesk?</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-4 text-[15px] text-text-muted leading-relaxed">
              <p>
                Support teams juggle separate CRM and ticketing tools, losing context with every tab switch. NexusDesk unifies both into a single platform with clean relational architecture.
              </p>
              <p>
                AI is integrated server-side for security and cost control — Claude drafts contextual replies based on full ticket history, customer notes, and account data. Every response is reviewable before sending.
              </p>
              <p>
                Built with React, TypeScript, Tailwind CSS, PostgreSQL, and Vercel. Production-grade engineering with thoughtful UX.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-wrap gap-1.5 mt-6">
              {['React', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Supabase', 'Vercel', 'Claude'].map(t => (
                <span key={t} className="px-2.5 py-1 rounded text-xs font-medium bg-bg-elevated text-text-dim">
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <Reveal>
        <footer className="border-t border-border py-6 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LogoMark className="w-5 h-5" />
              <span className="text-sm font-medium text-text">NexusDesk</span>
            </div>
            <p className="text-xs text-text-dim">© {new Date().getFullYear()} NexusDesk</p>
          </div>
        </footer>
      </Reveal>
    </div>
  );
}
