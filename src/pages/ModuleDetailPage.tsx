import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockModules, mockFields } from "@/lib/mock-data";
import { useRecords } from "@/hooks/useRecords";
import { useModuleViews } from "@/hooks/useModuleViews";
import { useLeadScores } from "@/hooks/useLeadScores";
import { RecordCreateDialog } from "@/components/records/RecordCreateDialog";
import { RecordDeleteDialog } from "@/components/records/RecordDeleteDialog";
import { DuplicateWarningDialog, DuplicateMatch } from "@/components/records/DuplicateWarningDialog";
import { useDuplicateDetection } from "@/hooks/useDuplicateDetection";
import { ViewSwitcher } from "@/components/views/ViewSwitcher";
import { TableView } from "@/components/views/TableView";
import { KanbanView } from "@/components/views/KanbanView";
import { CalendarView } from "@/components/views/CalendarView";
import { ListView } from "@/components/views/ListView";
import { useToast } from "@/hooks/use-toast";

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const mod = mockModules.find((m) => m.id === moduleId);
  const fields = mockFields[moduleId || ''] || [];

  const {
    records, allRecords, totalCount, page, totalPages, setPage,
    search, setSearch, sortField, sortDir, toggleSort,
    filters, setFilters, createRecord, updateRecord, deleteRecord,
  } = useRecords({ moduleId: moduleId || '', pageSize: 10 });

  const {
    views, activeView, activeViewId, setActiveViewId,
    createView, deleteView, updateViewConfig,
  } = useModuleViews(moduleId || '');

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ duplicates: DuplicateMatch[]; pendingValues: Record<string, any> } | null>(null);

  const scores = useLeadScores(allRecords);
  const { findDuplicates } = useDuplicateDetection(allRecords, fields);

  // Apply saved view filters when switching views
  useEffect(() => {
    if (activeView?.configJSON?.filters) {
      setFilters(activeView.configJSON.filters);
    } else {
      setFilters({});
    }
    if (activeView?.configJSON?.sortField) {
      // Apply saved sort (handled via toggleSort would reset, so we leave as-is for now)
    }
  }, [activeViewId]);

  if (!mod) return <div className="p-6 text-muted-foreground">Module not found.</div>;

  const selectFields = fields.filter((f) => f.fieldType === 'select');
  const nameField = fields[0];

  const handleCreate = (values: Record<string, any>) => {
    const duplicates = findDuplicates(values);
    if (duplicates.length > 0) {
      setCreateOpen(false);
      setDuplicateWarning({ duplicates, pendingValues: values });
      return;
    }
    createRecord(values);
    toast({ title: "Record created", description: `New ${mod.name.toLowerCase().slice(0, -1)} has been created.` });
  };

  const handleIgnoreDuplicate = () => {
    if (!duplicateWarning) return;
    createRecord(duplicateWarning.pendingValues);
    setDuplicateWarning(null);
    toast({ title: "Record created", description: "Record created (duplicate ignored)." });
  };

  const handleMerge = (targetRecordId: string) => {
    if (!duplicateWarning) return;
    // Merge: update existing record with non-empty new values
    const mergedValues: Record<string, any> = {};
    for (const [key, val] of Object.entries(duplicateWarning.pendingValues)) {
      if (val !== undefined && val !== '' && val !== null) {
        mergedValues[key] = val;
      }
    }
    updateRecord(targetRecordId, mergedValues);
    setDuplicateWarning(null);
    toast({ title: "Records merged", description: "New data has been merged into the existing record." });
  };

  const handleViewDuplicate = (recordId: string) => {
    setDuplicateWarning(null);
    navigate(`/modules/${moduleId}/records/${recordId}`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteRecord(deleteTarget.id);
    setDeleteTarget(null);
    toast({ title: "Record deleted", description: "The record has been deleted." });
  };

  const handleView = (recordId: string) => {
    navigate(`/modules/${moduleId}/records/${recordId}`);
  };

  const handleDeletePrompt = (recordId: string, name: string) => {
    setDeleteTarget({ id: recordId, name });
  };

  const viewType = activeView?.viewType || 'table';
  // For kanban/calendar/list, use all filtered records (no pagination)
  const viewRecords = viewType === 'table' ? records : allRecords.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return Object.values(r.values).some((v) => String(v).toLowerCase().includes(q));
  }).filter((r) => {
    return Object.entries(filters).every(([key, val]) => !val || String(r.values[key]) === val);
  });

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

      {/* View Switcher */}
      <ViewSwitcher
        views={views}
        activeViewId={activeViewId}
        onSwitch={setActiveViewId}
        onCreate={(name, type) => {
          createView(name, type, { filters: { ...filters } });
          toast({ title: "View created", description: `"${name}" view has been created.` });
        }}
        onDelete={(viewId) => {
          deleteView(viewId);
          toast({ title: "View deleted" });
        }}
      />

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

      {/* View Content */}
      {viewType === 'table' && (
        <TableView
          records={records}
          fields={fields}
          sortField={sortField}
          sortDir={sortDir}
          onSort={toggleSort}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
          onView={handleView}
          onDelete={handleDeletePrompt}
          visibleColumns={activeView?.configJSON?.visibleColumns}
          onVisibleColumnsChange={(cols) => updateViewConfig(activeViewId, { visibleColumns: cols })}
          scores={scores}
        />
      )}

      {viewType === 'kanban' && (
        <KanbanView
          records={viewRecords}
          fields={fields}
          moduleId={moduleId || ''}
          onView={handleView}
          onDelete={handleDeletePrompt}
          onUpdateRecord={updateRecord}
          scores={scores}
        />
      )}

      {viewType === 'calendar' && (
        <CalendarView
          records={viewRecords}
          fields={fields}
          onView={handleView}
        />
      )}

      {viewType === 'list' && (
        <ListView
          records={viewRecords}
          fields={fields}
          onView={handleView}
          onDelete={handleDeletePrompt}
          scores={scores}
        />
      )}

      {/* Dialogs */}
      <RecordCreateDialog open={createOpen} onOpenChange={setCreateOpen} fields={fields} onSubmit={handleCreate} moduleName={mod.name} />
      {deleteTarget && (
        <RecordDeleteDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} recordName={deleteTarget.name} onConfirm={handleDelete} />
      )}
    </div>
  );
}
