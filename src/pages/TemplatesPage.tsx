import { useState } from "react";
import { motion } from "framer-motion";
import { mockTemplates } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, TrendingUp, Heart, Home, GraduationCap, Briefcase, Headphones, Megaphone, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  TrendingUp, Heart, Home, GraduationCap, Briefcase, Headphones, Megaphone, DollarSign,
};

const categories = ['All', 'Sales', 'Healthcare', 'Real Estate', 'Education', 'HR', 'Support', 'Marketing', 'Finance'];

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export default function TemplatesPage() {
  const [selected, setSelected] = useState('All');
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<Template[]>(mockTemplates as Template[]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Sales");

  const filtered = selected === 'All' ? templates : templates.filter((t) => t.category === selected);

  const handleInstall = (id: string, tplName: string) => {
    const tpl = templates.find(t => t.id === id);
    setInstalled((prev) => new Set(prev).add(id));
    const moduleNames = (tpl as any)?.modules?.map((m: any) => m.name).join(', ') || '';
    toast.success(`${tplName} installed!`, {
      description: moduleNames ? `Modules created: ${moduleNames}` : 'Template applied successfully',
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId) {
      setTemplates(templates.map(t => t.id === editingId ? { ...t, name, description: desc, category } : t));
      toast.success("Template updated");
    } else {
      setTemplates([...templates, {
        id: `tpl-${Date.now()}`, name, description: desc, category, icon: 'TrendingUp', color: 'hsl(263, 70%, 58%)', isCustom: true,
      }]);
      toast.success("Template created");
    }
    resetDialog();
  };

  const handleEdit = (tpl: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setName(tpl.name);
    setDesc(tpl.description);
    setCategory(tpl.category);
    setEditingId(tpl.id);
    setDialogOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Template deleted");
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setName("");
    setDesc("");
    setCategory("Sales");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Install industry-ready CRM templates or create your own</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-primary-foreground shadow-brand hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit Template' : 'Create Template'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="mt-1" /></div>
              <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What is this template for?" className="mt-1" /></div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full gradient-brand text-primary-foreground">{editingId ? 'Save Changes' : 'Create Template'}</Button>
            </div>
          </DialogContent>
        </Dialog>
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
              className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tpl.color}15` }}>
                  <Icon className="h-5 w-5" style={{ color: tpl.color }} />
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleEdit(tpl, e)}>
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDelete(tpl.id, e)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
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
