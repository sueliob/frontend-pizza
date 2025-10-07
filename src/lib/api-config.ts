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

// 🚀 Enhanced API functions with error handling
export const getDoughTypes = async () => {
  try {
    const response = await fetch(getApiUrl('/dough-types'));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ getDoughTypes failed:', error);
    throw error;
  }
};

export const getExtras = async () => {
  try {
    const response = await fetch(getApiUrl('/extras'));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('❌ getExtras failed:', error);
    throw error;
  }
};

export const getFlavors = async (category: string) => {
  try {
    const response = await fetch(getApiUrl(`/flavors/${category}`));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`❌ getFlavors(${category}) failed:`, error);
    throw error;
  }
};

export const calculateDistance = async (data: any) => {
  try {
    const response = await fetch(getApiUrl('/calculate-distance'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
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
    fetch(getApiUrl('/'))
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