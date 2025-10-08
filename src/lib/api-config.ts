// 🔧 ROBUST API Configuration for Production & Development
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const isPreview = typeof window !== 'undefined' && window.location.hostname.includes('pages.dev');

// 🎯 API BASE URL with environment variable support
const getApiBase = () => {
  // Development: Use local backend
  if (isLocalhost) {
    return '/api';
  }
  
  // Production: Must be set via VITE_API_BASE environment variable
  if (!import.meta.env.VITE_API_BASE) {
    console.error('❌ VITE_API_BASE não configurada! Configure no Cloudflare Pages.');
  }
  
  return import.meta.env.VITE_API_BASE || '';
};

const API_BASE = getApiBase();

export const API_CONFIG = {
  baseUrl: API_BASE,
  
  // 📋 API Endpoints
  endpoints: {
    // Public endpoints
    flavors: '/flavors',
    orders: '/orders', 
    calculateDistance: '/calculate-distance',
    health: '/health',
    doughTypes: '/dough-types',
    extras: '/extras',
    publicContact: '/public/contact',
    
    // Admin endpoints  
    adminLogin: '/admin/login',
    adminLogout: '/admin/logout',
    adminMe: '/admin/me',
    adminRefresh: '/admin/refresh',
    adminDashboard: '/admin/dashboard',
    adminSettings: '/admin/settings',
    adminFlavors: '/admin/flavors'
  }
};

// 🛠️ Enhanced API URL builder with validation
export const getApiUrl = (endpoint: string) => {
  const baseUrl = API_BASE.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;
  
  // Validate URL format (support relative URLs in development)
  try {
    if (typeof window !== 'undefined') {
      new URL(fullUrl, window.location.origin);
    } else {
      new URL(fullUrl);
    }
    return fullUrl;
  } catch (error) {
    console.error('❌ Invalid API URL generated:', fullUrl);
    throw new Error(`Invalid API URL: ${fullUrl}`);
  }
};

// 🛡️ Defensive API wrapper - handles non-JSON responses gracefully
export async function apiRequest(path: string, init: RequestInit = {}) {
  const url = getApiUrl(path);
  
  const res = await fetch(url, {
    ...init,
    headers: { 
      'Content-Type': 'application/json', 
      ...(init.headers || {}) 
    },
    credentials: 'include', // Support HttpOnly cookies for refresh tokens
  });
  
  // Check if response is JSON before parsing
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Backend returned non-JSON (${res.status}): ${text.slice(0, 120)}...`);
  }
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }
  
  return data;
}

// 🚀 Enhanced API functions using defensive wrapper
export const getDoughTypes = async () => {
  try {
    return await apiRequest('/dough-types');
  } catch (error) {
    console.error('❌ getDoughTypes failed:', error);
    throw error;
  }
};

export const getExtras = async () => {
  try {
    return await apiRequest('/extras');
  } catch (error) {
    console.error('❌ getExtras failed:', error);
    throw error;
  }
};

export const getFlavors = async (category: string) => {
  try {
    return await apiRequest(`/flavors/${category}`);
  } catch (error) {
    console.error(`❌ getFlavors(${category}) failed:`, error);
    throw error;
  }
};

export const calculateDistance = async (data: any) => {
  try {
    return await apiRequest('/calculate-distance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('❌ calculateDistance failed:', error);
    throw error;
  }
};

// 🌍 Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// 🔍 COMPREHENSIVE DEBUG LOGGING
if (typeof window !== 'undefined') {
  const envVar = import.meta.env.VITE_API_BASE;
  const config = {
    isLocalhost,
    isPreview,
    API_BASE,
    environment: isProduction ? 'production' : 'development',
    envVarSet: !!envVar,
    envVarValue: envVar || 'NOT_SET',
    currentDomain: window.location.hostname,
    backendReachable: 'TESTING...'
  };
  
  console.log('🔧 API Configuration:', config);
  
  // 🔍 Test backend connectivity (with error handling)
  try {
    fetch(getApiUrl('/health'))
      .then(response => response.json())
      .then(data => {
        console.log('✅ Backend connectivity test:', data);
      })
      .catch(error => {
        console.error('❌ Backend connectivity failed:', error);
        console.error('🔧 Check VITE_API_BASE configuration in Cloudflare Pages');
      });
  } catch (error) {
    console.error('❌ Backend connectivity test setup failed:', error);
  }
}