import { useState } from "react";
import { motion } from "framer-motion";
import { mockPipelines, mockRecords } from "@/lib/mock-data";

export default function PipelinesPage() {
  const pipeline = mockPipelines[0];
  const records = mockRecords['1'] || [];
  const [draggedId, setDraggedId] = useState<string | null>(null);
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

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{pipeline.name} — Drag cards between stages</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipeline.stages.map((stage, si) => {
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
    </div>
  );
}
