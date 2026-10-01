import { User, UserRole } from '@civicpulse/shared';
import { apiClient } from './apiClient';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  departmentId?: string;
  teamId?: string;
}


export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', {
      email,
      password,
    });

    const { user } = res.data.data;
    // Cache user profile locally (non-sensitive, used for immediate UI rendering)
    localStorage.setItem('civicpulse_current_user', JSON.stringify(user));
    // Keep legacy token keys during migration for backwards-compat
    if (res.data.data.accessToken) {
      localStorage.setItem('civicpulse_token', res.data.data.accessToken);
    }
    if (res.data.data.refreshToken) {
      localStorage.setItem('civicpulse_refresh_token', res.data.data.refreshToken);
    }
    window.dispatchEvent(new Event('civicpulse_auth_changed'));
    return user;
  },

  async register(data: RegisterInput): Promise<User> {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', data);
    const { user } = res.data.data;
    localStorage.setItem('civicpulse_current_user', JSON.stringify(user));
    if (res.data.data.accessToken) {
      localStorage.setItem('civicpulse_token', res.data.data.accessToken);
    }
    if (res.data.data.refreshToken) {
      localStorage.setItem('civicpulse_refresh_token', res.data.data.refreshToken);
    }
    window.dispatchEvent(new Event('civicpulse_auth_changed'));
    return user;
  },

  async me(): Promise<User | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
      const user = res.data.data;
      localStorage.setItem('civicpulse_current_user', JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('civicpulse_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through
      }
    }
    return null;
  },


  async forgotPassword(email: string): Promise<string> {
    const res = await apiClient.post<{ success: boolean; message: string; data?: { resetToken?: string } }>(
      '/auth/forgot-password',
      { email }
    );
    return res.data.data?.resetToken || res.data.message;
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const res = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return res.data.message;
  },

  logout(): void {
    // Server-side: clears HttpOnly cookies
    apiClient.post('/auth/logout').catch(() => {});
    // Client-side: clear cached profile and any legacy token keys
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_refresh_token');
    localStorage.removeItem('civicpulse_current_user');
    window.dispatchEvent(new Event('civicpulse_auth_changed'));
  },
};
