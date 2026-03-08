import { useState } from "react";
import { motion } from "framer-motion";
import { mockPipelines, mockRecords } from "@/lib/mock-data";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pipeline, PipelineStage } from "@/lib/types";

const DEFAULT_COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines as Pipeline[]);
  const [activePipelineId, setActivePipelineId] = useState(pipelines[0]?.id || '');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [stages, setStages] = useState<{ name: string; color: string }[]>([
    { name: "New", color: DEFAULT_COLORS[0] },
    { name: "In Progress", color: DEFAULT_COLORS[1] },
    { name: "Done", color: DEFAULT_COLORS[3] },
  ]);

  const activePipeline = pipelines.find(p => p.id === activePipelineId);
  const records = mockRecords['1'] || [];
  const [recordStages, setRecordStages] = useState<Record<string, string>>(
    Object.fromEntries(records.map((r: any) => [r.id, r.stage]))
  );

  const getRecordsForStage = (stageName: string) =>
    records.filter((r: any) => recordStages[r.id] === stageName);

  const handleDragStart = (recordId: string) => setDraggedId(recordId);
  const handleDrop = (stageName: string) => {
    if (draggedId) {
      setRecordStages((prev) => ({ ...prev, [draggedId]: stageName }));
      setDraggedId(null);
    }
  };

  const handleSave = () => {
    if (!name.trim() || stages.length === 0) return;
    const pipelineStages: PipelineStage[] = stages.map((s, i) => ({
      id: `stg-${Date.now()}-${i}`, stageName: s.name, color: s.color, order: i,
    }));
    if (editingId) {
      setPipelines(pipelines.map(p => p.id === editingId ? { ...p, name, stages: pipelineStages } : p));
      toast.success("Pipeline updated");
    } else {
      const newPipeline: Pipeline = { id: `pip-${Date.now()}`, name, moduleId: '1', stages: pipelineStages };
      setPipelines([...pipelines, newPipeline]);
      setActivePipelineId(newPipeline.id);
      toast.success("Pipeline created");
    }
    resetDialog();
  };

  const handleEdit = (pipeline: Pipeline) => {
    setName(pipeline.name);
    setStages(pipeline.stages.map(s => ({ name: s.stageName, color: s.color })));
    setEditingId(pipeline.id);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPipelines(pipelines.filter(p => p.id !== id));
    if (activePipelineId === id) setActivePipelineId(pipelines[0]?.id || '');
    toast.success("Pipeline deleted");
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setName("");
    setStages([
      { name: "New", color: DEFAULT_COLORS[0] },
      { name: "In Progress", color: DEFAULT_COLORS[1] },
      { name: "Done", color: DEFAULT_COLORS[3] },
    ]);
  };

  const addStage = () => setStages([...stages, { name: "", color: DEFAULT_COLORS[stages.length % DEFAULT_COLORS.length] }]);
  const removeStage = (i: number) => setStages(stages.filter((_, idx) => idx !== i));
  const updateStage = (i: number, field: 'name' | 'color', value: string) =>
    setStages(stages.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage sales pipelines and stages</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-primary-foreground shadow-brand hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> New Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingId ? 'Edit Pipeline' : 'Create Pipeline'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Pipeline Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales Pipeline" className="mt-1" /></div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Stages</Label>
                  <Button variant="outline" size="sm" onClick={addStage}><Plus className="h-3 w-3 mr-1" />Add Stage</Button>
                </div>
                <div className="space-y-2">
                  {stages.map((stage, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input type="color" value={stage.color} onChange={(e) => updateStage(i, 'color', e.target.value)} className="h-8 w-8 rounded border-0 cursor-pointer shrink-0" />
                      <Input value={stage.name} onChange={(e) => updateStage(i, 'name', e.target.value)} placeholder="Stage name" className="flex-1" />
                      {stages.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeStage(i)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full gradient-brand text-primary-foreground">{editingId ? 'Save Changes' : 'Create Pipeline'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipeline tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {pipelines.map(p => (
          <div key={p.id} className="flex items-center gap-1">
            <button
              onClick={() => setActivePipelineId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePipelineId === p.id ? 'gradient-brand text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.name}
            </button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(p)}>
              <Edit className="h-3 w-3 text-muted-foreground" />
            </Button>
            {pipelines.length > 1 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Kanban */}
      {activePipeline && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {activePipeline.stages.map((stage, si) => {
            const stageRecords = getRecordsForStage(stage.stageName);
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.05 }}
                className="flex-shrink-0 w-72"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.stageName)}
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="text-sm font-semibold text-foreground">{stage.stageName}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{stageRecords.length}</span>
                </div>
                <div className="space-y-2 min-h-[200px] p-2 rounded-xl bg-muted/30 border border-border/50">
                  {stageRecords.map((rec: any) => (
                    <div
                      key={rec.id}
                      draggable
                      onDragStart={() => handleDragStart(rec.id)}
                      className="rounded-lg border border-border bg-card p-3.5 shadow-card hover:shadow-card-hover transition-shadow cursor-grab active:cursor-grabbing"
                    >
                      <p className="text-sm font-medium text-card-foreground">{rec.values.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.values.company}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium text-accent">${Number(rec.values.value).toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">{rec.values.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
