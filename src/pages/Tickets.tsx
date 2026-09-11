import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import type { TicketRow, CrmUser, Account, Contact } from "../lib/types";
import {
  StatusBadge,
  PriorityBadge,
} from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Select from "../components/Select";
import { formatDate } from "../lib/dates";
import { TicketsSkeleton } from "../components/Skeleton";
import {
  Ticket as TicketIcon,
  Plus,
  Search,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

type ApiTicketsResponse = {
  success: boolean;
  tickets: any[];
};

type ApiUsersResponse = {
  success: boolean;
  users: CrmUser[];
};

type ApiAccountsResponse = {
  success: boolean;
  accounts: Account[];
};

type ApiContactsResponse = {
  success: boolean;
  contacts: Contact[];
};

type ApiCreateTicketResponse = {
  success: boolean;
  ticket: any;
};

export default function Tickets() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [agents, setAgents] = useState<CrmUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [showCreate, setShowCreate] = useState(false);

  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      if (priorityFilter) {
        params.set("priority", priorityFilter);
      }

      if (assigneeFilter) {
        params.set("assigneeId", assigneeFilter);
      }

      const response = await api.get<ApiTicketsResponse>(
        `/tickets?${params.toString()}`
      );

      const mappedTickets = response.data.tickets.map((ticket: any) => ({
        ...ticket,
        contact_name: ticket.contact?.name ?? "",
        account_name: ticket.account?.name ?? "",
        assignee_name: ticket.assignee?.name ?? "",
        created_at: ticket.createdAt,
        status: formatStatus(ticket.status),
        priority: formatPriority(ticket.priority),
      }));

      setTickets(mappedTickets);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get<ApiUsersResponse>("/users");

      setAgents(response.data.users);
    } catch (err) {
      console.error("Failed to load agents:", err);
      setAgents([]);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAgents();
  }, [statusFilter, priorityFilter, assigneeFilter]);

  const filteredTickets = tickets.filter((ticket) => {
    if (!search.trim()) return true;

    const query = search.toLowerCase();

    return (
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.id?.toLowerCase().includes(query) ||
      ticket.contact_name?.toLowerCase().includes(query) ||
      ticket.account_name?.toLowerCase().includes(query) ||
      ticket.assignee_name?.toLowerCase().includes(query)
    );
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "subject":
        aValue = a.subject ?? "";
        bValue = b.subject ?? "";
        break;

      case "status":
        aValue = a.status ?? "";
        bValue = b.status ?? "";
        break;

      case "priority":
        aValue = a.priority ?? "";
        bValue = b.priority ?? "";
        break;

      case "contact_name":
        aValue = a.contact_name ?? "";
        bValue = b.contact_name ?? "";
        break;

      case "assignee_name":
        aValue = a.assignee_name ?? "";
        bValue = b.assignee_name ?? "";
        break;

      case "created_at":
      default:
        aValue = new Date(a.created_at ?? 0).getTime();
        bValue = new Date(b.created_at ?? 0).getTime();
        break;
    }

    if (typeof aValue === "string") {
      const result = aValue.localeCompare(bValue);
      return sortDir === "asc" ? result : -result;
    }

    return sortDir === "asc" ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((direction) =>
        direction === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Tickets</h1>

          <p className="text-sm text-text-muted mt-0.5">
            {sortedTickets.length} tickets
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />

          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Status"
          className="min-w-28"
          options={[
            { value: '', label: 'All Status' },
            { value: 'NEW', label: 'New' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'WAITING', label: 'Waiting' },
            { value: 'RESOLVED', label: 'Resolved' },
          ]}
        />

        <Select
          value={priorityFilter}
          onChange={setPriorityFilter}
          placeholder="All Priority"
          className="min-w-28"
          options={[
            { value: '', label: 'All Priority' },
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
          ]}
        />

        <Select
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          placeholder="All Assignees"
          className="min-w-32"
          options={[
            { value: '', label: 'All Assignees' },
            ...agents.map((agent) => ({
              value: agent.id,
              label: agent.name,
            })),
          ]}
        />
      </div>

      {/* Table */}
      {loading ? (
        <TicketsSkeleton />
      ) : sortedTickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets found"
          description="Tickets need an account and a contact first — add one if you haven't, or adjust your filters"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/app/accounts")}
                className="px-4 py-2 bg-bg-card border border-border hover:border-accent rounded-lg text-sm font-medium text-text transition-colors"
              >
                Go to Accounts
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium"
              >
                Create Ticket
              </button>
            </div>
          }
        />
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { key: "id", label: "ID" },
                    { key: "subject", label: "Subject" },
                    { key: "status", label: "Status" },
                    { key: "priority", label: "Priority" },
                    { key: "contact_name", label: "Contact" },
                    { key: "assignee_name", label: "Assignee" },
                    { key: "created_at", label: "Created" },
                  ].map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text transition-colors"
                    >
                      <span className="inline-flex items-center gap-1">
                        {column.label}

                        {sortBy === column.key && (
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${
                              sortDir === "asc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {sortedTickets.map((ticket, index) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() =>
                      navigate(`/app/tickets/${ticket.id}`)
                    }
                    className="hover:bg-bg-hover cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-text-dim font-mono">
                      #{ticket.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text">
                        {ticket.subject}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>

                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>

                    <td className="px-4 py-3 text-sm text-text-muted">
                      {ticket.contact_name || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-text-muted">
                      {ticket.assignee_name || "Unassigned"}
                    </td>

                    <td className="px-4 py-3 text-sm text-text-dim">
                      {ticket.created_at
                        ? formatDate(ticket.created_at)
                        : "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CreateTicketModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(ticket) => {
          setTickets((current) => [ticket, ...current]);
          setShowCreate(false);
        }}
      />
    </div>
  );
}

function CreateTicketModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (ticket: TicketRow) => void;
}) {
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const [accountId, setAccountId] = useState("");
  const [contactId, setContactId] = useState("");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");

    Promise.all([
      api.get<ApiAccountsResponse>("/accounts"),
      api.get<ApiContactsResponse>("/contacts"),
    ])
      .then(([accountsResponse, contactsResponse]) => {
        setAccounts(accountsResponse.data.accounts);
        setContacts(contactsResponse.data.contacts);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load accounts and contacts.");
      });
  }, [open]);

  const availableContacts = accountId
    ? contacts.filter(
        (contact: any) => contact.accountId === accountId
      )
    : contacts;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!accountId) {
      setError("Please select an account.");
      return;
    }

    if (!contactId) {
      setError("Please select a contact.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await api.post<ApiCreateTicketResponse>(
        "/tickets",
        {
          subject: subject.trim(),
          accountId,
          contactId,
          priority,
        }
      );

      const createdTicket = response.data.ticket;

      const mappedTicket: TicketRow = {
        ...createdTicket,
        contact_name: createdTicket.contact?.name ?? "",
        account_name: createdTicket.account?.name ?? "",
        assignee_name: createdTicket.assignee?.name ?? "",
        created_at: createdTicket.createdAt,
        status: formatStatus(createdTicket.status),
        priority: formatPriority(createdTicket.priority),
      };

      setSubject("");
      setPriority("MEDIUM");
      setAccountId("");
      setContactId("");

      onCreated(mappedTicket);
    } catch (err: any) {
      console.error(err);

      const message =
        err?.message || "Failed to create ticket.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Ticket"
      wide
    >
      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Subject
          </label>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent"
            placeholder="Brief description of the issue"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Account
            </label>

            <Select
              value={accountId}
              onChange={(next) => {
                setAccountId(next);
                setContactId("");
              }}
              variant="elevated"
              placeholder="Select account..."
              className="w-full py-2.5"
              options={accounts.map((account) => ({
                value: account.id,
                label: account.name,
              }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Contact
            </label>

            <Select
              value={contactId}
              onChange={setContactId}
              disabled={!accountId}
              variant="elevated"
              placeholder={
                accountId
                  ? "Select contact..."
                  : "Select account first..."
              }
              className="w-full py-2.5"
              options={availableContacts.map((contact: any) => ({
                value: contact.id,
                label: `${contact.name} (${contact.email})`,
              }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Priority
          </label>

          <Select
            value={priority}
            onChange={setPriority}
            variant="elevated"
            className="w-full py-2.5"
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}

            Create Ticket
          </button>
        </div>
      </form>
    </Modal>
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "NEW":
      return "New";
    case "WAITING":
      return "Waiting";
    case "RESOLVED":
      return "Resolved";
    default:
      return status;
  }
}

function formatPriority(priority: string) {
  switch (priority) {
    case "LOW":
      return "Low";
    case "MEDIUM":
      return "Medium";
    case "HIGH":
      return "High";
    case "URGENT":
      return "Urgent";
    default:
      return priority;
  }
}