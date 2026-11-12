// Vels Agro Enterprise RBAC & Team Management Service
// Direct integration with Express.js Backend RBAC & Dashboard Users APIs
import { request } from './apiClient';

export interface PermissionItem {
  id: number;
  code: string;
  module: string;
  description: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  description: string | null;
  is_system: number | boolean;
  created_at: string;
  permissionsCount?: number;
  permissions: PermissionItem[];
}

export interface DashboardUserItem {
  id: number;
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  job_title: string | null;
  role_id: number;
  role_name: string;
  is_active: number | boolean;
  created_by_name?: string;
  last_login_at?: string;
  created_at: string;
}

/**
 * Fetch all roles with their assigned permissions from MySQL
 */
export async function getRoles(): Promise<RoleDetail[]> {
  const res = await request<RoleDetail[]>('/admin/roles');
  return res.data;
}

/**
 * Fetch all available permissions in the system catalog
 */
export async function getAllPermissions(): Promise<{ total: number; modules: Record<string, PermissionItem[]>; list: PermissionItem[] }> {
  const res = await request<any>('/admin/roles/permissions');
  return res.data;
}

/**
 * Create a new custom role with assigned permissions
 */
export async function createRole(data: {
  name: string;
  description?: string;
  permission_ids: number[];
}): Promise<any> {
  const res = await request<any>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

/**
 * Update role name, description, and assign/unassign permissions
 */
export async function updateRole(
  id: number,
  data: {
    name?: string;
    description?: string;
    permission_ids: number[];
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
  await request(`/admin/roles/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch dashboard users (with search and active filtering)
 */
export async function getDashboardUsers(search?: string): Promise<DashboardUserItem[]> {
  const q = search ? `?q=${encodeURIComponent(search)}` : '';
  const res = await request<DashboardUserItem[]>(`/admin/dashboard-users${q}`);
  return res.data;
}

/**
 * Create / Invite a new dashboard staff user
 */
export async function createDashboardUser(data: {
  email: string;
  password?: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  job_title?: string;
  role_id: number;
}): Promise<DashboardUserItem> {
  const payload = {
    ...data,
    password: data.password || 'Staff@123456', // default initial password if none provided
  };
  const res = await request<DashboardUserItem>('/admin/dashboard-users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Update dashboard staff user role or details
 */
export async function updateDashboardUser(
  id: number,
  data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    job_title?: string;
    role_id?: number;
  }
): Promise<any> {
  const res = await request<any>(`/admin/dashboard-users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

/**
 * Toggle dashboard user active / inactive status
 */
export async function toggleDashboardUserStatus(id: number, isActive: boolean): Promise<any> {
  const res = await request<any>(`/admin/dashboard-users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
  return res.data;
}
