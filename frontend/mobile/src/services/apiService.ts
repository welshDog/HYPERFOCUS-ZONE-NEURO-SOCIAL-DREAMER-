/**
 * 🔗💎⚡ API Service - HTTP Client for Backend Communication ⚡💎🔗
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, API_ENDPOINTS, ERROR_TYPES } from '../config/api';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
    message?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        username: string;
        email: string;
        profile?: any;
    };
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

class ApiService {
    private client: AxiosInstance;
    private refreshPromise: Promise<string> | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - Add auth token
        this.client.interceptors.request.use(
            async (config) => {
                const token = await this.getAccessToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // ADHD-friendly: Log requests for debugging
                console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle token refresh
        this.client.interceptors.response.use(
            (response) => {
                // ADHD-friendly: Log successful responses
                console.log(`✅ API Response: ${response.status} ${response.config.url}`);
                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                // Token expired - attempt refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await this.refreshAccessToken();
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed - redirect to login
                        await this.clearTokens();
                        this.handleAuthError();
                        return Promise.reject(refreshError);
                    }
                }

                console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
                return Promise.reject(this.transformError(error));
            }
        );
    }

    private async getAccessToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('accessToken');
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    private async refreshAccessToken(): Promise<string | null> {
        // Prevent multiple refresh requests
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.performTokenRefresh();

        try {
            const token = await this.refreshPromise;
            this.refreshPromise = null;
            return token;
        } catch (error) {
            this.refreshPromise = null;
            throw error;
        }
    }

    private async performTokenRefresh(): Promise<string> {
        try {
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                {},
                {
                    withCredentials: true,
                    timeout: API_CONFIG.CONNECTION_TIMEOUT
                }
            );

            const { accessToken } = response.data.data;
            await AsyncStorage.setItem('accessToken', accessToken);
            console.log('🔄 Token refreshed successfully');

            return accessToken;
        } catch (error) {
            console.error('❌ Token refresh failed:', error);
            throw error;
        }
    }

    private async clearTokens(): Promise<void> {
        try {
            await AsyncStorage.multiRemove(['accessToken', 'user']);
            console.log('🗑️ Tokens cleared');
        } catch (error) {
            console.error('Error clearing tokens:', error);
        }
    }

    private handleAuthError(): void {
        // TODO: Navigate to login screen
        console.log('🔐 Authentication error - redirect to login');
    }

    private transformError(error: AxiosError): Error & { type: string; status?: number } {
        const transformed = new Error() as Error & { type: string; status?: number };

        if (!error.response) {
            // Network error
            transformed.message = 'Network connection failed. Please check your internet connection.';
            transformed.type = ERROR_TYPES.NETWORK_ERROR;
        } else if (error.response.status >= 500) {
            // Server error
            transformed.message = 'Server error. Please try again later.';
            transformed.type = ERROR_TYPES.SERVER_ERROR;
            transformed.status = error.response.status;
        } else if (error.response.status === 429) {
            // Rate limiting
            transformed.message = 'Too many requests. Please slow down and try again.';
            transformed.type = ERROR_TYPES.RATE_LIMIT_ERROR;
            transformed.status = 429;
        } else if (error.response.status === 401) {
            // Auth error
            transformed.message = 'Authentication failed. Please log in again.';
            transformed.type = ERROR_TYPES.AUTH_ERROR;
            transformed.status = 401;
        } else {
            // Other client errors
            const errorData = error.response.data as any;
            transformed.message = errorData?.error || 'Request failed. Please try again.';
            transformed.type = ERROR_TYPES.VALIDATION_ERROR;
            transformed.status = error.response.status;
        }

        return transformed;
    }

    // Generic request methods
    async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse = await this.client.get(endpoint, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse = await this.client.post(endpoint, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse = await this.client.put(endpoint, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const response: AxiosResponse = await this.client.delete(endpoint);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Authentication methods
    async register(userData: {
        username: string;
        email: string;
        password: string;
        neurodivergentProfile?: any;
    }): Promise<ApiResponse> {
        return this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    }

    async login(credentials: {
        email: string;
        password: string;
        rememberMe?: boolean;
    }): Promise<ApiResponse<AuthResponse>> {
        const response = await this.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

        if (response.success && response.data?.accessToken) {
            await AsyncStorage.setItem('accessToken', response.data.accessToken);
            if (response.data.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response;
    }

    async logout(): Promise<ApiResponse> {
        try {
            const response = await this.post(API_ENDPOINTS.AUTH.LOGOUT);
            await this.clearTokens();
            return response;
        } catch (error) {
            // Clear tokens even if logout request fails
            await this.clearTokens();
            throw error;
        }
    }

    async getProfile(): Promise<ApiResponse> {
        return this.get(API_ENDPOINTS.AUTH.ME);
    }

    async updateProfile(profileData: any): Promise<ApiResponse> {
        return this.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
    }

    // Interest Spaces methods
    async getSpaces(params?: {
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
        sort?: string;
    }): Promise<ApiResponse> {
        return this.get(API_ENDPOINTS.SPACES.LIST, params);
    }

    async createSpace(spaceData: {
        name: string;
        description?: string;
        category: string;
        tags?: string[];
        privacy?: string;
        allowBodyDoubling?: boolean;
        allowFocusSessions?: boolean;
        neurodivergentFriendly?: boolean;
    }): Promise<ApiResponse> {
        return this.post(API_ENDPOINTS.SPACES.CREATE, spaceData);
    }

    async getSpace(spaceId: string): Promise<ApiResponse> {
        return this.get(API_ENDPOINTS.SPACES.GET(spaceId));
    }

    async joinSpace(spaceId: string, hyperfocusLevel?: number): Promise<ApiResponse> {
        return this.post(API_ENDPOINTS.SPACES.JOIN(spaceId), { hyperfocusLevel });
    }

    async leaveSpace(spaceId: string): Promise<ApiResponse> {
        return this.post(API_ENDPOINTS.SPACES.LEAVE(spaceId));
    }

    async updateHyperfocusLevel(spaceId: string, level: number): Promise<ApiResponse> {
        return this.put(API_ENDPOINTS.SPACES.UPDATE_HYPERFOCUS(spaceId), { hyperfocusLevel: level });
    }

    async getSpaceMembers(spaceId: string): Promise<ApiResponse> {
        return this.get(API_ENDPOINTS.SPACES.MEMBERS(spaceId));
    }

    // Utility methods
    async checkConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL.replace('/api', '')}/health`, {
                timeout: API_CONFIG.CONNECTION_TIMEOUT
            });
            return response.status === 200;
        } catch (error) {
            console.error('❌ Connection check failed:', error);
            return false;
        }
    }

    async getCurrentUser(): Promise<any> {
        try {
            const userData = await AsyncStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    isAuthenticated(): Promise<boolean> {
        return this.getAccessToken().then(token => !!token);
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
