import { useState, useCallback, useMemo } from 'react';
import { ActivityLog } from '@/lib/types';
import { AdvancedFilter, applyAdvancedFilter, createEmptyFilter } from '@/lib/filter-types';

export interface MockRecord {
  id: string;
  moduleId: string;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  stage?: string;
  values: Record<string, any>;
}

export interface MockNote {
  id: string;
  recordId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface MockFile {
  id: string;
  recordId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

type SortDirection = 'asc' | 'desc';

interface UseRecordsOptions {
  moduleId: string;
  pageSize?: number;
}

export function useRecords({ moduleId, pageSize = 10 }: UseRecordsOptions) {
  const [records, setRecords] = useState<MockRecord[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [advancedFilter, setAdvancedFilter] = useState<AdvancedFilter>(createEmptyFilter());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...records];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        Object.values(r.values).some((v) => String(v).toLowerCase().includes(q))
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((r) => String(r.values[key]) === value);
      }
    });

    if (advancedFilter.conditions.length > 0) {
      result = result.filter((r) => applyAdvancedFilter(advancedFilter, r.values));
    }

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a.values[sortField] ?? '';
        const bVal = b.values[sortField] ?? '';
        const cmp = typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [records, search, sortField, sortDir, filters, advancedFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }, [sortField]);

  const createRecord = useCallback((values: Record<string, any>) => {
    const newRecord: MockRecord = {
      id: `r-${Date.now()}`,
      moduleId,
      tenantId: 't1',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      values,
    };
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  }, [moduleId]);

  const updateRecord = useCallback((recordId: string, values: Record<string, any>) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? { ...r, values: { ...r.values, ...values }, updatedAt: new Date().toISOString() }
          : r
      )
    );
  }, []);

  const deleteRecord = useCallback((recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  }, []);

  const getRecord = useCallback((recordId: string) => {
    return records.find((r) => r.id === recordId);
  }, [records]);

  return {
    records: paginated,
    allRecords: records,
    totalCount: filtered.length,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    sortField,
    sortDir,
    toggleSort,
    filters,
    setFilters,
    advancedFilter,
    setAdvancedFilter,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecord,
  };
}

export function useRecordActivities(recordId: string) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const addActivity = useCallback((type: ActivityLog['type'], message: string) => {
    const newActivity: ActivityLog = {
      id: `a-${Date.now()}`,
      tenantId: 't1',
      recordId,
      type,
      message,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  }, [recordId]);

  return { activities, addActivity };
}

export function useRecordNotes(recordId: string) {
  const [notes, setNotes] = useState<MockNote[]>([]);

  const addNote = useCallback((content: string) => {
    const newNote: MockNote = {
      id: `n-${Date.now()}`,
      recordId,
      content,
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  }, [recordId]);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  return { notes, addNote, deleteNote };
}

export function useRecordFiles(recordId: string) {
  const [files, setFiles] = useState<MockFile[]>([]);

  const addFile = useCallback((fileName: string, fileSize: number) => {
    const newFile: MockFile = {
      id: `file-${Date.now()}`,
      recordId,
      fileName,
      fileUrl: '#',
      fileSize,
      uploadedBy: 'Current User',
      createdAt: new Date().toISOString(),
    };
    setFiles((prev) => [newFile, ...prev]);
  }, [recordId]);

  const deleteFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  return { files, addFile, deleteFile };
}
