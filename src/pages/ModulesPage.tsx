import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Boxes, Users, Contact, Handshake, CheckSquare, Building2, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockModules, mockRecords, mockFields } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, any> = {
  Users, Contact, Handshake, CheckSquare, Building2, Boxes,
};

export default function ModulesPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState(mockModules);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = modules.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    setModules([...modules, {
      id: `m-${Date.now()}`, tenantId: 't1', name: newName, slug, icon: 'Boxes',
      description: newDesc, isSystem: false, orderIndex: modules.length,
    }]);
    setNewName("");
    setNewDesc("");
    setDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modules</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create and manage your CRM modules</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-primary-foreground shadow-brand hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> New Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Module</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Patients, Properties..." className="mt-1" />
                {newName && <p className="text-xs text-muted-foreground mt-1">Slug: {newName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}</p>}
              </div>
              <div>
                <Label>Description</Label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="What does this module track?" className="mt-1" />
              </div>
              <Button onClick={handleCreate} className="w-full gradient-brand text-primary-foreground">Create Module</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((mod, i) => {
          const Icon = iconMap[mod.icon] || Boxes;
          const recordCount = mockRecords[mod.id]?.length || 0;
          const fieldCount = mockFields[mod.id]?.length || 0;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/modules/${mod.id}`)}
              className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {mod.isSystem && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">System</span>
                )}
              </div>
              <h3 className="text-base font-semibold text-card-foreground mt-3">{mod.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mod.description}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span>{fieldCount} fields</span>
                <span>{recordCount} records</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
