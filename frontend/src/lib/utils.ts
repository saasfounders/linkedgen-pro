import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const reportErrorToBackend = async (error: Error, context: Record<string, unknown>) => {
  try {
    const errorReport = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    await fetch(`${API_URL}/api/errors/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(errorReport)
    });
  } catch (reportError) {
    console.error('Failed to report error to backend:', reportError);
  }
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}, retries = 5) => {
  const token = localStorage.getItem('token');
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const cacheBuster = `_t=${Date.now()}&_r=${requestId}&_a=${attempt}&_v=${process.env.NEXT_PUBLIC_DEPLOYMENT_VERSION || 'dev'}`;
      const url = `${API_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}${cacheBuster}`;
      
      console.log(`🚀 API Request (attempt ${attempt + 1}/${retries + 1}):`, {
        requestId,
        url,
        method: config.method || 'GET',
        headers: config.headers,
        body: options.body,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100)
      });

      const response = await fetch(url, config);
      
      console.log(`✅ API Response (${requestId}):`, {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        console.error(`❌ API Error Response (${requestId}):`, error);
        throw new Error(error.error || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`📦 API Success Data (${requestId}):`, data);
      return data;
      
    } catch (fetchError: unknown) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      const errorName = fetchError instanceof Error ? fetchError.name : 'UnknownError';
      const errorStack = fetchError instanceof Error ? fetchError.stack : undefined;
      
      console.error(`💥 Fetch Error (attempt ${attempt + 1}/${retries + 1}, ${requestId}):`, {
        message: errorMsg,
        name: errorName,
        stack: errorStack,
        url: `${API_URL}${endpoint}`,
        timestamp: new Date().toISOString(),
        attempt: attempt + 1,
        maxRetries: retries + 1
      });
      
      if (attempt === 0 && fetchError instanceof Error) {
        reportErrorToBackend(fetchError, {
          requestId,
          endpoint,
          attempt: attempt + 1,
          userAgent: navigator.userAgent,
          url: window.location.href
        }).catch(console.error);
      }
      
      if (attempt === retries) {
        throw new Error(`Failed after ${retries + 1} attempts: ${errorMsg} (Request ID: ${requestId})`);
      }
      
      const baseDelay = Math.pow(2, attempt + 1) * 1000;
      const jitter = Math.random() * 1000;
      const delay = Math.min(baseDelay + jitter, 8000);
      console.log(`⏳ Retrying in ${Math.round(delay)}ms... (${requestId})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
