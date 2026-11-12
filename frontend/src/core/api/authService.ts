// Vels Agro Enterprise Authentication Service
// Unified Auth handling for Superadmin & Dashboard Staff
import { request } from './apiClient';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  permissions?: string[];
  user_type?: 'SUPER_ADMIN' | 'DASHBOARD_USER';
}

export interface AuthLoginResponse {
  token: string;
  user: UserProfile;
}

/**
 * Superadmin Dedicated Login Endpoint
 */
export async function adminLogin(email: string, password: string): Promise<AuthLoginResponse> {
  const res = await request<any>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const rawUser = res.data.user || res.data.admin;
  const fullName = `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim();

  const userProfile: UserProfile = {
    id: rawUser.id,
    email: rawUser.email,
    name: fullName || rawUser.email.split('@')[0],
    first_name: rawUser.firstName,
    last_name: rawUser.lastName,
    role: rawUser.role || 'Super Administrator',
    permissions: rawUser.permissions || ['*'],
    user_type: 'SUPER_ADMIN',
  };

  saveSession(res.data.token, userProfile);
  return { token: res.data.token, user: userProfile };
}

/**
 * Dashboard Staff Dedicated Login Endpoint
 */
export async function dashboardLogin(email: string, password: string): Promise<AuthLoginResponse> {
  const res = await request<any>('/auth/dashboard/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const rawUser = res.data.user;
  const fullName = `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim();

  const userProfile: UserProfile = {
    id: rawUser.id,
    email: rawUser.email,
    name: fullName || rawUser.email.split('@')[0],
    first_name: rawUser.firstName,
    last_name: rawUser.lastName,
    role: rawUser.roleName || rawUser.role || 'Staff',
    permissions: rawUser.permissions || [],
    user_type: 'DASHBOARD_USER',
  };

  saveSession(res.data.token, userProfile);
  return { token: res.data.token, user: userProfile };
}

/**
 * Unified Login Gateway (Q1 - Option C):
 * Direct backend single round-trip that handles both Superadmin and Staff seamlessly.
 * Zero false lockout attempts, zero redundant network calls.
 */
export async function unifiedLogin(
  email: string,
  password: string
): Promise<{ token: string; user: UserProfile; userType: 'SUPER_ADMIN' | 'DASHBOARD_USER' }> {
  const res = await request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = res.data;
  const rawUser = data.user || data.admin;
  const userType: 'SUPER_ADMIN' | 'DASHBOARD_USER' =
    rawUser.userType || (data.admin ? 'SUPER_ADMIN' : 'DASHBOARD_USER');

  const fullName = `${rawUser.firstName || ''} ${rawUser.lastName || ''}`.trim();
  const userProfile: UserProfile = {
    id: rawUser.id,
    email: rawUser.email,
    name: fullName || rawUser.email.split('@')[0],
    first_name: rawUser.firstName,
    last_name: rawUser.lastName,
    role:
      rawUser.role ||
      rawUser.roleName ||
      (userType === 'SUPER_ADMIN' ? 'Super Administrator' : 'Staff'),
    permissions: rawUser.permissions || (userType === 'SUPER_ADMIN' ? ['*'] : []),
    user_type: userType,
  };

  saveSession(data.token, userProfile);
  return { token: data.token, user: userProfile, userType };
}

function saveSession(token: string, user: UserProfile): void {
  try {
    localStorage.setItem('Vels:token', token);
    localStorage.setItem('Vels:active_user', JSON.stringify(user));
    localStorage.setItem('Vels:user_type', user.user_type || 'SUPER_ADMIN');
    localStorage.setItem('Vels:signedout', '0');
  } catch (err) {
    console.warn('Unable to persist session to localStorage:', err);
  }
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.warn('Server logout error (clearing local session anyway):', err);
  } finally {
    localStorage.removeItem('Vels:token');
    localStorage.removeItem('Vels:active_user');
    localStorage.removeItem('Vels:user_type');
    localStorage.setItem('Vels:signedout', '1');
  }
}

export async function getMe(): Promise<UserProfile> {
  const res = await request<UserProfile>('/auth/me');
  return res.data;
}
