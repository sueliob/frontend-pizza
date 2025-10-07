import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl } from "./api-config";
import { AuthStore } from "./auth-store";
import { apiFetch } from "./api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Create headers with Authorization if token exists
function getHeaders(includeContentType: boolean = false): HeadersInit {
  const headers: HeadersInit = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = AuthStore.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Use new apiFetch which handles Bearer tokens automatically
  const endpoint = url.startsWith('http') ? url : url;
  
  const res = await apiFetch(endpoint, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Use new apiFetch which handles Bearer tokens automatically
    const res = await apiFetch(url, { method: 'GET' });

    // Handle query response
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      // Unauthorized access
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    // Data received
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
