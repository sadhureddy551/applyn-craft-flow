import { motion } from "framer-motion";
import { Zap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const placeholderItems = [
  { title: "Auto-assign new leads", trigger: "record_created", module: "Leads", active: true },
  { title: "Notify on stage change", trigger: "stage_changed", module: "Leads", active: true },
  { title: "Send welcome email", trigger: "record_created", module: "Contacts", active: false },
];

export default function AutomationsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create workflow rules to automate your CRM</p>
        </div>
        <Button className="gradient-brand text-primary-foreground shadow-brand hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" /> New Automation
        </Button>
      </div>

      <div className="space-y-3">
        {placeholderItems.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">Trigger: {item.trigger} · Module: {item.module}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.active ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
              {item.active ? 'Active' : 'Inactive'}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
