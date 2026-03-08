import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Role, RolePermission, UserRole, PermissionAction, RoleWithPermissions } from '@/lib/rbac-types';

// Current user context (mock for now, replace with auth)
const CURRENT_USER_ID = 'user-1';
const CURRENT_TENANT_ID = 't1';

export function useRBAC() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, rpRes, urRes] = await Promise.all([
        supabase.from('roles').select('*').eq('tenant_id', CURRENT_TENANT_ID),
        supabase.from('role_permissions').select('*'),
        supabase.from('user_roles').select('*').eq('tenant_id', CURRENT_TENANT_ID),
      ]);

      if (rolesRes.data) setRoles(rolesRes.data as unknown as Role[]);
      if (rpRes.data) setRolePermissions(rpRes.data as unknown as RolePermission[]);
      if (urRes.data) setUserRoles(urRes.data as unknown as UserRole[]);
    } catch (err) {
      console.error('Failed to fetch RBAC data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Roles with permission counts and user counts
  const rolesWithDetails: RoleWithPermissions[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      permissions: rolePermissions.filter(rp => rp.role_id === role.id),
      userCount: userRoles.filter(ur => ur.role_id === role.id).length,
    }));
  }, [roles, rolePermissions, userRoles]);

  // Create role
  const createRole = useCallback(async (name: string, description: string) => {
    const { data, error } = await supabase
      .from('roles')
      .insert({ tenant_id: CURRENT_TENANT_ID, name, description } as any)
      .select()
      .single();
    if (error) throw error;
    await fetchAll();
    return data;
  }, [fetchAll]);

  // Update role
  const updateRole = useCallback(async (id: string, name: string, description: string) => {
    const { error } = await supabase
      .from('roles')
      .update({ name, description } as any)
      .eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  // Delete role
  const deleteRole = useCallback(async (id: string) => {
    const { error } = await supabase.from('roles').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  // Set permissions for a role (replace all)
  const setRolePermissionsBatch = useCallback(async (
    roleId: string,
    permissions: { module_name: string; action: PermissionAction }[]
  ) => {
    // Delete existing
    await supabase.from('role_permissions').delete().eq('role_id', roleId);
    // Insert new
    if (permissions.length > 0) {
      const rows = permissions.map(p => ({ role_id: roleId, module_name: p.module_name, action: p.action }));
      await supabase.from('role_permissions').insert(rows as any);
    }
    await fetchAll();
  }, [fetchAll]);

  // Assign role to user
  const assignRole = useCallback(async (userId: string, roleId: string) => {
    // Remove existing roles for user in this tenant
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('tenant_id', CURRENT_TENANT_ID);
    // Assign new
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleId, tenant_id: CURRENT_TENANT_ID } as any);
    if (error) throw error;
    await fetchAll();
  }, [fetchAll]);

  // Remove role from user
  const removeUserRole = useCallback(async (userId: string) => {
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('tenant_id', CURRENT_TENANT_ID);
    await fetchAll();
  }, [fetchAll]);

  // Check if current user has permission
  const hasPermission = useCallback((moduleName: string, action: PermissionAction): boolean => {
    const userRoleIds = userRoles
      .filter(ur => ur.user_id === CURRENT_USER_ID)
      .map(ur => ur.role_id);
    return rolePermissions.some(
      rp => userRoleIds.includes(rp.role_id) && rp.module_name === moduleName && rp.action === action
    );
  }, [userRoles, rolePermissions]);

  // Check permission for any user
  const checkUserPermission = useCallback((userId: string, moduleName: string, action: PermissionAction): boolean => {
    const userRoleIds = userRoles
      .filter(ur => ur.user_id === userId)
      .map(ur => ur.role_id);
    return rolePermissions.some(
      rp => userRoleIds.includes(rp.role_id) && rp.module_name === moduleName && rp.action === action
    );
  }, [userRoles, rolePermissions]);

  // Get user's role
  const getUserRole = useCallback((userId: string): Role | null => {
    const ur = userRoles.find(ur => ur.user_id === userId);
    if (!ur) return null;
    return roles.find(r => r.id === ur.role_id) || null;
  }, [userRoles, roles]);

  return {
    roles,
    rolesWithDetails,
    rolePermissions,
    userRoles,
    loading,
    createRole,
    updateRole,
    deleteRole,
    setRolePermissions: setRolePermissionsBatch,
    assignRole,
    removeUserRole,
    hasPermission,
    checkUserPermission,
    getUserRole,
    refetch: fetchAll,
    currentUserId: CURRENT_USER_ID,
  };
}
