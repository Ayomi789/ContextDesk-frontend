import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { CrmUser } from '../lib/types';
import EmptyState from '../components/EmptyState';
import Select from '../components/Select';
import { formatDate } from '../lib/dates';
import {
  Users,
  Plus,
  Loader2,
  Trash2,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

export default function Team() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [members, setMembers] = useState<CrmUser[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('AGENT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, invitesRes] = await Promise.all([
        api.get<{ success: boolean; users: CrmUser[] }>('/users'),
        isAdmin
          ? api.get<{ success: boolean; invitations: Invitation[] }>(
              '/invitations'
            )
          : Promise.resolve({ data: { invitations: [] } }),
      ]);
      setMembers(usersRes.data.users);
      setInvites(invitesRes.data.invitations || []);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSaving(true);
    setError('');
    setInviteLink('');
    try {
      const response = await api.post<{
        success: boolean;
        invitation: Invitation & { inviteLink?: string };
      }>('/invitations', {
        email: email.trim(),
        role,
      });
      setEmail('');
      if (response.data.invitation.inviteLink) {
        setInviteLink(
          `Share this link: ${response.data.invitation.inviteLink}`
        );
      }
      fetchAll();
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/invitations/${id}`);
      setInvites((current) =>
        current.filter((invite) => invite.id !== id)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to revoke invite');
    }
  };

  const handleRoleChange = async (
    member: CrmUser,
    nextRole: string
  ) => {
    if (member.role === nextRole) return;
    try {
      const response = await api.patch<{
        success: boolean;
        user: CrmUser;
      }>(`/users/${member.id}/role`, { role: nextRole });
      setMembers((current) =>
        current.map((m) =>
          m.id === member.id ? response.data.user : m
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(
      inviteLink.replace('Share this link: ', '')
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [copiedIntake, setCopiedIntake] = useState(false);
  const intakeLink = user?.organization?.slug
    ? `${window.location.origin}/intake/${user.organization.slug}`
    : '';

  const copyIntakeLink = async () => {
    if (!intakeLink) return;
    await navigator.clipboard.writeText(intakeLink);
    setCopiedIntake(true);
    setTimeout(() => setCopiedIntake(false), 2000);
  };

  if (!isAdmin) {
    return (
      <EmptyState
        icon={Shield}
        title="Admins only"
        description="Only workspace admins can manage the team"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Team</h1>
        <p className="text-sm text-text-muted mt-1">
          {user?.organization?.name || 'Your workspace'} · invite people
          to handle tickets together
        </p>
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">
          {error}
        </div>
      )}

      {/* Public intake link */}
      {intakeLink && (
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text mb-1">
            Public support form
          </h3>
          <p className="text-xs text-text-muted mb-3">
            Share this link anywhere — complaints arrive as tickets,
            no login needed
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-lg text-xs text-text-muted truncate">
              {intakeLink}
            </code>
            <button
              onClick={copyIntakeLink}
              className="p-2 text-text-muted hover:text-text transition-colors"
              title="Copy intake link"
            >
              {copiedIntake ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Invite */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite a teammate
        </h3>
        <form
          onSubmit={handleInvite}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            className="flex-1 px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent"
          />
          <Select
            value={role}
            onChange={setRole}
            variant="elevated"
            className="min-w-28"
            options={[
              { value: 'AGENT', label: 'Agent' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Send invite
          </button>
        </form>
        {inviteLink && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-info-dim text-info text-xs flex items-center gap-2 break-all">
            <span className="flex-1">{inviteLink}</span>
            <button
              onClick={copyLink}
              className="p-1 hover:opacity-70 flex-shrink-0"
              title="Copy invite link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text mb-3">
            Pending invites ({invites.length})
          </h3>
          <div className="divide-y divide-border">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="py-2.5 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {invite.email}
                  </p>
                  <p className="text-xs text-text-dim">
                    {invite.role} · expires {formatDate(invite.expiresAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(invite.id)}
                  className="p-2 text-text-muted hover:text-danger transition-colors"
                  title="Revoke invite"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Members ({members.length})
        </h3>
        {loading ? (
          <div aria-label="Loading members">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-2.5 flex items-center gap-3">
                <div aria-hidden className="skeleton w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div aria-hidden className="skeleton h-4 w-40 rounded mb-1.5" />
                  <div aria-hidden className="skeleton h-3 w-52 rounded" />
                </div>
                <div aria-hidden className="skeleton h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="py-2.5 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted text-sm font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {member.name}
                    {member.id === user?.id && (
                      <span className="text-xs text-text-dim ml-2">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-dim truncate">
                    {member.email}
                  </p>
                </div>
                <Select
                  value={member.role}
                  onChange={(next) => handleRoleChange(member, next)}
                  disabled={member.id === user?.id}
                  variant="elevated"
                  className="min-w-24 py-1.5 text-xs"
                  options={[
                    { value: 'AGENT', label: 'Agent' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
