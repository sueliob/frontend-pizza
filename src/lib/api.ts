// 🔧 ROBUST API Central Fetcher with Bearer Token & Refresh
import { AuthStore } from './auth-store';

// 🎯 API Configuration with environment variable support
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

// 🔐 Enhanced API Fetcher with automatic Bearer token injection
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  // 🔑 Inject Authorization Bearer token if available
  const token = AuthStore.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 🚀 Make initial request
  let response = await fetch(url, {
    ...options,
    headers,
  });
  
  // 🔄 Handle 401 with optional refresh token retry
  if (response.status === 401 && token) {
    console.warn('🔄 Token expired, attempting refresh...');
    
    const refreshSuccess = await tryRefresh();
    if (refreshSuccess) {
      // Retry original request with new token
      const newToken = AuthStore.getToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    } else {
      // Refresh failed, redirect to login
      console.error('❌ Refresh failed, redirecting to login');
      AuthStore.clearState();
      window.location.href = '/admin/login';
      return response;
    }
  }
  
  return response;
}

// 🔄 Refresh token functionality
async function tryRefresh(): Promise<boolean> {
  try {
    const authState = AuthStore.getState();
    if (!authState.token) return false;
    
    const response = await fetch(`${API_BASE}/admin/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token && data.user) {
        AuthStore.setState(data.token, data.user);
        console.log('✅ Token refreshed successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Refresh token failed:', error);
    return false;
  }
}

// 🎯 Enhanced API helpers that return JSON when content-type is application/json
export async function apiGet(endpoint: string): Promise<any> {
  const response = await apiFetch(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

export async function apiPost(endpoint: string, data?: any): Promise<any> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

export async function apiPut(endpoint: string, data?: any): Promise<any> {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

export async function apiDelete(endpoint: string): Promise<any> {
  const response = await apiFetch(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

// 🔍 Debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    API_BASE,
    hasToken: !!AuthStore.getToken(),
    environment: import.meta.env.MODE,
  });
}