import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  public statusCode?: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, statusCode?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true, // Send HttpOnly cookies automatically
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Attach client request trace ID
  if (!config.headers['X-Request-Id']) {
    config.headers['X-Request-Id'] = crypto.randomUUID();
  }

  // Backwards compatibility: inject stored token if cookie hasn't been set yet
  // (e.g. immediately after login before first cookie-based request)
  const token = localStorage.getItem('civicpulse_token');
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; error?: { message: string; code: string; details?: unknown } }>) => {
    const status = error.response?.status;
    const backendError = error.response?.data?.error;
    const rawMessage = backendError?.message || error.message || 'API request failed';

    // Log the complete API error in the developer console
    console.error('[API Client Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status,
      errorData: error.response?.data,
      rawMessage,
    });

    // On 401, clear cached user data (tokens are in HttpOnly cookies, cleared server-side)
    if (status === 401) {
      localStorage.removeItem('civicpulse_current_user');
      // Remove legacy token keys during migration
      localStorage.removeItem('civicpulse_token');
      localStorage.removeItem('civicpulse_refresh_token');
      window.dispatchEvent(new Event('civicpulse_auth_changed'));
    }

    const apiError = new ApiError(
      rawMessage,
      status,
      backendError?.code || (error.code as string),
      backendError?.details
    );

    return Promise.reject(apiError);
  }
);

/**
 * Human-readable mapping for UI error banners
 */
export function formatApiError(err: unknown): { title: string; message: string; statusCode?: number } {
  const anyErr = err as any;
  const status = anyErr?.statusCode || anyErr?.response?.status;

  if (
    !navigator.onLine ||
    anyErr?.code === 'ERR_NETWORK' ||
    anyErr?.message?.includes('Network Error') ||
    anyErr?.message?.includes('network')
  ) {
    return {
      title: 'Network Connection Error',
      message: 'Unable to reach the CivicPulse network. Please check your internet connection.',
      statusCode: 0,
    };
  }

  if (status === 400 || status === 422) {
    return {
      title: 'Invalid Report Details',
      message: 'Please verify your report details. Some fields were incomplete or formatted incorrectly.',
      statusCode: status,
    };
  }

  if (status === 401) {
    return {
      title: 'Authentication Required',
      message: 'Your citizen session has expired. Please sign in to submit your report.',
      statusCode: 401,
    };
  }

  if (status === 403) {
    return {
      title: 'Permission Denied',
      message: 'You do not have permission to submit a civic report with these privileges.',
      statusCode: 403,
    };
  }

  if (status === 404) {
    return {
      title: 'Service Not Found',
      message: 'The reporting service or resource was not found. Please try again shortly.',
      statusCode: 404,
    };
  }

  if (status === 409) {
    return {
      title: 'Duplicate Incident',
      message: 'A similar civic incident is already active at this location and currently under field dispatch.',
      statusCode: 409,
    };
  }

  if (status === 429) {
    return {
      title: 'Rate Limit Reached',
      message: 'Too many requests were submitted recently. Please wait a moment before trying again.',
      statusCode: 429,
    };
  }

  return {
    title: 'Submission Failed',
    message: 'Something went wrong while submitting your report. Your report is still saved locally. Please try again.',
    statusCode: status || 500,
  };
}
