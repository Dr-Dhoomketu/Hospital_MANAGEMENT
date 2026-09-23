import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useListNotifications } from '@workspace/api-client-react';
import { PageIntro } from '@/components/DashboardShared';

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

export default function NotificationsPage() {
  const query = useListNotifications();
  const [read, setRead] = useState<Set<string>>(new Set());
  const notifs = query.data ?? [];
  const unread = notifs.filter(n => !n.read && !read.has(n.id)).length;

  const markAllRead = () => setRead(new Set(notifs.map(n => n.id)));
  const markOne = (id: string) => setRead(prev => new Set([...prev, id]));

  return (
    <>
      <PageIntro eyebrow="INBOX" title="Notifications"
        description={`${unread} unread operational alerts. Mark items once the right team has seen them.`}
        action="Mark all read" onAction={markAllRead} />

      <div className="rounded-xl border border-border bg-card p-4 soft-shadow">
        <div className="space-y-2">
          {notifs.map(item => {
            const isRead = item.read || read.has(item.id);
            return (
              <div key={item.id} className={`flex gap-4 rounded-xl border p-4 transition ${isRead ? 'border-border bg-card' : 'border-primary/20 bg-secondary/35'}`}>
                <div className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${isRead ? 'bg-muted text-muted-foreground' : 'bg-accent text-accent-foreground'}`}>
                  <Bell size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold">{item.title}</h3>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground capitalize">{item.type}</span>
                    {!isRead && (
                      <button onClick={() => markOne(item.id)} className="text-xs font-semibold text-primary hover:underline">
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {notifs.length === 0 && (
            <div className="py-14 text-center text-sm text-muted-foreground">No notifications</div>
          )}
        </div>
      </div>
    </>
  );
}
