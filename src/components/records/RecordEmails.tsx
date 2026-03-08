import { useState } from 'react';
import { format } from 'date-fns';
import { Send, Mail, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Email } from '@/lib/email-types';
import { useToast } from '@/hooks/use-toast';

interface EmailComposerProps {
  recipientEmail: string;
  onSend: (to: string, subject: string, body: string) => void;
}

export function EmailComposer({ recipientEmail, onSend }: EmailComposerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [to, setTo] = useState(recipientEmail);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const { toast } = useToast();

  const handleSend = () => {
    if (!to || !subject || !body) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    onSend(to, subject, body);
    setSubject('');
    setBody('');
    setIsOpen(false);
    toast({ title: 'Email sent', description: `Email sent to ${to}` });
  };

  if (!isOpen) {
    return (
      <Button size="sm" onClick={() => setIsOpen(true)} className="gap-1.5">
        <Send className="h-3.5 w-3.5" /> Compose Email
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">New Email</h4>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
      </div>
      <Input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 text-sm" />
      <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-8 text-sm" />
      <Textarea placeholder="Write your message..." value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[100px] text-sm" />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSend} className="gap-1.5">
          <Send className="h-3.5 w-3.5" /> Send
        </Button>
      </div>
    </div>
  );
}

interface EmailHistoryProps {
  emails: Email[];
}

export function EmailHistory({ emails }: EmailHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (emails.length === 0) {
    return (
      <div className="text-center py-6">
        <Mail className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No emails yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {emails
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
        .map((email) => {
          const isSent = email.direction === 'sent';
          const isExpanded = expanded === email.id;
          return (
            <div
              key={email.id}
              className="border-b border-border last:border-0 py-3 cursor-pointer hover:bg-muted/30 px-1 rounded-md transition-colors"
              onClick={() => setExpanded(isExpanded ? null : email.id)}
            >
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${isSent ? 'bg-primary/10' : 'bg-accent/10'}`}>
                  {isSent
                    ? <ArrowUpRight className="h-3 w-3 text-primary" />
                    : <ArrowDownLeft className="h-3 w-3 text-accent" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{email.subject}</span>
                    {!email.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span>{isSent ? `To: ${email.to}` : `From: ${email.from}`}</span>
                    <span>·</span>
                    <span>{format(new Date(email.sentAt), 'MMM d, h:mm a')}</span>
                  </div>
                  {isExpanded && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap leading-relaxed">{email.body}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
