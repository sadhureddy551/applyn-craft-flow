import { useState } from "react";
import { motion } from "framer-motion";
import { mockTemplates } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, Heart, Home, GraduationCap, Briefcase, Headphones, Megaphone, DollarSign } from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  TrendingUp, Heart, Home, GraduationCap, Briefcase, Headphones, Megaphone, DollarSign,
};

const categories = ['All', 'Sales', 'Healthcare', 'Real Estate', 'Education', 'HR', 'Support', 'Marketing', 'Finance'];

export default function TemplatesPage() {
  const [selected, setSelected] = useState('All');
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  const filtered = selected === 'All' ? mockTemplates : mockTemplates.filter((t) => t.category === selected);

  const handleInstall = (id: string, name: string) => {
    setInstalled((prev) => new Set(prev).add(id));
    toast.success(`${name} template installed!`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Templates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Install industry-ready CRM templates to get started fast</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selected === c ? 'gradient-brand text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((tpl, i) => {
          const Icon = iconMap[tpl.icon] || TrendingUp;
          const isInstalled = installed.has(tpl.id);
          return (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tpl.color}15` }}>
                <Icon className="h-5 w-5" style={{ color: tpl.color }} />
              </div>
              <h3 className="text-base font-semibold text-card-foreground mt-3">{tpl.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tpl.description}</p>
              <span className="inline-block mt-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{tpl.category}</span>
              <Button
                onClick={() => handleInstall(tpl.id, tpl.name)}
                disabled={isInstalled}
                variant={isInstalled ? "outline" : "default"}
                size="sm"
                className={`w-full mt-4 ${!isInstalled ? 'gradient-brand text-primary-foreground shadow-brand hover:opacity-90' : ''}`}
              >
                {isInstalled ? <><Check className="h-3.5 w-3.5 mr-1.5" /> Installed</> : 'Install Template'}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
