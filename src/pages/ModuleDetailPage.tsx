import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Filter, MoreHorizontal, Mail, Phone, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockModules, mockFields, mockRecords } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const statusColors: Record<string, string> = {
  New: 'bg-brand-blue/10 text-brand-blue',
  Contacted: 'bg-brand-purple/10 text-brand-purple',
  Qualified: 'bg-accent/10 text-accent',
  Lost: 'bg-destructive/10 text-destructive',
};

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const mod = mockModules.find((m) => m.id === moduleId);
  const fields = mockFields[moduleId || ''] || [];
  const records = mockRecords[moduleId || ''] || [];
  const [search, setSearch] = useState("");

  if (!mod) return <div className="p-6 text-muted-foreground">Module not found.</div>;

  const filtered = records.filter((r: any) => {
    const name = r.values?.full_name || r.values?.name || r.values?.deal_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/modules')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{mod.name}</h1>
          <p className="text-sm text-muted-foreground">{mod.description}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" /> Filter</Button>
          <Button size="sm" className="gradient-brand text-primary-foreground shadow-brand hover:opacity-90">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Record
          </Button>
        </div>
      </div>

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${mod.name.toLowerCase()}...`} className="max-w-sm" />

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {fields.slice(0, 5).map((f) => (
                  <th key={f.id} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec: any, i: number) => (
                <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  {fields.slice(0, 5).map((f) => {
                    const val = rec.values?.[f.fieldKey];
                    return (
                      <td key={f.id} className="px-4 py-3 text-sm text-card-foreground">
                        {f.fieldType === 'select' ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[val] || 'bg-muted text-muted-foreground'}`}>{val}</span>
                        ) : f.fieldType === 'currency' ? (
                          <span className="font-medium">${Number(val).toLocaleString()}</span>
                        ) : f.fieldType === 'email' ? (
                          <span className="text-muted-foreground">{val}</span>
                        ) : (
                          <span className={f.orderIndex === 0 ? 'font-medium' : ''}>{val || '—'}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
