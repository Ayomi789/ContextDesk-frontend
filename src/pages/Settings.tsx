import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import type { CrmUser } from '../lib/types';
import {
  User, Lock, Bell, Sun, Moon, Monitor, Loader2, Check, Shield, Globe, Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

type Tab = 'profile' | 'password' | 'notifications' | 'appearance';

export default function Settings() {
  const [tab, setTab] = useState<Tab>('profile');

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Password', icon: Lock },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Sun },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab nav */}
        <nav className="lg:w-52 flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
                tab === t.key
                  ? 'bg-bg-elevated text-text'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text'
              }`}
            >
              <t.icon className="w-4 h-4" strokeWidth={1.8} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'profile' && <ProfileTab />}
            {tab === 'password' && <PasswordTab />}
            {tab === 'notifications' && <NotificationsTab />}
            {tab === 'appearance' && <AppearanceTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ────── Profile ────── */
function ProfileTab() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.put('/settings', { id: user?.id, name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text">Profile Information</h2>
        <p className="text-xs text-text-muted mt-0.5">Update your personal details</p>
      </div>
      <form onSubmit={handleSave} className="p-6 space-y-4">
        {error && <div className="px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">{error}</div>}
        {saved && <div className="px-3 py-2 rounded-lg bg-success-dim text-success text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Profile updated successfully</div>}

        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted text-2xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-text">{name}</p>
            <p className="text-xs text-text-muted capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Full name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Role</label>
          <input
            value={user?.role || ''}
            disabled
            className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text-dim capitalize cursor-not-allowed"
          />
          <p className="text-[11px] text-text-dim mt-1">Roles can only be changed by an admin</p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

/* ────── Password ────── */
function PasswordTab() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) { setError('Current password is required'); return; }
    if (newPw.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPw !== confirm) { setError('Passwords do not match'); return; }
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.put('/settings', { id: user?.id, action: 'password', current_password: current, new_password: newPw });
      setSaved(true);
      setCurrent(''); setNewPw(''); setConfirm('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text">Change Password</h2>
        <p className="text-xs text-text-muted mt-0.5">Ensure your account stays secure</p>
      </div>
      <form onSubmit={handleSave} className="p-6 space-y-4 max-w-md">
        {error && <div className="px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">{error}</div>}
        {saved && <div className="px-3 py-2 rounded-lg bg-success-dim text-success text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Password updated successfully</div>}

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Current password</label>
          <input
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">New password</label>
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
            placeholder="••••••••"
          />
          <p className="text-[11px] text-text-dim mt-1">Minimum 6 characters</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">Confirm new password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}

/* ────── Notifications ────── */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    email_new_ticket: true,
    email_ticket_assigned: true,
    email_customer_reply: true,
    email_sla_warning: true,
    email_ticket_resolved: false,
    push_new_ticket: true,
    push_ticket_assigned: true,
    push_customer_reply: true,
    push_sla_warning: true,
    push_ticket_resolved: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => {
    setPrefs(p => ({ ...p, [key]: !(p as any)[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-bg-elevated border border-border'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
        checked ? 'translate-x-4 bg-bg' : 'translate-x-0 bg-text-dim'
      }`} />
    </button>
  );

  const sections = [
    {
      title: 'Email Notifications',
      icon: Mail,
      items: [
        { key: 'email_new_ticket', label: 'New ticket created', desc: 'Get notified when a new ticket is created' },
        { key: 'email_ticket_assigned', label: 'Ticket assigned to you', desc: 'Get notified when a ticket is assigned to you' },
        { key: 'email_customer_reply', label: 'Customer reply', desc: 'Get notified when a customer replies to your ticket' },
        { key: 'email_sla_warning', label: 'SLA breach warning', desc: 'Get notified before an SLA is about to breach' },
        { key: 'email_ticket_resolved', label: 'Ticket resolved', desc: 'Get notified when a ticket is resolved' },
      ],
    },
    {
      title: 'Push Notifications',
      icon: Bell,
      items: [
        { key: 'push_new_ticket', label: 'New ticket created', desc: 'Browser notification for new tickets' },
        { key: 'push_ticket_assigned', label: 'Ticket assigned to you', desc: 'Browser notification for assignments' },
        { key: 'push_customer_reply', label: 'Customer reply', desc: 'Browser notification for customer replies' },
        { key: 'push_sla_warning', label: 'SLA breach warning', desc: 'Browser notification for SLA warnings' },
        { key: 'push_ticket_resolved', label: 'Ticket resolved', desc: 'Browser notification for resolved tickets' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {saved && <div className="px-3 py-2 rounded-lg bg-success-dim text-success text-sm flex items-center gap-2"><Check className="w-4 h-4" /> Notification preferences saved</div>}

      {sections.map(section => (
        <div key={section.title} className="bg-bg-card border border-border rounded-xl">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <section.icon className="w-4 h-4 text-text-muted" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold text-text">{section.title}</h2>
          </div>
          <div className="divide-y divide-border">
            {section.items.map(item => (
              <div key={item.key} className="px-6 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-text">{item.label}</p>
                  <p className="text-[12px] text-text-muted mt-0.5">{item.desc}</p>
                </div>
                <Toggle checked={(prefs as any)[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

/* ────── Appearance ────── */
function AppearanceTab() {
  const { theme, toggle } = useTheme();

  const options: { value: string; label: string; icon: typeof Sun; desc: string }[] = [
    { value: 'light', label: 'Light', icon: Sun, desc: 'Warm, paper-toned light theme' },
    { value: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes for low-light environments' },
  ];

  return (
    <div className="bg-bg-card border border-border rounded-xl">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text">Appearance</h2>
        <p className="text-xs text-text-muted mt-0.5">Customize how NexusDesk looks</p>
      </div>
      <div className="p-6">
        <label className="block text-xs font-medium text-text-muted mb-3">Theme</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { if (theme !== opt.value) toggle(); }}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                theme === opt.value
                  ? 'border-accent bg-accent-dim'
                  : 'border-border hover:border-border-light bg-bg'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                theme === opt.value ? 'bg-accent text-bg' : 'bg-bg-elevated text-text-dim'
              }`}>
                <opt.icon className="w-4.5 h-4.5" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{opt.label}</p>
                <p className="text-[12px] text-text-muted mt-0.5">{opt.desc}</p>
              </div>
              {theme === opt.value && (
                <Check className="w-4 h-4 text-accent ml-auto mt-1 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <label className="block text-xs font-medium text-text-muted mb-3">Interface density</label>
          <div className="flex gap-2">
            {['Compact', 'Default', 'Comfortable'].map((d, i) => (
              <button
                key={d}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  i === 1
                    ? 'bg-bg-elevated text-text border border-border'
                    : 'text-text-muted hover:bg-bg-hover'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-dim mt-2">Controls spacing and sizing across the interface</p>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <label className="block text-xs font-medium text-text-muted mb-3">Timezone</label>
          <select className="w-full sm:w-72 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent transition-colors">
            <option>{Intl.DateTimeFormat().resolvedOptions().timeZone}</option>
            <option>America/New_York</option>
            <option>America/Chicago</option>
            <option>America/Denver</option>
            <option>America/Los_Angeles</option>
            <option>Europe/London</option>
            <option>Europe/Berlin</option>
            <option>Asia/Tokyo</option>
            <option>Asia/Shanghai</option>
            <option>Australia/Sydney</option>
          </select>
          <p className="text-[11px] text-text-dim mt-2">All dates and times will be displayed in this timezone</p>
        </div>
      </div>
    </div>
  );
}
