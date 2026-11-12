// Vels Agro Enterprise Role & Permissions Service
// Communicates with backend endpoints at /api/v1/admin/roles
import { request } from './apiClient';

export interface SystemPermission {
  id: number;
  code: string;
  module: string;
  description: string;
}

export interface SystemRole {
  id: number;
  name: string;
  description: string | null;
  is_system: number | boolean;
  created_at?: string;
  permissionsCount?: number;
  permissions?: SystemPermission[];
}

export interface PermissionsResponse {
  total: number;
  modules: Record<string, SystemPermission[]>;
  list: SystemPermission[];
}

/**
 * Fetch all roles with assigned permissions from MySQL
 */
export async function getRoles(): Promise<SystemRole[]> {
  const res = await request<SystemRole[]>('/admin/roles');
  return res.data;
}

/**
 * Fetch all available permissions grouped by module
 */
export async function getPermissions(): Promise<PermissionsResponse> {
  const res = await request<PermissionsResponse>('/admin/roles/permissions');
  return res.data;
}

/**
 * Create a new custom role
 */
export async function createRole(data: {
  name: string;
  description?: string;
  permission_ids?: number[];
}): Promise<any> {
  const res = await request<any>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

/**
 * Update an existing role (name, description, permissions)
 */
export async function updateRole(
  id: number,
  data: {
    name?: string;
    description?: string;
    permission_ids?: number[];
  }
): Promise<any> {
  const res = await request<any>(`/admin/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

/**
 * Delete a custom role
 */
export async function deleteRole(id: number): Promise<void> {
  await request<any>(`/admin/roles/${id}`, {
    method: 'DELETE',
  });
}
