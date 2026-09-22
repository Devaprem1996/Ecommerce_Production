const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
    ? "https://yathuiyarkaiyagam-backend-prod.fly.dev/api/v1"
    : "http://localhost:8080/api/v1");

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  requestId: string;
  errors?: any[];
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private async request<T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Normalize path to prevent duplicate /api/v1 prefix
    let normalizedPath = path.startsWith("/") ? path : `/${path}`;
    if (normalizedPath.startsWith("/api/v1/")) {
      normalizedPath = normalizedPath.replace(/^\/api\/v1/, "");
    }

    // Append query params if provided
    let queryString = "";
    if (options.params && typeof options.params === "object") {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.append(key, String(val));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        queryString = normalizedPath.includes("?") ? `&${qs}` : `?${qs}`;
      }
    }

    const url = `${API_BASE_URL}${normalizedPath}${queryString}`;
    const { params, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers);

    if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Set authorization access token if available in memory, localStorage, or cookies
    let token: string | null = null;
    if (typeof window !== "undefined") {
      const isInAdminContext =
        window.location.pathname.startsWith("/admin") ||
        normalizedPath.startsWith("/admin") ||
        normalizedPath.startsWith("/cms");

      if (isInAdminContext) {
        token =
          localStorage.getItem("admin_access_token") ||
          (window as any).__accessToken ||
          localStorage.getItem("access_token");
      } else {
        token =
          (window as any).__accessToken ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("admin_access_token");
      }

      if (!token) {
        const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
        if (match) {
          token = match[2];
        }
      }
      if (token) {
        (window as any).__accessToken = token;
      }
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      credentials: "include",
      ...fetchOptions,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle HTTP status codes
      if (response.status === 204) {
        return {
          success: true,
          message: "Operation completed successfully.",
          timestamp: new Date().toISOString(),
          requestId: "N/A",
        };
      }

      const text = await response.text();
      let json: any;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        // Response is HTML or non-JSON (e.g. 404/502/503 from reverse proxy or server)
        const errorMessage = response.ok
          ? "Invalid response from server."
          : `Server returned HTTP ${response.status}: ${response.statusText || 'Service Error'}`;
        json = {
          success: false,
          message: errorMessage,
        };
      }

      if (!response.ok) {
        // Attach numeric status codes to rejected object
        if (typeof json === 'object' && json !== null) {
          json.status = response.status;
          json.statusCode = response.status;
        }

        // Handle unauthorized token refresh triggers if needed
        if (response.status === 401 && path !== "/auth/refresh") {
          // Future expansion: Trigger access token refresh flows
        }

        return Promise.reject(json);
      }

      return json;
    } catch (error: any) {
      return Promise.reject({
        success: false,
        message: error.message || "Failed to establish server connection.",
        timestamp: new Date().toISOString(),
        requestId: "N/A",
      });
    }
  }

  public get<T = any>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T = any>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T = any>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public patch<T = any>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public delete<T = any>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
