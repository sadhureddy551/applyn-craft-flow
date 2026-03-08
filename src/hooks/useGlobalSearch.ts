import { useMemo } from 'react';
import { mockModules, mockRecords, mockFields } from '@/lib/mock-data';

export interface SearchResult {
  id: string;
  moduleId: string;
  moduleName: string;
  title: string;
  subtitle: string;
  link: string;
}

export function useGlobalSearch(query: string) {
  return useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const mod of mockModules) {
      const records = mockRecords[mod.id] || [];
      const fields = mockFields[mod.id] || [];
      const nameField = fields[0]?.fieldKey;

      for (const rec of records) {
        const matchesAny = Object.values(rec.values).some(v => String(v).toLowerCase().includes(q));
        if (!matchesAny) continue;

        const title = nameField ? String(rec.values[nameField] || 'Untitled') : 'Untitled';
        const subtitleParts = fields.slice(1, 3).map(f => rec.values[f.fieldKey]).filter(Boolean);

        results.push({
          id: rec.id,
          moduleId: mod.id,
          moduleName: mod.name,
          title,
          subtitle: subtitleParts.join(' · '),
          link: `/modules/${mod.id}/records/${rec.id}`,
        });
      }
    }

    // Also match module names
    for (const mod of mockModules) {
      if (mod.name.toLowerCase().includes(q)) {
        results.push({
          id: `mod-${mod.id}`,
          moduleId: mod.id,
          moduleName: mod.name,
          title: mod.name,
          subtitle: mod.description,
          link: `/modules/${mod.id}`,
        });
      }
    }

    return results;
  }, [query]);
}

export function groupResultsByModule(results: SearchResult[]) {
  const groups = new Map<string, { moduleName: string; results: SearchResult[] }>();
  for (const r of results) {
    if (!groups.has(r.moduleId)) groups.set(r.moduleId, { moduleName: r.moduleName, results: [] });
    groups.get(r.moduleId)!.results.push(r);
  }
  return Array.from(groups.values());
}
