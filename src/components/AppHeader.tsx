import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Check, X, UserPlus, GitBranch, Zap, FileText, CheckSquare, ArrowRight } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationType } from '@/lib/notification-types';
import { useGlobalSearch, groupResultsByModule } from '@/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<NotificationType, any> = {
  task_assigned: CheckSquare,
  record_assigned: UserPlus,
  stage_changed: GitBranch,
  automation_event: Zap,
  form_submitted: FileText,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  task_assigned: 'bg-blue-500/10 text-blue-600',
  record_assigned: 'bg-violet-500/10 text-violet-600',
  stage_changed: 'bg-amber-500/10 text-amber-600',
  automation_event: 'bg-emerald-500/10 text-emerald-600',
  form_submitted: 'bg-rose-500/10 text-rose-600',
};

export function AppHeader() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useGlobalSearch(query);
  const grouped = groupResultsByModule(results);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (link: string) => {
    navigate(link);
    setQuery('');
    setSearchOpen(false);
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      {/* Search */}
      <div className="flex-1 max-w-lg relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search records, modules... ⌘K"
            className="pl-9 pr-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => query.length >= 2 && setSearchOpen(true)}
          />
          {query && (
            <button onClick={() => { setQuery(''); setSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {searchOpen && query.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <ScrollArea className="max-h-[400px]">
              {results.length === 0 ? (
                <div className="py-10 text-center">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                </div>
              ) : (
                <div className="py-1">
                  {grouped.map((group) => (
                    <div key={group.moduleName}>
                      <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">{group.moduleName}</div>
                      {group.results.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSelect(r.link)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{r.title.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-popover-foreground truncate">{r.title}</p>
                            {r.subtitle && <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className="px-3 py-2 border-t border-border/50 text-[11px] text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} found</div>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="flex items-center gap-2 ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />Mark all read
                </button>
              )}
            </div>
            <ScrollArea className="max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center"><Bell className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-sm text-muted-foreground">No notifications</p></div>
              ) : (
                <div>
                  {notifications.map(n => {
                    const Icon = TYPE_ICONS[n.type];
                    const colorClass = TYPE_COLORS[n.type];
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors cursor-pointer hover:bg-muted/50 ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
                        onClick={() => { markAsRead(n.id); if (n.link) navigate(n.link); }}
                      >
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}><Icon className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                          <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted"><X className="h-3 w-3" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
