import { format } from "date-fns";
import { GitBranch, Plus, Edit3, ArrowUpRight, ArrowDownLeft, MessageCircle } from "lucide-react";
import { ActivityLog } from "@/lib/types";
import { Email } from "@/lib/email-types";
import { WhatsAppMessage } from "@/lib/whatsapp-types";

type TimelineItem =
  | { kind: 'activity'; data: ActivityLog; date: Date }
  | { kind: 'email'; data: Email; date: Date }
  | { kind: 'whatsapp'; data: WhatsAppMessage; date: Date };

const typeConfig: Record<string, { icon: typeof Plus; color: string }> = {
  record_created: { icon: Plus, color: 'text-accent' },
  field_updated: { icon: Edit3, color: 'text-brand-blue' },
  stage_changed: { icon: GitBranch, color: 'text-brand-purple' },
};

interface ActivityTimelineProps {
  activities: ActivityLog[];
  emails?: Email[];
  whatsAppMessages?: WhatsAppMessage[];
}

export function ActivityTimeline({ activities, emails = [], whatsAppMessages = [] }: ActivityTimelineProps) {
  const items: TimelineItem[] = [
    ...activities.map((a) => ({ kind: 'activity' as const, data: a, date: new Date(a.createdAt) })),
    ...emails.map((e) => ({ kind: 'email' as const, data: e, date: new Date(e.sentAt) })),
    ...whatsAppMessages.map((m) => ({ kind: 'whatsapp' as const, data: m, date: new Date(m.sentAt) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No activity yet</p>;
  }

  return (
    <div className="space-y-0">
      {items.map((item, i) => {
        if (item.kind === 'email') {
          const email = item.data;
          const isSent = email.direction === 'sent';
          return (
            <div key={email.id} className="flex gap-3 py-2.5">
              <div className="flex flex-col items-center">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${isSent ? 'bg-primary/10' : 'bg-accent/10'}`}>
                  {isSent ? <ArrowUpRight className="h-3 w-3 text-primary" /> : <ArrowDownLeft className="h-3 w-3 text-accent" />}
                </div>
                {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm text-foreground">
                  {isSent ? 'Sent' : 'Received'} email: <span className="font-medium">{email.subject}</span>
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{isSent ? `To: ${email.to}` : `From: ${email.from}`}</span>
                  <span>·</span>
                  <span>{format(item.date, 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </div>
          );
        }

        if (item.kind === 'whatsapp') {
          const msg = item.data;
          return (
            <div key={msg.id} className="flex gap-3 py-2.5">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-3 w-3 text-green-600" />
                </div>
                {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm text-foreground line-clamp-1">
                  WhatsApp to {msg.phone}: <span className="font-medium">{msg.message}</span>
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{msg.status}</span>
                  <span>·</span>
                  <span>{format(item.date, 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </div>
          );
        }

        const activity = item.data as ActivityLog;
        const config = typeConfig[activity.type] || typeConfig.record_created;
        const Icon = config.icon;
        return (
          <div key={activity.id} className="flex gap-3 py-2.5">
            <div className="flex flex-col items-center">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Icon className={`h-3 w-3 ${config.color}`} />
              </div>
              {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-sm text-foreground">{activity.message}</p>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{activity.createdBy}</span>
                <span>·</span>
                <span>{format(item.date, 'MMM d, h:mm a')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
