import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  color: string;
  position: number;
}

export interface Pipeline {
  id: string;
  tenantId: string;
  moduleId: string;
  name: string;
  stages: PipelineStage[];
}

function mapStage(row: any): PipelineStage {
  return {
    id: row.id,
    pipelineId: row.pipeline_id,
    name: row.name,
    color: row.color,
    position: row.position,
  };
}

export function usePipelines(moduleId?: string) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const tenantId = profile?.tenant_id || 't1';

  const fetchPipelines = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('pipelines').select('*');
    if (moduleId) query = query.eq('module_id', moduleId);
    const { data: pipelineRows } = await query;

    if (!pipelineRows || pipelineRows.length === 0) {
      setPipelines([]);
      setLoading(false);
      return;
    }

    const ids = pipelineRows.map((p: any) => p.id);
    const { data: stageRows } = await supabase
      .from('pipeline_stages')
      .select('*')
      .in('pipeline_id', ids)
      .order('position', { ascending: true });

    const result: Pipeline[] = pipelineRows.map((p: any) => ({
      id: p.id,
      tenantId: p.tenant_id,
      moduleId: p.module_id,
      name: p.name,
      stages: (stageRows || []).filter((s: any) => s.pipeline_id === p.id).map(mapStage),
    }));

    setPipelines(result);
    setLoading(false);
  }, [moduleId]);

  useEffect(() => { fetchPipelines(); }, [fetchPipelines]);

  const createPipeline = useCallback(async (name: string, modId: string, stages: { name: string; color: string }[]) => {
    const { data: row, error } = await supabase
      .from('pipelines')
      .insert({ name, module_id: modId, tenant_id: tenantId } as any)
      .select()
      .single();
    if (error || !row) return;

    const stageInserts = stages.map((s, i) => ({
      pipeline_id: row.id,
      name: s.name,
      color: s.color,
      position: i,
    }));
    await supabase.from('pipeline_stages').insert(stageInserts as any);
    await fetchPipelines();
  }, [tenantId, fetchPipelines]);

  const updatePipeline = useCallback(async (pipelineId: string, name: string, stages: { name: string; color: string }[]) => {
    await supabase.from('pipelines').update({ name } as any).eq('id', pipelineId);
    // Replace stages: delete old, insert new
    await supabase.from('pipeline_stages').delete().eq('pipeline_id', pipelineId);
    const stageInserts = stages.map((s, i) => ({
      pipeline_id: pipelineId,
      name: s.name,
      color: s.color,
      position: i,
    }));
    await supabase.from('pipeline_stages').insert(stageInserts as any);
    await fetchPipelines();
  }, [fetchPipelines]);

  const deletePipeline = useCallback(async (pipelineId: string) => {
    await supabase.from('pipelines').delete().eq('id', pipelineId);
    setPipelines((prev) => prev.filter((p) => p.id !== pipelineId));
  }, []);

  return { pipelines, loading, createPipeline, updatePipeline, deletePipeline, refetch: fetchPipelines };
}
