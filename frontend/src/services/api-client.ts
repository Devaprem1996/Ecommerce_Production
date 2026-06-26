const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  requestId: string;
  errors?: any[];
}

class ApiClient {
  private async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${path}`;
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Set authorization access token if available in memory
    const token = typeof window !== "undefined" ? (window as any).__accessToken : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
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

      const json = await response.json();

      if (!response.ok) {
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

  public get<T = any>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T = any>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T = any>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public patch<T = any>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public delete<T = any>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
