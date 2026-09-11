import { useEffect, useState } from "react";
import api from "../lib/api";
import type { Account } from "../lib/types";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Select from "../components/Select";
import { formatDate } from "../lib/dates";
import { CardsGridSkeleton } from "../components/Skeleton";
import {
  Building2,
  Plus,
  Search,
  Loader2,
  Globe,
  Edit3,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

type AccountsResponse = {
  success: boolean;
  accounts: Account[];
};

type AccountResponse = {
  success: boolean;
  account: Account;
};

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<Account | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);

      const response = await api.get<AccountsResponse>("/accounts");

      if (response.data.success) {
        setAccounts(response.data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      account.name.toLowerCase().includes(query) ||
      account.domain.toLowerCase().includes(query) ||
      account.tier.toLowerCase().includes(query)
    );
  });

  const openCreateModal = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleSaved = (account: Account) => {
    setAccounts((current) => {
      const exists = current.some(
        (item) => item.id === account.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === account.id ? account : item
        );
      }

      return [account, ...current];
    });

    setShowModal(false);
    setEditingAccount(null);
  };

  const handleDelete = async (account: Account) => {
    const confirmed = window.confirm(
      `Delete "${account.name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/accounts/${account.id}`);

      setAccounts((current) =>
        current.filter((item) => item.id !== account.id)
      );
    } catch (error: any) {
      console.error("Failed to delete account:", error);

      window.alert(
        error?.message || "Failed to delete account"
      );
    }
  };

  const tierClasses: Record<string, string> = {
    Free: "bg-bg-hover text-text-muted",
    Starter: "bg-info-dim text-info",
    Pro: "bg-info-dim text-info",
    Enterprise: "bg-success-dim text-success",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">
            Accounts
          </h1>

          <p className="text-sm text-text-muted mt-0.5">
            {accounts.length}{" "}
            {accounts.length === 1 ? "account" : "accounts"}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />

        <input
          type="text"
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text placeholder-text-dim focus:outline-none focus:border-accent"
        />
      </div>

      {/* Content */}
      {loading ? (
        <CardsGridSkeleton />
      ) : filteredAccounts.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={
            search
              ? "No matching accounts"
              : "No accounts found"
          }
          description={
            search
              ? "Try a different search."
              : "Add your first account to get started."
          }
          action={
            !search ? (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-bg rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Account
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-bg-card border border-border rounded-xl p-4 hover:border-border-light transition-colors"
            >
              {/* Account header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-text-dim" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {account.name}
                    </p>

                    <div className="flex items-center gap-1 mt-1">
                      <Globe className="w-3 h-3 text-text-dim shrink-0" />

                      <p className="text-xs text-text-muted truncate">
                        {account.domain}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(account)}
                    className="p-1.5 text-text-dim hover:text-text hover:bg-bg-hover rounded transition-colors"
                    title="Edit account"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(account)}
                    className="p-1.5 text-text-dim hover:text-danger hover:bg-danger-dim rounded transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Account metadata */}
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    tierClasses[account.tier] ||
                    "bg-bg-hover text-text-muted"
                  }`}
                >
                  {account.tier}
                </span>

                <span className="text-xs text-text-dim">
                  {formatDate(account.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AccountModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingAccount(null);
        }}
        onSaved={handleSaved}
        account={editingAccount}
      />
    </div>
  );
}

function AccountModal({
  open,
  onClose,
  onSaved,
  account,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (account: Account) => void;
  account: Account | null;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [tier, setTier] = useState("Starter");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editing = Boolean(account);

  useEffect(() => {
    if (!open) return;

    if (account) {
      setName(account.name);
      setDomain(account.domain);
      setTier(account.tier);
    } else {
      setName("");
      setDomain("");
      setTier("Starter");
    }

    setError("");
  }, [open, account]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Company name is required");
      return;
    }

    if (!domain.trim()) {
      setError("Domain is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (account) {
        const response = await api.patch<AccountResponse>(
          `/accounts/${account.id}`,
          {
            name: name.trim(),
            domain: domain.trim(),
            tier,
          }
        );

        onSaved(response.data.account);
      } else {
        const response = await api.post<AccountResponse>(
          "/accounts",
          {
            name: name.trim(),
            domain: domain.trim(),
            tier,
          }
        );

        onSaved(response.data.account);
      }
    } catch (error: any) {
      console.error(
        `Failed to ${editing ? "update" : "create"} account:`,
        error
      );

      setError(
        error?.message ||
          `Failed to ${editing ? "update" : "create"} account`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Account" : "Add Account"}
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
            Company Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Inc."
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Domain
          </label>

          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="acme.com"
            className="w-full px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Tier
          </label>

          <Select
            value={tier}
            onChange={setTier}
            variant="elevated"
            className="w-full py-2.5"
            options={[
              { value: 'Free', label: 'Free' },
              { value: 'Starter', label: 'Starter' },
              { value: 'Pro', label: 'Pro' },
              { value: 'Enterprise', label: 'Enterprise' },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-text-muted hover:text-text disabled:opacity-50"
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

            {editing ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}