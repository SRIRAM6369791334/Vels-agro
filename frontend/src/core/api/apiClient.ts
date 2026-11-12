// Vels Agro Enterprise API Client
// Reads base URL strictly from environment without hardcoded fallback strings

export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;
  data?: any;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ field: string; message: string }>,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;
  }
}

const API_BASE_URL: string = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error('FATAL: VITE_API_URL is missing in environment variables (.env).');
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('Vels:token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let json: any = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      json = await res.json();
    } else {
      const text = await res.text();
      try {
        json = JSON.parse(text);
      } catch {
        json = { message: text };
      }
    }

    if (!res.ok || json?.success === false) {
      const statusCode = json?.statusCode || res.status;
      const message = json?.message || 'Request failed';
      const errors = json?.errors || undefined;
      const data = json?.data || undefined;

      // Handle session expiration
      if (statusCode === 401 && !url.includes('/auth/login') && !url.includes('/auth/admin/login')) {
        localStorage.removeItem('Vels:token');
        localStorage.removeItem('Vels:active_user');
        localStorage.setItem('Vels:signedout', '1');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.pathname = '/login';
        }
      }

      throw new ApiError(message, statusCode, errors, data);
    }

    return json as ApiResponse<T>;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network or connection failure
    throw new ApiError(
      err?.message || 'Unable to connect to Vels Agro API server. Please check your network.',
      0
    );
  }
}
