'use client';

/**
 * Authentication Store (Zustand)
 * Morning Brew Collective
 * 
 * Manages authentication state with PDPA-compliant token storage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, LoginCredentials, RegisterData } from '@/types/auth';
import { authApi } from '@/lib/auth-api';

// Token storage key
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Auth store with persistence
 */
export const useAuthStore = create<AuthStore>()(
    persist(
        (set, _get) => ({
            // State
            user: null,
            token: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            error: null,

            // Actions
            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await authApi.login(credentials);

                    // Store token in localStorage for API calls
                    localStorage.setItem(AUTH_TOKEN_KEY, response.token);

                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isAdmin: response.user.role === 'admin',
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Login failed',
                    });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await authApi.register(data);

                    // Store token in localStorage for API calls
                    localStorage.setItem(AUTH_TOKEN_KEY, response.token);

                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isAdmin: response.user.role === 'admin',
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Registration failed',
                    });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });

                try {
                    await authApi.logout();
                } catch {
                    // Continue with local logout even if API call fails
                } finally {
                    // Clear token from localStorage
                    localStorage.removeItem(AUTH_TOKEN_KEY);

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isAdmin: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem(AUTH_TOKEN_KEY);

                if (!token) {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isAdmin: false,
                        isLoading: false,
                    });
                    return;
                }

                set({ isLoading: true });

                try {
                    const response = await authApi.me();

                    set({
                        user: response.user,
                        token,
                        isAuthenticated: true,
                        isAdmin: response.user.role === 'admin',
                        isLoading: false,
                        error: null,
                    });
                } catch {
                    // Token invalid - clear state
                    localStorage.removeItem(AUTH_TOKEN_KEY);

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isAdmin: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'morning-brew-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist user info, not loading/error state
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                isAdmin: state.isAdmin,
            }),
        }
    )
);
