// Auth service for communicating with backend authentication endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  token: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  role: string;
  photoCard?: string;
  nationalId?: string;
  criminalRecord?: string;
  rating?: number;
  totalDeliveries?: number;
  clientId?: string;
  loyaltyStatus?: string;
}

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

/**
 * Logs in with the given credentials.
 * On success, stores the token and user info in localStorage.
 */
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Identifiants invalides');
  }

  const user: AuthUser = await response.json();
  
  // Store token and user info
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  return user;
}

/**
 * Logs out the current user.
 * Removes the token from localStorage and calls the backend logout endpoint.
 */
export async function logout(): Promise<void> {
  const token = getToken();
  
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      // Ignore errors during logout - we still want to clear local state
      console.error('Logout error:', error);
    }
  }
  
  // Clear local storage regardless of backend response
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Gets the stored auth token.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Gets the stored user info.
 */
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Checks if the user is authenticated.
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Gets the current admin info from the backend.
 * Returns 401 if not authenticated.
 */
export async function getAdminMe(): Promise<AuthUser> {
  const token = getToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/admin/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    // Clear local storage on auth failure
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error('Failed to get admin info');
  }

  return response.json();
}

/**
 * Makes an authenticated request to the API.
 * Automatically adds the Authorization header.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  // Handle 401 responses globally
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Redirect to login if in browser
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
  
  return response;
}
