import { useAuthStore } from '@/store/auth-store';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
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
    
    // Set JSON headers by default unless uploading files
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Attach Bearer Access Token if present in Zustand memory
    let token = useAuthStore.getState().token;
    if (!token && typeof window !== 'undefined') {
      token = (window as any).__accessToken;
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const finalOptions = {
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
            // Refresh failed: log out and redirect to appropriate login page
            this.isRefreshing = false;
            const userRole = useAuthStore.getState().role;
            useAuthStore.getState().logout();
            const redirectPath = userRole === 'admin' ? '/admin/login' : '/login';
            window.location.href = `${redirectPath}?redirect=${encodeURIComponent(window.location.pathname)}`;
            throw new Error('Session expired');
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
      throw new Error(errData.message || 'API request failed');
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
      throw new Error(errData.message || 'API request failed');
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
      throw new Error(errData.message || 'API request failed');
    }
    return res.json();
  }

  async delete<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const res = await this.request(path, { ...options, method: 'DELETE' });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'API request failed');
    }
    return res.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
