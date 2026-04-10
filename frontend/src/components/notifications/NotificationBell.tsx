import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Target, FileText, MessageSquare, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { t } from '@/i18n';
import notificationsService, { type Notification } from '@/services/notifications.service';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return t.notifications.justNow;
  if (diffMin < 60) return t.notifications.minutesAgo.replace('{n}', String(diffMin));
  if (diffHours < 24) return t.notifications.hoursAgo.replace('{n}', String(diffHours));
  return t.notifications.daysAgo.replace('{n}', String(diffDays));
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'campaign_completed':
      return <Target className="h-4 w-4 text-green-600" />;
    case 'offer_submitted':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'approval_request':
      return <ShieldCheck className="h-4 w-4 text-amber-600" />;
    case 'comment_mention':
      return <MessageSquare className="h-4 w-4 text-purple-600" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function getEntityRoute(entityType?: string, entityId?: string): string | null {
  if (!entityType || !entityId) return null;
  switch (entityType) {
    case 'campaign': return `/campaigns/${entityId}`;
    case 'supplier': return `/suppliers`;
    case 'rfq': return `/rfqs`;
    case 'approval': return `/settings`;
    default: return null;
  }
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Poll unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently fail - notification count is non-critical
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when popover opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setLoading(true);
      try {
        const data = await notificationsService.getAll();
        setNotifications(data);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        // Silently fail
      }
    }

    // Navigate to entity
    const route = getEntityRoute(notification.entityType, notification.entityId);
    if (route) {
      setOpen(false);
      navigate(route);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const hasUnread = unreadCount > 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={t.notifications.title}
        >
          <Bell className="h-4.5 w-4.5" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">{t.notifications.title}</h3>
          {unreadNotifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t.notifications.markAllRead}
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{t.notifications.noNotifications}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t.notifications.allCaughtUp}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 border-b last:border-b-0',
                  !notification.read && 'bg-primary/5'
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm leading-tight',
                    !notification.read ? 'font-medium' : 'text-muted-foreground'
                  )}>
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground/60 mt-1">
                    {getTimeAgo(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <div className="mt-1.5 shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
