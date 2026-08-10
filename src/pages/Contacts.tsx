import { useEffect, useState } from "react";
import api from "../lib/api";
import type { Contact, Account } from "../lib/types";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Edit3,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

type ContactsResponse = {
  success: boolean;
  contacts: Contact[];
};

type AccountsResponse = {
  success: boolean;
  accounts: Account[];
};

type ContactResponse = {
  success: boolean;
  contact: Contact;
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<ContactsResponse>("/contacts");

      if (response.data.success) {
        setContacts(response.data.contacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response =
        await api.get<AccountsResponse>("/accounts");

      if (response.data.success) {
        setAccounts(response.data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setAccounts([]);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchAccounts();
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.account?.name?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;

    try {
      await api.delete(`/contacts/${id}`);

      setContacts((current) =>
        current.filter((contact) => contact.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const handleSaved = (contact: Contact) => {
    if (editingContact) {
      setContacts((current) =>
        current.map((item) =>
          item.id === contact.id ? contact : item
        )
      );
    } else {
      setContacts((current) => [contact, ...current]);
    }

    setShowModal(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Contacts
          </h1>

          <p className="text-sm text-text-muted mt-0.5">
            {contacts.length}{" "}
            {contacts.length === 1 ? "contact" : "contacts"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingContact(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />

        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={
            search
              ? "No matching contacts"
              : "No contacts found"
          }
          description={
            search
              ? "Try a different search."
              : "Add your first contact to get started."
          }
          action={
            !search ? (
              <button
                type="button"
                onClick={() => {
                  setEditingContact(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-light transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted text-sm font-semibold shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {contact.name}
                    </p>

                    <p className="text-xs text-text-muted truncate">
                      {contact.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingContact(contact);
                      setShowModal(true);
                    }}
                    className="p-1.5 text-text-dim hover:text-text hover:bg-bg-hover rounded transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 text-text-dim hover:text-danger hover:bg-danger-dim rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {contact.account && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-text-dim">
                    Account:{" "}
                  </span>

                  <span className="text-xs text-text-muted font-medium">
                    {contact.account.name}
                  </span>
                </div>
              )}

              {contact.notes && (
                <p className="text-xs text-text-dim mt-2 line-clamp-2">
                  {contact.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <ContactModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingContact(null);
        }}
        onSaved={handleSaved}
        contact={editingContact}
        accounts={accounts}
      />
    </div>
  );
}

function ContactModal({
  open,
  onClose,
  onSaved,
  contact,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (contact: Contact) => void;
  contact: Contact | null;
  accounts: Account[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (contact) {
      setName(contact.name);
      setEmail(contact.email);
      setAccountId(contact.accountId);
      setNotes(contact.notes || "");
    } else {
      setName("");
      setEmail("");
      setAccountId("");
      setNotes("");
    }

    setError("");
  }, [contact, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!accountId) {
      setError("Please select an account");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        accountId,
        notes: notes.trim() || undefined,
      };

      let response;

      if (contact) {
        response = await api.patch<ContactResponse>(
          `/contacts/${contact.id}`,
          payload
        );
      } else {
        response = await api.post<ContactResponse>(
          "/contacts",
          payload
        );
      }

      if (!response.data.success) {
        throw new Error("Failed to save contact");
      }

      onSaved(response.data.contact);
    } catch (error: any) {
      console.error("Failed to save contact:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save contact"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? "Edit Contact" : "Add Contact"}
    >
      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-danger-dim text-danger text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@company.com"
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Account
          </label>

          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
          >
            <option value="">Select an account</option>

            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes..."
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}

            {contact ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}