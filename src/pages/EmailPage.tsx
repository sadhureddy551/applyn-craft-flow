import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Inbox, Star, Trash2, Search, Plus, ArrowLeft, Paperclip, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockEmails, mockEmailConnection } from "@/lib/mock-emails";
import { Email } from "@/lib/email-types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Folder = 'inbox' | 'sent' | 'starred';

export default function EmailPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [folder, setFolder] = useState<Folder>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const filtered = emails.filter(e => {
    if (folder === 'inbox') return e.direction === 'received';
    if (folder === 'sent') return e.direction === 'sent';
    if (folder === 'starred') return starred.has(e.id);
    return true;
  }).filter(e =>
    e.subject.toLowerCase().includes(search.toLowerCase()) ||
    e.from.toLowerCase().includes(search.toLowerCase()) ||
    e.to.toLowerCase().includes(search.toLowerCase())
  );

  const selected = emails.find(e => e.id === selectedId);

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) return;
    const newEmail: Email = {
      id: `em-${Date.now()}`, tenantId: 't1', recordId: '',
      subject, body, direction: 'sent',
      from: mockEmailConnection.email, to,
      sentAt: new Date().toISOString(), isRead: true,
    };
    setEmails([newEmail, ...emails]);
    setTo(""); setSubject(""); setBody("");
    setComposeOpen(false);
    toast.success("Email sent");
  };

  const handleDelete = (id: string) => {
    setEmails(emails.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success("Email deleted");
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarred(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markRead = (id: string) => {
    setEmails(emails.map(e => e.id === id ? { ...e, isRead: true } : e));
    setSelectedId(id);
  };

  const folders: { key: Folder; label: string; icon: any; count: number }[] = [
    { key: 'inbox', label: 'Inbox', icon: Inbox, count: emails.filter(e => e.direction === 'received' && !e.isRead).length },
    { key: 'sent', label: 'Sent', icon: Send, count: 0 },
    { key: 'starred', label: 'Starred', icon: Star, count: starred.size },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-56 border-r border-border bg-card p-3 space-y-1 shrink-0">
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gradient-brand text-primary-foreground shadow-brand hover:opacity-90 mb-3">
              <Plus className="h-4 w-4 mr-2" /> Compose
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Email</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div><Label>To</Label><Input value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@email.com" className="mt-1" /></div>
              <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject" className="mt-1" /></div>
              <div><Label>Message</Label><Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your email..." className="mt-1 min-h-[150px]" /></div>
              <Button onClick={handleSend} className="w-full gradient-brand text-primary-foreground"><Send className="h-4 w-4 mr-2" />Send Email</Button>
            </div>
          </DialogContent>
        </Dialog>

        {folders.map(f => (
          <button
            key={f.key}
            onClick={() => { setFolder(f.key); setSelectedId(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              folder === f.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <f.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{f.label}</span>
            {f.count > 0 && <Badge variant="secondary" className="h-5 min-w-[20px] text-[10px] px-1.5">{f.count}</Badge>}
          </button>
        ))}

        <div className="pt-4 border-t border-border mt-4">
          <div className="px-3 py-2 rounded-lg bg-muted/30">
            <p className="text-xs font-medium text-foreground">{mockEmailConnection.email}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{mockEmailConnection.provider} • Connected</p>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-w-0 border-r border-border`}>
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emails..." className="pl-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No emails found</p>
            </div>
          ) : (
            filtered.map((email, i) => (
              <motion.button
                key={email.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => markRead(email.id)}
                className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors ${
                  selectedId === email.id ? 'bg-primary/5' : ''
                } ${!email.isRead ? 'bg-primary/[0.03]' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <button onClick={(e) => toggleStar(email.id, e)} className="shrink-0 mt-0.5">
                    <Star className={`h-4 w-4 ${starred.has(email.id) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${!email.isRead ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                        {email.direction === 'received' ? email.from : `To: ${email.to}`}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(email.sentAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{email.subject}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{email.body}</p>
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Email Detail */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 p-3 border-b border-border">
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSelectedId(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm font-semibold text-foreground flex-1 truncate">{selected.subject}</h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(selected.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-5">
            <div className="max-w-2xl">
              <div className="flex items-start gap-3 mb-6">
                <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">
                    {(selected.direction === 'received' ? selected.from : selected.to).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selected.direction === 'received' ? selected.from : `To: ${selected.to}`}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(selected.sentAt).toLocaleString()}
                  </p>
                </div>
                {selected.direction === 'sent' && (
                  <Badge variant="outline" className="text-[10px] ml-auto">Sent</Badge>
                )}
              </div>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.body}</div>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Select an email to read</p>
          </div>
        </div>
      )}
    </div>
  );
}
