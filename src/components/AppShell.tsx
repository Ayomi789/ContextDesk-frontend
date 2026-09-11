import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogoMark } from './Logo';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  ChevronDown,
  Settings,
  Loader2,
  UserPlus,
  CreditCard,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/app/contacts', icon: Users, label: 'Contacts' },
  { to: '/app/accounts', icon: Building2, label: 'Accounts' },
  { to: '/app/team', icon: UserPlus, label: 'Team' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  read: boolean;
  userId: string;
  ticketId: string | null;
  ticket?: {
    id: string;
    subject: string;
  } | null;
  createdAt: string;
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // -----------------------------------------
  // Load notifications
  // -----------------------------------------
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const response = await api.get<{
        success: boolean;
        notifications: Notification[];
      }>('/notifications');

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Load notifications when AppShell mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  // -----------------------------------------
  // Mark one notification as read
  // -----------------------------------------
  const markNotificationRead = async (
    notification: Notification
  ) => {
    if (notification.read) {
      // If it belongs to a ticket, still allow opening it.
      if (notification.ticketId) {
        navigate(`/app/tickets/${notification.ticketId}`);
        setNotifOpen(false);
      }

      return;
    }

    try {
      await api.patch(
        `/notifications/${notification.id}/read`
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read: true }
            : item
        )
      );

      if (notification.ticketId) {
        navigate(`/app/tickets/${notification.ticketId}`);
        setNotifOpen(false);
      }
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      );
    }
  };

  // -----------------------------------------
  // Mark all notifications as read
  // -----------------------------------------
  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      );
    }
  };

  // -----------------------------------------
  // Close dropdowns on outside click
  // -----------------------------------------
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }

      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const linkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100 ${
      isActive
        ? 'bg-bg-elevated text-text font-semibold'
        : 'text-text-muted hover:bg-bg-hover hover:text-text'
    }`;

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const formatNotificationTime = (
    createdAt: string
  ) => {
    const date = new Date(createdAt);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(
      diffMs / (1000 * 60)
    );

    if (diffMinutes < 1) {
      return 'Just now';
    }

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(
      diffMinutes / 60
    );

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(
      diffHours / 24
    );

    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/15 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-bg-card border-r border-border flex flex-col transition-transform duration-200 ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <LogoMark className="w-7 h-7" />

          <span className="text-[15px] font-semibold tracking-tight text-text">
            NexusDesk
          </span>

          <button
            className="ml-auto lg:hidden text-text-muted"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {[
            ...navItems,
            ...(user?.role === 'ADMIN'
              ? [
                  {
                    to: '/app/billing',
                    icon: CreditCard,
                    label: 'Billing',
                  },
                ]
              : []),
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className="w-4 h-4"
                strokeWidth={1.8}
              />

              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2.5 pb-3">
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-text-muted hover:bg-bg-hover hover:text-text transition-all duration-100"
          >
            {theme === 'light' ? (
              <Moon
                className="w-4 h-4"
                strokeWidth={1.8}
              />
            ) : (
              <Sun
                className="w-4 h-4"
                strokeWidth={1.8}
              />
            )}

            {theme === 'light'
              ? 'Dark mode'
              : 'Light mode'}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-bg-card">
          <div className="flex items-center">
            <button
              className="lg:hidden mr-3 text-text-muted hover:text-text transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Help center */}
            <a
              href="https://help.nexusdesk.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.preventDefault()}
              className="p-2 rounded-lg text-text-dim hover:text-text hover:bg-bg-hover transition-colors"
              title="Help Center"
            >
              <HelpCircle
                className="w-[18px] h-[18px]"
                strokeWidth={1.7}
              />
            </a>

            {/* Notifications */}
            <div
              ref={notifRef}
              className="relative"
            >
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setAccountOpen(false);

                  // Refresh notifications whenever
                  // the dropdown is opened.
                  if (!notifOpen) {
                    fetchNotifications();
                  }
                }}
                className="p-2 rounded-lg text-text-dim hover:text-text hover:bg-bg-hover transition-colors relative"
                title="Notifications"
              >
                <Bell
                  className="w-[18px] h-[18px]"
                  strokeWidth={1.7}
                />

                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 4,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 4,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.12,
                    }}
                    className="absolute right-0 top-full mt-1.5 w-80 bg-bg-card border border-border rounded-xl shadow-lg shadow-black/8 overflow-hidden z-50"
                  >
                    {/* Notification header */}
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-text">
                        Notifications
                      </span>

                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <span className="text-[11px] text-text-dim">
                            {unreadCount} new
                          </span>
                        )}

                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-[11px] font-medium text-accent hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification list */}
                    <div className="divide-y divide-border max-h-72 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-5 h-5 mx-auto text-text-dim mb-2" />

                          <p className="text-[12px] text-text-muted">
                            No notifications
                          </p>
                        </div>
                      ) : (
                        notifications.map(
                          (notification) => (
                            <button
                              key={notification.id}
                              onClick={() =>
                                markNotificationRead(
                                  notification
                                )
                              }
                              className={`w-full text-left px-4 py-3 hover:bg-bg-hover transition-colors cursor-pointer ${
                                !notification.read
                                  ? 'bg-bg-elevated/50'
                                  : ''
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                {!notification.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 flex-shrink-0" />
                                )}

                                <div
                                  className={
                                    notification.read
                                      ? 'pl-4'
                                      : ''
                                  }
                                >
                                  <p className="text-[13px] font-medium text-text">
                                    {notification.title}
                                  </p>

                                  <p className="text-[12px] text-text-muted mt-0.5 line-clamp-1">
                                    {
                                      notification.description
                                    }
                                  </p>

                                  <p className="text-[11px] text-text-dim mt-1">
                                    {formatNotificationTime(
                                      notification.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                            </button>
                          )
                        )
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-border">
                      <button
                        onClick={() =>
                          setNotifOpen(false)
                        }
                        className="text-[12px] font-medium text-text-muted hover:text-text transition-colors w-full text-center"
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-border mx-1.5" />

            {/* Account dropdown */}
            <div
              ref={accountRef}
              className="relative"
            >
              <button
                onClick={() => {
                  setAccountOpen(!accountOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted text-xs font-semibold">
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-medium text-text leading-tight truncate max-w-[120px]">
                    {user?.name}
                  </p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-text-dim transition-transform ${
                    accountOpen
                      ? 'rotate-180'
                      : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 4,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 4,
                      scale: 0.97,
                    }}
                    transition={{
                      duration: 0.12,
                    }}
                    className="absolute right-0 top-full mt-1.5 w-56 bg-bg-card border border-border rounded-xl shadow-lg shadow-black/8 overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-[13px] font-medium text-text">
                        {user?.name}
                      </p>

                      <p className="text-[12px] text-text-muted truncate">
                        {user?.email}
                      </p>

                      <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-bg-elevated text-text-dim border border-border">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1.5">
                      <button
                        onClick={toggle}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
                      >
                        {theme === 'light' ? (
                          <Moon
                            className="w-4 h-4"
                            strokeWidth={1.7}
                          />
                        ) : (
                          <Sun
                            className="w-4 h-4"
                            strokeWidth={1.7}
                          />
                        )}

                        {theme === 'light'
                          ? 'Dark mode'
                          : 'Light mode'}
                      </button>

                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          navigate(
                            '/app/settings'
                          );
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
                      >
                        <Settings
                          className="w-4 h-4"
                          strokeWidth={1.7}
                        />
                        Settings
                      </button>

                      <button
                        onClick={() => {
                          setAccountOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-text-muted hover:text-text hover:bg-bg-hover transition-colors"
                      >
                        <HelpCircle
                          className="w-4 h-4"
                          strokeWidth={1.7}
                        />
                        Help & Support
                      </button>
                    </div>

                    <div className="border-t border-border py-1.5">
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-[13px] text-danger hover:bg-danger-dim transition-colors"
                      >
                        <LogOut
                          className="w-4 h-4"
                          strokeWidth={1.7}
                        />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}