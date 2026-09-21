import { useAuthStore } from '@/store/auth-store';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  statusCode: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.data = data;
  }
}

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  async request(path: string, options: RequestOptions = {}): Promise<Response> {
    let urlString = path;
    if (typeof window !== 'undefined') {
      // Client-side execution
      const url = new URL(path, window.location.origin);
      if (options.params) {
        Object.keys(options.params).forEach((key) =>
          url.searchParams.append(key, options.params![key])
        );
      }
      urlString = url.toString();
    } else {
      // Server-side execution
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const url = new URL(path, host);
      if (options.params) {
        Object.keys(options.params).forEach((key) =>
          url.searchParams.append(key, options.params![key])
        );
      }
      urlString = url.toString();
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Attach Bearer token from client-side Zustand store or localStorage
    let token = useAuthStore.getState().token;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const finalOptions: RequestInit = {
      ...options,
      headers,
    };

    let response = await fetch(urlString, finalOptions);

    // If unauthorized (401), attempt to perform silent refresh (client-side only)
    if (response.status === 401 && !path.includes('/api/auth/refresh')) {
      if (typeof window === 'undefined') {
        return response; // Silent refresh cannot run on server component rendering
      }

      if (!this.isRefreshing) {
        this.isRefreshing = true;

        try {
          const refreshRes = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newToken = data.accessToken;
            const user = data.user;

            // Save new tokens to store
            useAuthStore.getState().login(user, newToken);
            this.isRefreshing = false;
            this.onRefreshed(newToken);
          } else {
            // Refresh failed: log out
            this.isRefreshing = false;
            useAuthStore.getState().logout();

            // Only redirect if currently on a protected route that requires authentication
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              if (currentPath.startsWith('/account')) {
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
              } else if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
                window.location.href = `/admin/login?redirect=${encodeURIComponent(currentPath)}`;
              }
            }
            throw new ApiError('Session expired', 401);
          }
        } catch (err) {
          this.isRefreshing = false;
          useAuthStore.getState().logout();
          return response;
        }
      }

      // Queue concurrent requests while refreshing
      const retryRequest = new Promise<Response>((resolve) => {
        this.subscribeTokenRefresh((newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(urlString, { ...options, headers }));
        });
      });

      return retryRequest;
    }

    return response;
  }

  async get<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const res = await this.request(path, { ...options, method: 'GET' });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(errData.message || 'API request failed', res.status, errData);
    }
    return res.json();
  }

  async post<T = any>(path: string, body?: any, options: RequestOptions = {}): Promise<T> {
    const res = await this.request(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(errData.message || 'API request failed', res.status, errData);
    }
    return res.json();
  }

  async put<T = any>(path: string, body?: any, options: RequestOptions = {}): Promise<T> {
    const res = await this.request(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(errData.message || 'API request failed', res.status, errData);
    }
    return res.json();
  }

  async delete<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const res = await this.request(path, { ...options, method: 'DELETE' });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new ApiError(errData.message || 'API request failed', res.status, errData);
    }
    return res.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
