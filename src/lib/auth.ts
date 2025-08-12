export interface User {
  id: string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class AuthService {
  private static getStoredTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const tokens = localStorage.getItem('auth_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  }

  private static setStoredTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  private static clearStoredTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_tokens');
  }

  static async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const tokens = await response.json();
    this.setStoredTokens(tokens);
    return tokens;
  }

  static async refreshTokens(): Promise<AuthTokens | null> {
    const currentTokens = this.getStoredTokens();
    if (!currentTokens) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: currentTokens.refreshToken,
        }),
      });

      if (!response.ok) {
        this.clearStoredTokens();
        return null;
      }

      const newTokens = await response.json();
      this.setStoredTokens(newTokens);
      return newTokens;
    } catch {
      this.clearStoredTokens();
      return null;
    }
  }

  static async logout(): Promise<void> {
    const currentTokens = this.getStoredTokens();
    if (currentTokens) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentTokens.accessToken}`,
          },
        });
      } catch {
        // Ignore logout errors
      }
    }
    this.clearStoredTokens();
  }

  static getCurrentUser(): User | null {
    const tokens = this.getStoredTokens();
    return tokens?.user || null;
  }

  static getAccessToken(): string | null {
    const tokens = this.getStoredTokens();
    return tokens?.accessToken || null;
  }

  static isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = AuthService.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const newTokens = await AuthService.refreshTokens();
    if (newTokens) {
      headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (!retryResponse.ok) {
        throw new Error(`API request failed: ${retryResponse.statusText}`);
      }
      
      return retryResponse.json();
    } else {
      // Refresh failed, redirect to login
      AuthService.logout();
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API request failed: ${response.statusText}`);
  }

  return response.json();
}
