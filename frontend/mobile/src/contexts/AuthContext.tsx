/**
 * 🔐💎⚡ Authentication Context - User State Management ⚡💎🔐
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { apiService, AuthResponse } from '../services/apiService';
import { socketService } from '../services/socketService';

export interface User {
    id: string;
    username: string;
    email: string;
    profile?: {
        neurodivergentType?: string[];
        focusPreferences?: {
            preferredTimerType: 'pomodoro' | 'ultradian' | 'flow';
            defaultDuration: number;
            breakDuration: number;
            distractionSensitivity: number;
        };
        bodyDoublingPreferences?: {
            preferredGroupSize: number;
            cameraEnabled: boolean;
            micEnabled: boolean;
            taskSharingLevel: 'minimal' | 'detailed' | 'full';
        };
        chatPreferences?: {
            readabilityChecking: boolean;
            voiceMessagesEnabled: boolean;
            notificationLevel: 'minimal' | 'standard' | 'all';
        };
        hyperfocusTopics?: string[];
        currentInterests?: string[];
        timezone?: string;
        adhdSupport?: {
            reminderFrequency: number;
            encouragementMessages: boolean;
            flowStateTracking: boolean;
        };
    };
    createdAt: string;
    lastActive?: string;
    isOnline?: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
}

type AuthAction =
    | { type: 'INIT_START' }
    | { type: 'INIT_SUCCESS'; payload: { user: User | null } }
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
    | { type: 'LOGIN_FAILURE'; payload: { error: string } }
    | { type: 'LOGOUT_SUCCESS' }
    | { type: 'UPDATE_PROFILE_SUCCESS'; payload: { user: User } }
    | { type: 'UPDATE_USER_STATUS'; payload: { isOnline: boolean; lastActive?: string } }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SET_ERROR'; payload: { error: string } };

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'INIT_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case 'INIT_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: !!action.payload.user,
                isLoading: false,
                isInitialized: true,
                error: null,
            };

        case 'LOGIN_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };

        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload.error,
            };

        case 'LOGOUT_SUCCESS':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };

        case 'UPDATE_PROFILE_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                error: null,
            };

        case 'UPDATE_USER_STATUS':
            return {
                ...state,
                user: state.user ? {
                    ...state.user,
                    isOnline: action.payload.isOnline,
                    lastActive: action.payload.lastActive || state.user.lastActive,
                } : null,
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload.error,
            };

        default:
            return state;
    }
}

interface AuthContextType {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;

    // Actions
    login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
    register: (userData: {
        username: string;
        email: string;
        password: string;
        neurodivergentProfile?: any;
    }) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (profileData: any) => Promise<boolean>;
    refreshUser: () => Promise<void>;
    clearError: () => void;

    // Utility methods
    hasPermission: (permission: string) => boolean;
    isFeatureEnabled: (feature: string) => boolean;
    getUserPreference: (key: string) => any;
    updateUserStatus: (isOnline: boolean, lastActive?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize authentication state from storage
    useEffect(() => {
        initializeAuth();
    }, []);

    // Setup socket connection when authenticated
    useEffect(() => {
        if (state.isAuthenticated && state.user) {
            setupSocketConnection();
        } else {
            socketService.disconnect();
        }
    }, [state.isAuthenticated, state.user]);

    const initializeAuth = async () => {
        dispatch({ type: 'INIT_START' });

        try {
            // Check if user data exists in storage
            const userDataString = await AsyncStorage.getItem('user');
            const accessToken = await AsyncStorage.getItem('accessToken');

            if (userDataString && accessToken) {
                // Verify token is still valid by fetching current user profile
                try {
                    const response = await apiService.getProfile();
                    if (response.success && response.data) {
                        dispatch({
                            type: 'INIT_SUCCESS',
                            payload: { user: response.data }
                        });
                        console.log('🔐 Auth initialized with valid token');
                        return;
                    }
                } catch (error) {
                    console.warn('⚠️ Token validation failed, clearing stored data');
                    await AsyncStorage.multiRemove(['user', 'accessToken']);
                }
            }

            // No valid authentication found
            dispatch({ type: 'INIT_SUCCESS', payload: { user: null } });
            console.log('🔐 Auth initialized - no valid session');

        } catch (error) {
            console.error('❌ Auth initialization error:', error);
            dispatch({ type: 'INIT_SUCCESS', payload: { user: null } });
        }
    };

    const setupSocketConnection = async () => {
        try {
            const connected = await socketService.connect();
            if (connected) {
                console.log('🌐 Socket connected for authenticated user');

                // Listen for auth errors from socket
                socketService.on('auth_error', () => {
                    console.warn('🔐 Socket auth error - logging out');
                    logout();
                });

                // Update user status
                updateUserStatus(true);
            }
        } catch (error) {
            console.error('❌ Socket connection failed:', error);
        }
    };

    const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await apiService.login({ email, password, rememberMe });

            if (response.success && response.data) {
                const { user } = response.data as AuthResponse;
                dispatch({
                    type: 'LOGIN_SUCCESS', payload: {
                        user: {
                            ...user,
                            createdAt: (user as any).createdAt || new Date().toISOString()
                        }
                    }
                });

                // Update socket auth token
                await socketService.updateAuthToken();

                console.log('🔐 Login successful:', user.username);
                return true;
            } else {
                const errorMessage = response.error || 'Login failed. Please check your credentials.';
                dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
                return false;
            }
        } catch (error: any) {
            console.error('❌ Login error:', error);
            const errorMessage = error.message || 'Login failed. Please try again.';
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
            return false;
        }
    };

    const register = async (userData: {
        username: string;
        email: string;
        password: string;
        neurodivergentProfile?: any;
    }): Promise<boolean> => {
        dispatch({ type: 'LOGIN_START' }); // Using same loading state

        try {
            const response = await apiService.register(userData);

            if (response.success && response.data) {
                // Registration successful, now log in
                const loginSuccess = await login(userData.email, userData.password, true);
                if (loginSuccess) {
                    console.log('🔐 Registration and login successful:', userData.username);
                    return true;
                }
            }

            const errorMessage = response.error || 'Registration failed. Please try again.';
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
            return false;
        } catch (error: any) {
            console.error('❌ Registration error:', error);
            const errorMessage = error.message || 'Registration failed. Please try again.';
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Attempt to logout from server (don't fail if it doesn't work)
            await apiService.logout().catch(console.warn);

            // Disconnect socket
            socketService.disconnect();

            // Clear local state
            dispatch({ type: 'LOGOUT_SUCCESS' });

            console.log('🔐 Logout successful');
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Still clear local state even if server logout fails
            dispatch({ type: 'LOGOUT_SUCCESS' });
        }
    };

    const updateProfile = async (profileData: any): Promise<boolean> => {
        try {
            const response = await apiService.updateProfile(profileData);

            if (response.success && response.data) {
                dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: { user: response.data } });
                console.log('👤 Profile updated successfully');
                return true;
            } else {
                const errorMessage = response.error || 'Profile update failed.';
                dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
                return false;
            }
        } catch (error: any) {
            console.error('❌ Profile update error:', error);
            const errorMessage = error.message || 'Profile update failed. Please try again.';
            dispatch({ type: 'SET_ERROR', payload: { error: errorMessage } });
            return false;
        }
    };

    const refreshUser = async (): Promise<void> => {
        try {
            const response = await apiService.getProfile();
            if (response.success && response.data) {
                dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: { user: response.data } });
            }
        } catch (error) {
            console.error('❌ Refresh user error:', error);
        }
    };

    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const updateUserStatus = (isOnline: boolean, lastActive?: string): void => {
        dispatch({
            type: 'UPDATE_USER_STATUS',
            payload: { isOnline, lastActive: lastActive || new Date().toISOString() }
        });
    };

    // Utility methods
    const hasPermission = (permission: string): boolean => {
        // TODO: Implement permission checking based on user role/preferences
        return state.isAuthenticated;
    };

    const isFeatureEnabled = (feature: string): boolean => {
        if (!state.user?.profile) return true;

        // Check user preferences for feature enablement
        switch (feature) {
            case 'bodyDoubling':
                return state.user.profile.bodyDoublingPreferences !== undefined;
            case 'voiceMessages':
                return state.user.profile.chatPreferences?.voiceMessagesEnabled !== false;
            case 'readabilityChecking':
                return state.user.profile.chatPreferences?.readabilityChecking !== false;
            case 'flowStateTracking':
                return state.user.profile.adhdSupport?.flowStateTracking !== false;
            default:
                return true;
        }
    };

    const getUserPreference = (key: string): any => {
        if (!state.user?.profile) return null;

        // Navigate preference path
        const keys = key.split('.');
        let value: any = state.user.profile;

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return null;
            }
        }

        return value;
    };

    const contextValue: AuthContextType = {
        // State
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        isInitialized: state.isInitialized,

        // Actions
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        clearError,

        // Utility methods
        hasPermission,
        isFeatureEnabled,
        getUserPreference,
        updateUserStatus,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Helper hooks for common use cases
export function useUser(): User | null {
    const { user } = useAuth();
    return user;
}

export function useIsAuthenticated(): boolean {
    const { isAuthenticated, isInitialized } = useAuth();
    return isInitialized && isAuthenticated;
}

export function useUserPreference(key: string): any {
    const { getUserPreference } = useAuth();
    return getUserPreference(key);
}

export function useFeatureFlag(feature: string): boolean {
    const { isFeatureEnabled } = useAuth();
    return isFeatureEnabled(feature);
}
