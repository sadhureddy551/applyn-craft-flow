import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Filter, MoreHorizontal, Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockModules, mockFields } from "@/lib/mock-data";
import { useRecords } from "@/hooks/useRecords";
import { RecordCreateDialog } from "@/components/records/RecordCreateDialog";
import { RecordDeleteDialog } from "@/components/records/RecordDeleteDialog";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  New: 'bg-brand-blue/10 text-brand-blue',
  Contacted: 'bg-brand-purple/10 text-brand-purple',
  Qualified: 'bg-accent/10 text-accent',
  Lost: 'bg-destructive/10 text-destructive',
  Proposal: 'bg-brand-purple/10 text-brand-purple',
  Discovery: 'bg-brand-blue/10 text-brand-blue',
  Negotiation: 'bg-accent/10 text-accent',
  'Closed Won': 'bg-accent/10 text-accent',
  'Closed Lost': 'bg-destructive/10 text-destructive',
};

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const mod = mockModules.find((m) => m.id === moduleId);
  const fields = mockFields[moduleId || ''] || [];

  const {
    records, totalCount, page, totalPages, setPage,
    search, setSearch, sortField, sortDir, toggleSort,
    filters, setFilters, createRecord, deleteRecord,
  } = useRecords({ moduleId: moduleId || '', pageSize: 10 });

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (!mod) return <div className="p-6 text-muted-foreground">Module not found.</div>;

  const selectFields = fields.filter((f) => f.fieldType === 'select');
  const displayFields = fields.slice(0, 5);
  const nameField = fields[0];

  const getRecordName = (rec: any) => {
    return rec.values?.[nameField?.fieldKey] || 'Untitled';
  };

  const handleCreate = (values: Record<string, any>) => {
    createRecord(values);
    toast({ title: "Record created", description: `New ${mod.name.toLowerCase().slice(0, -1)} has been created.` });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteRecord(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "Record deleted", description: "The record has been deleted." });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/modules')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{mod.name}</h1>
          <p className="text-sm text-muted-foreground">{totalCount} records</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter
            {Object.values(filters).filter(Boolean).length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {Object.values(filters).filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button size="sm" className="gradient-brand text-primary-foreground shadow-brand hover:opacity-90" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Record
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${mod.name.toLowerCase()}...`} className="pl-9" />
        </div>
        {showFilters && selectFields.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-wrap gap-3 items-center">
            {selectFields.map((f) => (
              <div key={f.id} className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-medium">{f.label}:</span>
                <Select value={filters[f.fieldKey] || 'all'} onValueChange={(v) => setFilters({ ...filters, [f.fieldKey]: v === 'all' ? '' : v })}>
                  <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {f.options?.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {Object.values(filters).some(Boolean) && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setFilters({})}>
                <X className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {displayFields.map((f) => (
                  <th
                    key={f.id}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                    onClick={() => toggleSort(f.fieldKey)}
                  >
                    <span className="flex items-center gap-1">
                      {f.label}
                      {sortField === f.fieldKey && (
                        sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  {displayFields.map((f) => {
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/modules/${moduleId}/records/${rec.id}`)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/modules/${moduleId}/records/${rec.id}`)}>
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget({ id: rec.id, name: getRecordName(rec) })}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={displayFields.length + 1} className="px-4 py-12 text-center text-muted-foreground">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, totalCount)} of {totalCount}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? 'default' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <RecordCreateDialog open={createOpen} onOpenChange={setCreateOpen} fields={fields} onSubmit={handleCreate} moduleName={mod.name} />
      {deleteTarget && (
        <RecordDeleteDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} recordName={deleteTarget.name} onConfirm={handleDelete} />
      )}
    </div>
  );
}
