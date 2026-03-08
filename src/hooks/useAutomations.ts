import { useState, useCallback } from 'react';
import { Automation, AutomationCondition, AutomationAction } from '@/lib/automation-types';
import { mockAutomations } from '@/lib/mock-automations';

export function useAutomations() {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations);

  const createAutomation = useCallback((data: Omit<Automation, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
    const newAuto: Automation = {
      ...data,
      id: `auto-${Date.now()}`,
      tenantId: 't1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAutomations((prev) => [newAuto, ...prev]);
    return newAuto;
  }, []);

  const updateAutomation = useCallback((id: string, updates: Partial<Automation>) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const deleteAutomation = useCallback((id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleActive = useCallback((id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const getAutomation = useCallback((id: string) => automations.find((a) => a.id === id), [automations]);

  const addCondition = useCallback((autoId: string, condition: AutomationCondition) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === autoId ? { ...a, conditionsJSON: [...a.conditionsJSON, condition], updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const removeCondition = useCallback((autoId: string, conditionId: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === autoId ? { ...a, conditionsJSON: a.conditionsJSON.filter((c) => c.id !== conditionId), updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const addAction = useCallback((autoId: string, action: AutomationAction) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === autoId ? { ...a, actionsJSON: [...a.actionsJSON, action], updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  const removeAction = useCallback((autoId: string, actionId: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === autoId ? { ...a, actionsJSON: a.actionsJSON.filter((ac) => ac.id !== actionId), updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  return {
    automations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleActive,
    getAutomation,
    addCondition,
    removeCondition,
    addAction,
    removeAction,
  };
}
