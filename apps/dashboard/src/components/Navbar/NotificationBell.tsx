import { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error";

export interface Notification {
  readonly id: string;
  readonly title: string;
  readonly message?: string;
  readonly type: NotificationType;
  readonly read: boolean;
  readonly createdAt: string;
  readonly href?: string;
}

export interface NotificationBellProps {
  readonly pollInterval?: number;
  readonly endpoint?: string;
  readonly onNotificationClick?: (notification: Notification) => void;
}

async function fetchNotifications(
  endpoint: string,
): Promise<Notification[]> {
  try {
    const response = await apiClient.get<{ data: Notification[] }>(endpoint);
    return Array.isArray(response?.data) ? response.data : [];
  } catch {
    return [];
  }
}

export function NotificationBell({
  pollInterval = 30000,
  endpoint = "api/v1/notifications",
  onNotificationClick,
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const data = await fetchNotifications(endpoint);
      if (mounted) {
        setNotifications(data);
      }
    };

    void load();

    const interval = setInterval(() => {
      void load();
    }, pollInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [endpoint, pollInterval]);

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleClick = (notification: Notification) => {
    handleMarkRead(notification.id);
    onNotificationClick?.(notification);
    setOpen(false);
  };

  const typeColors: Record<NotificationType, string> = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 2a6 6 0 00-6 6c0 1.5-.5 3-1.5 4.5l.5 3.5h14l.5-3.5C17.5 11 17 9.5 17 8a6 6 0 00-6-6zM8 16a2 2 0 004 0H8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg border border-gray-700 bg-gray-800 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleClick(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-700 ${
                    !notification.read ? "bg-gray-700/50" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${typeColors[notification.type]}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {notification.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}