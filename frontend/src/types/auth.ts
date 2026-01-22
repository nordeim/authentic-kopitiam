/**
 * Authentication Types
 * Morning Brew Collective
 */

// User role type
export type UserRole = 'customer' | 'admin';

// User type matching backend response
export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    email_verified_at?: string | null;
    created_at?: string;
}

// Auth response from login/register
export interface AuthResponse {
    user: User;
    token: string;
    token_type: 'Bearer';
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Registration data
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

// Auth state
export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;
}

// Auth actions
export interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

// Combined auth store type
export type AuthStore = AuthState & AuthActions;
