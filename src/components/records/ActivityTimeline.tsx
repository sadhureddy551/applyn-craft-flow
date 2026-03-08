import { format } from "date-fns";
import { GitBranch, Plus, Edit3 } from "lucide-react";
import { ActivityLog } from "@/lib/types";

const typeConfig: Record<string, { icon: typeof Plus; color: string }> = {
  record_created: { icon: Plus, color: 'text-accent' },
  field_updated: { icon: Edit3, color: 'text-brand-blue' },
  stage_changed: { icon: GitBranch, color: 'text-brand-purple' },
};

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No activity yet</p>;
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, i) => {
        const config = typeConfig[activity.type] || typeConfig.record_created;
        const Icon = config.icon;
        return (
          <div key={activity.id} className="flex gap-3 py-2.5">
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0`}>
                <Icon className={`h-3 w-3 ${config.color}`} />
              </div>
              {i < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-sm text-foreground">{activity.message}</p>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{activity.createdBy}</span>
                <span>·</span>
                <span>{format(new Date(activity.createdAt), 'MMM d, h:mm a')}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
