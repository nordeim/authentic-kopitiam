/**
 * Authentication API Client
 * Morning Brew Collective
 * 
 * Handles all authentication-related API calls.
 */

import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get stored auth token
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

/**
 * Create headers with auth token
 */
function createHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }
    return response.json();
}

/**
 * Auth API client
 */
export const authApi = {
    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: createHeaders(false),
            body: JSON.stringify(data),
        });
        return handleResponse<AuthResponse>(response);
    },

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: createHeaders(false),
            body: JSON.stringify(credentials),
        });
        return handleResponse<AuthResponse>(response);
    },

    /**
     * Logout user (revoke token)
     */
    async logout(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            headers: createHeaders(),
        });

        if (!response.ok && response.status !== 401) {
            throw new Error('Logout failed');
        }
    },

    /**
     * Get current user
     */
    async me(): Promise<{ user: User }> {
        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'GET',
            headers: createHeaders(),
        });
        return handleResponse<{ user: User }>(response);
    },

    /**
     * Refresh auth token
     */
    async refresh(): Promise<{ token: string; token_type: string }> {
        const response = await fetch(`${API_BASE_URL}/refresh`, {
            method: 'POST',
            headers: createHeaders(),
        });
        return handleResponse<{ token: string; token_type: string }>(response);
    },
};
