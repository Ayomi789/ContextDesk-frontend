import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import type {
  Ticket,
  Message,
  Contact,
  Account,
  CrmUser,
} from '../lib/types';
import {
  StatusBadge,
  PriorityBadge,
  TagBadge,
} from '../components/StatusBadge';
import {
  Send,
  Wand2,
  Loader2,
  Lock,
  Globe,
  User,
  Building2,
  Clock,
  AlertTriangle,
  Tag,
  Edit3,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [prevTickets, setPrevTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<CrmUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editTags, setEditTags] = useState('');

  const messagesEnd = useRef<HTMLDivElement | null>(null);

  const [saving, setSaving] = useState(false);
  const fetchAll = async () => {
    if (!id) return;

    setLoading(true);

    try {
      // Load the ticket first.
      // A failure here means the ticket itself could not be loaded.
      const ticketResponse = await api.get<{
        success: boolean;
        ticket: Ticket & {
          prevTickets?: Ticket[];
        };
      }>(`/tickets/${id}`);

      const t = ticketResponse.data.ticket;

      setTicket(t);
      setPrevTickets(t.prevTickets || []);

      setEditStatus(t.status);
      setEditPriority(t.priority);
      setEditAssignee(t.assigneeId || '');
      setEditTags((t.tags || []).join(', '));

      // Load messages separately.
      // If messages fail, the ticket should still display.
      try {
        const messageResponse = await api.get<{
          success: boolean;
          messages: Message[];
        }>(`/messages/tickets/${id}`);

        setMessages(messageResponse.data.messages);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setMessages([]);
      }

      // Load agents separately.
      // /users is currently not wired in the backend,
      // so a 404 here must not break the ticket page.
      try {
        const agentsResponse = await api.get<{
          success: boolean;
          users: CrmUser[];
        }>('/users');

        setAgents(agentsResponse.data.users);
      } catch (err) {
        console.error('Failed to load agents:', err);
        setAgents([]);
      }

      // Load contact separately.
      if (t.contactId) {
        try {
          const contactResponse = await api.get<{
            success: boolean;
            contact: Contact;
          }>(`/contacts/${t.contactId}`);

          setContact(contactResponse.data.contact);
        } catch (err) {
          console.error('Failed to load contact:', err);
          setContact(null);
        }
      } else {
        setContact(null);
      }

      // Load account separately.
      if (t.accountId) {
        try {
          const accountResponse = await api.get<{
            success: boolean;
            account: Account;
          }>(`/accounts/${t.accountId}`);

          setAccount(accountResponse.data.account);
        } catch (err) {
          console.error('Failed to load account:', err);
          setAccount(null);
        }
      } else {
        setAccount(null);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !id) return;

    setSending(true);

    try {
      await api.post('/messages', {
        ticketId: id,
        body: reply,
        isInternalNote: isInternal,
      });

      setReply('');

      const response = await api.get<{
        success: boolean;
        messages: Message[];
      }>(`/messages/tickets/${id}`);

      setMessages(response.data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const draftAiReply = async () => {
    if (!id) return;

    setDrafting(true);

    try {
      const response = await api.post<{ draft: string }>('/ai-draft', {
        ticketId: id,
      });

      setReply(response.data.draft);
    } catch (err: any) {
      setReply(`[AI Draft unavailable: ${err.message}]`);
    } finally {
      setDrafting(false);
    }
  };

  
  const updateTicket = async () => {
    if (!id || saving) return;

    setSaving(true);

    try {
      const response = await api.patch<{
        success: boolean;
        ticket: Ticket;
      }>(`/tickets/${id}`, {
        status: editStatus,
        priority: editPriority,
        assigneeId: editAssignee || undefined,
      });

      const updatedTicket = response.data.ticket;

      setTicket(updatedTicket);
      setEditStatus(updatedTicket.status);
      setEditPriority(updatedTicket.priority);
      setEditAssignee(updatedTicket.assigneeId || '');

      setEditing(false);
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-sm text-text-muted">
          Ticket not found
        </p>

        <button
          onClick={() => navigate('/app/tickets')}
          className="mt-3 text-sm text-accent hover:underline"
        >
          Back to tickets
        </button>
      </div>
    );
  }

  const slaDate = ticket.slaDueAt
    ? new Date(ticket.slaDueAt)
    : null;

  const slaAtRisk =
    slaDate &&
    slaDate < new Date() &&
    ticket.status !== 'RESOLVED';

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate('/app/tickets')}
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
      >
        Back to tickets
      </button>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Main thread */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header */}
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-text">
                  {ticket.subject}
                </h1>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-text-dim font-mono">
                    #{ticket.id}
                  </span>

                  <StatusBadge status={ticket.status} />

                  <PriorityBadge priority={ticket.priority} />

                  {ticket.tags?.map((tag) => (
                    <TagBadge
                      key={tag}
                      label={tag}
                    />
                  ))}

                  {slaAtRisk && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-dim text-danger">
                      <AlertTriangle className="w-3 h-3" />
                      SLA Breached
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setEditing(!editing)}
                className="p-2 text-text-muted hover:text-text hover:bg-bg-hover rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Edit ticket */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="grid grid-cols-2 gap-3">
                  {/* STATUS */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Status
                    </label>

                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value)
                      }
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">
                        In Progress
                      </option>
                      <option value="WAITING">Waiting</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>

                  {/* PRIORITY */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Priority
                    </label>

                    <select
                      value={editPriority}
                      onChange={(e) =>
                        setEditPriority(e.target.value)
                      }
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  {/* ASSIGNEE */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Assignee
                    </label>

                    <select
                      value={editAssignee}
                      onChange={(e) =>
                        setEditAssignee(e.target.value)
                      }
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                    >
                      <option value="">
                        Unassigned
                      </option>

                      {agents.map((agent) => (
                        <option
                          key={agent.id}
                          value={agent.id}
                        >
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TAGS */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1">
                      Tags
                    </label>

                    <input
                      value={editTags}
                      onChange={(e) =>
                        setEditTags(e.target.value)
                      }
                      placeholder="billing, urgent"
                      className="w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 text-sm text-text-muted hover:text-text"
                  >
                    Cancel
                  </button>

                  <button
                      onClick={updateTicket}
                      disabled={saving}
                      className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-bg-card border border-border rounded-xl">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-text">
                Conversation
              </h3>
            </div>

            <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.03,
                  }}
                  className={`p-4 ${
                    message.isInternalNote
                      ? 'bg-warning-dim/30'
                      : ''
                  }`}
                >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted text-xs font-semibold">
                    {message.senderType === 'CUSTOMER'
                      ? 'C'
                      : message.author?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>

                  <span className="text-sm font-medium text-text">
                    {message.senderType === 'CUSTOMER'
                      ? 'Customer'
                      : message.author?.name || 'Agent'}
                  </span>

                  {message.senderType === 'CUSTOMER' && (
                    <span className="text-xs text-text-dim">
                      Customer
                    </span>
                  )}

                  {message.isInternalNote && (
                    <span className="inline-flex items-center gap-1 text-xs text-warning">
                      <Lock className="w-3 h-3" />
                      Internal
                    </span>
                  )}

                  <span className="text-xs text-text-dim ml-auto">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>

                  <p className="text-sm text-text-muted whitespace-pre-wrap pl-9">
                    {message.body}
                  </p>
                </motion.div>
              ))}

              <div ref={messagesEnd} />
            </div>

            {/* Reply */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsInternal(false)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    !isInternal
                      ? 'bg-accent text-bg'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  Reply
                </button>

                <button
                  onClick={() => setIsInternal(true)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    isInternal
                      ? 'bg-warning-dim text-warning border border-warning/30'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  Internal Note
                </button>

                <button
                  onClick={draftAiReply}
                  disabled={drafting}
                  className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-bg-elevated text-text-muted border border-border hover:text-text transition-colors disabled:opacity-50"
                >
                  {drafting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}

                  AI Draft
                </button>
              </div>

              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent resize-none"
                placeholder={
                  isInternal
                    ? 'Write an internal note...'
                    : 'Type your reply...'
                }
              />

              <div className="flex justify-end mt-2">
                <button
                  onClick={sendReply}
                  disabled={
                    sending ||
                    !reply.trim()
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}

                  {isInternal
                    ? 'Add Note'
                    : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Contact */}
          {contact && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Contact
              </h3>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">
                  {contact.name}
                </p>

                <p className="text-xs text-text-muted">
                  {contact.email}
                </p>

                {contact.notes && (
                  <p className="text-xs text-text-dim mt-2">
                    {contact.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Account */}
          {account && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                Account
              </h3>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text">
                  {account.name}
                </p>

                <p className="text-xs text-text-muted">
                  {account.domain}
                </p>

                {account.tier && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-elevated text-text-muted border border-border">
                    {account.tier}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* SLA */}
          {slaDate && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                SLA
              </h3>

              <p
                className={`text-sm font-medium ${
                  slaAtRisk
                    ? 'text-danger'
                    : 'text-success'
                }`}
              >
                Due: {slaDate.toLocaleString()}
              </p>

              <p className="text-xs text-text-dim mt-1">
                {slaAtRisk
                  ? 'SLA has been breached'
                  : 'Within SLA window'}
              </p>
            </div>
          )}

          {/* Previous Tickets */}
          {prevTickets.length > 0 && (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Other Tickets ({prevTickets.length})
              </h3>

              <div className="space-y-2">
                {prevTickets
                  .slice(0, 5)
                  .map((previousTicket) => (
                    <Link
                      key={previousTicket.id}
                      to={`/app/tickets/${previousTicket.id}`}
                      className="block p-2 rounded-lg hover:bg-bg-hover transition-colors"
                    >
                      <div className="text-xs font-medium text-text truncate">
                        {previousTicket.subject}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge
                          status={previousTicket.status}
                        />

                        <span className="text-[10px] text-text-dim">
                          #{previousTicket.id}
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}