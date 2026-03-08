import { useState, useCallback } from 'react';

export interface Tag {
  id: string;
  tenantId: string;
  name: string;
  color: string; // HSL-based tailwind token key
}

export interface RecordTag {
  id: string;
  recordId: string;
  tagId: string;
}

const TAG_COLORS = [
  { key: 'blue', bg: 'bg-brand-blue/10', text: 'text-brand-blue', dot: 'bg-brand-blue' },
  { key: 'purple', bg: 'bg-brand-purple/10', text: 'text-brand-purple', dot: 'bg-brand-purple' },
  { key: 'green', bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
  { key: 'red', bg: 'bg-destructive/10', text: 'text-destructive', dot: 'bg-destructive' },
  { key: 'amber', bg: 'bg-[hsl(38,92%,50%)]/10', text: 'text-[hsl(38,92%,50%)]', dot: 'bg-[hsl(38,92%,50%)]' },
  { key: 'indigo', bg: 'bg-brand-indigo/10', text: 'text-brand-indigo', dot: 'bg-brand-indigo' },
];

export function getTagColorClasses(colorKey: string) {
  return TAG_COLORS.find((c) => c.key === colorKey) || TAG_COLORS[0];
}

export { TAG_COLORS };

const defaultTags: Tag[] = [
  { id: 'tag-1', tenantId: 't1', name: 'VIP', color: 'purple' },
  { id: 'tag-2', tenantId: 't1', name: 'Follow Up', color: 'amber' },
  { id: 'tag-3', tenantId: 't1', name: 'Urgent', color: 'red' },
  { id: 'tag-4', tenantId: 't1', name: 'Partner', color: 'blue' },
  { id: 'tag-5', tenantId: 't1', name: 'Enterprise', color: 'green' },
];

const defaultRecordTags: RecordTag[] = [
  { id: 'rt-1', recordId: 'r1', tagId: 'tag-1' },
  { id: 'rt-2', recordId: 'r1', tagId: 'tag-3' },
  { id: 'rt-3', recordId: 'r2', tagId: 'tag-2' },
  { id: 'rt-4', recordId: 'r3', tagId: 'tag-5' },
  { id: 'rt-5', recordId: 'r4', tagId: 'tag-4' },
];

// Singleton state so tags persist across hook instances
let globalTags = [...defaultTags];
let globalRecordTags = [...defaultRecordTags];
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export function useTags() {
  const [, forceUpdate] = useState(0);

  // Subscribe to global changes
  useState(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  });

  const tags = globalTags;
  const recordTags = globalRecordTags;

  const createTag = useCallback((name: string, color: string): Tag => {
    const tag: Tag = { id: `tag-${Date.now()}`, tenantId: 't1', name, color };
    globalTags = [...globalTags, tag];
    notify();
    return tag;
  }, []);

  const deleteTag = useCallback((tagId: string) => {
    globalTags = globalTags.filter((t) => t.id !== tagId);
    globalRecordTags = globalRecordTags.filter((rt) => rt.tagId !== tagId);
    notify();
  }, []);

  const assignTag = useCallback((recordId: string, tagId: string) => {
    if (globalRecordTags.some((rt) => rt.recordId === recordId && rt.tagId === tagId)) return;
    globalRecordTags = [...globalRecordTags, { id: `rt-${Date.now()}`, recordId, tagId }];
    notify();
  }, []);

  const removeTag = useCallback((recordId: string, tagId: string) => {
    globalRecordTags = globalRecordTags.filter((rt) => !(rt.recordId === recordId && rt.tagId === tagId));
    notify();
  }, []);

  const getRecordTags = useCallback((recordId: string): Tag[] => {
    const tagIds = globalRecordTags.filter((rt) => rt.recordId === recordId).map((rt) => rt.tagId);
    return globalTags.filter((t) => tagIds.includes(t.id));
  }, []);

  return { tags, recordTags, createTag, deleteTag, assignTag, removeTag, getRecordTags };
}
