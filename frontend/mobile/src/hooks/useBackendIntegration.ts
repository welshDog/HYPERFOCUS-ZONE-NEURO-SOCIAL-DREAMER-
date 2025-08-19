/**
 * 🔗💎⚡ Integration Hook - Simplified Backend Connectivity ⚡💎🔗
 */

import { useCallback, useEffect, useState } from 'react';
import { SUCCESS_MESSAGES } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { apiService } from '../services/apiService';

// Mock toast functionality for now (will be replaced with actual implementation)
const Toast = {
    show: (config: any) => {
        console.log(`Toast: ${config.text1} - ${config.text2}`);
    }
};

interface UseBackendIntegrationResult {
    // Connection status
    isConnected: boolean;
    isAuthenticated: boolean;
    connectionError: string | null;

    // Loading states
    isLoading: boolean;
    authLoading: boolean;

    // Auth methods with ADHD-friendly feedback
    login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
    register: (userData: {
        username: string;
        email: string;
        password: string;
        neurodivergentProfile?: any;
    }) => Promise<boolean>;
    logout: () => Promise<void>;

    // Spaces management
    spaces: {
        list: any[];
        loading: boolean;
        error: string | null;
        fetch: (params?: any) => Promise<void>;
        create: (spaceData: any) => Promise<boolean>;
        join: (spaceId: string, hyperfocusLevel?: number) => Promise<boolean>;
        leave: (spaceId: string) => Promise<boolean>;
        updateHyperfocus: (spaceId: string, level: number) => Promise<boolean>;
    };

    // Real-time features
    realTime: {
        // Focus sessions
        startFocusSession: (type: 'pomodoro' | 'ultradian' | 'flow', duration: number, spaceId?: string) => Promise<void>;
        joinFocusSession: (sessionId: string) => Promise<void>;
        endFocusSession: (sessionId: string) => Promise<void>;
        currentFocusSession: any;
        focusActiveSessions: any[];

        // Body doubling
        createBodyDoublingSession: (spaceId?: string, maxParticipants?: number) => Promise<void>;
        joinBodyDoublingSession: (sessionId: string) => Promise<void>;
        requestBodyDoublingPartner: (preferences?: any) => Promise<void>;
        currentBodyDoublingSession: any;
        currentPartner: any;

        // Chat
        sendMessage: (message: string, spaceId?: string) => Promise<void>;
        messages: any[];
        unreadCount: number;
        typingUsers: any[];
        markAsRead: () => void;
    };

    // Utility methods
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showAdhdFriendlyMessage: (type: 'success' | 'focus' | 'distraction' | 'flow') => void;
    checkConnection: () => Promise<boolean>;
    refreshData: () => Promise<void>;
}

export function useBackendIntegration(): UseBackendIntegrationResult {
    const {
        user,
        isAuthenticated,
        isLoading: authLoading,
        login: authLogin,
        register: authRegister,
        logout: authLogout,
        error: authError
    } = useAuth();

    const {
        connection,
        focus,
        bodyDoubling,
        chat,
        connectSocket,
        startFocusSession,
        joinFocusSession,
        endFocusSession,
        createBodyDoublingSession,
        joinBodyDoublingSession,
        requestPartner,
        sendMessage,
        markChatAsRead,
    } = useRealTime();

    // Local state for spaces management
    const [spaces, setSpaces] = useState<{
        list: any[];
        loading: boolean;
        error: string | null;
    }>({
        list: [],
        loading: false,
        error: null,
    });
    const [isLoading, setIsLoading] = useState(false);

    // Connect socket when authenticated
    useEffect(() => {
        if (isAuthenticated && !connection.isConnected) {
            connectSocket().catch(console.error);
        }
    }, [isAuthenticated, connection.isConnected, connectSocket]);

    // ADHD-friendly toast messages
    const showSuccess = useCallback((message: string) => {
        Toast.show({
            type: 'success',
            text1: '🎉 Success!',
            text2: message,
            visibilityTime: 3000,
            position: 'top',
        });
    }, []);

    const showError = useCallback((message: string) => {
        Toast.show({
            type: 'error',
            text1: '❌ Oops!',
            text2: message,
            visibilityTime: 4000,
            position: 'top',
        });
    }, []);

    const showAdhdFriendlyMessage = useCallback((type: 'success' | 'focus' | 'distraction' | 'flow') => {
        const messages = {
            success: SUCCESS_MESSAGES.LOGIN,
            focus: "🎯 You're in the zone! Great focus happening right now.",
            distraction: "🌊 That's okay! Distractions happen. Let's gently refocus together.",
            flow: "✨ WOW! You've entered FLOW STATE! You're absolutely crushing it!",
        };

        const emojis = {
            success: '🎉',
            focus: '🎯',
            distraction: '🌊',
            flow: '✨',
        };

        Toast.show({
            type: type === 'distraction' ? 'info' : 'success',
            text1: `${emojis[type]} ADHD-Friendly Update`,
            text2: messages[type],
            visibilityTime: type === 'flow' ? 6000 : 4000,
            position: 'top',
        });
    }, []);

    // Enhanced auth methods with ADHD-friendly feedback
    const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<boolean> => {
        try {
            const success = await authLogin(email, password, rememberMe);
            if (success) {
                showAdhdFriendlyMessage('success');
                // Auto-connect socket
                setTimeout(() => connectSocket(), 100);
            } else {
                showError(authError || 'Login failed. Please check your credentials.');
            }
            return success;
        } catch (error: any) {
            showError(error.message || 'Login failed. Please try again.');
            return false;
        }
    }, [authLogin, authError, showAdhdFriendlyMessage, showError, connectSocket]);

    const register = useCallback(async (userData: {
        username: string;
        email: string;
        password: string;
        neurodivergentProfile?: any;
    }): Promise<boolean> => {
        try {
            const success = await authRegister(userData);
            if (success) {
                showSuccess('🎉 Welcome to HyperFocus Zone! Your neurodivergent-friendly space awaits.');
                // Auto-connect socket
                setTimeout(() => connectSocket(), 100);
            } else {
                showError(authError || 'Registration failed. Please try again.');
            }
            return success;
        } catch (error: any) {
            showError(error.message || 'Registration failed. Please try again.');
            return false;
        }
    }, [authRegister, authError, showSuccess, showError, connectSocket]);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await authLogout();
            showSuccess('👋 See you later! Your progress has been saved.');
        } catch (error: any) {
            showError(error.message || 'Logout failed.');
        }
    }, [authLogout, showSuccess, showError]);

    // Spaces management methods
    const fetchSpaces = useCallback(async (params?: any): Promise<void> => {
        setSpaces(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await apiService.getSpaces(params);
            if (response.success) {
                setSpaces(prev => ({
                    ...prev,
                    list: response.data || [],
                    loading: false
                }));
            } else {
                setSpaces(prev => ({
                    ...prev,
                    loading: false,
                    error: response.error || 'Failed to fetch spaces'
                }));
            }
        } catch (error: any) {
            setSpaces(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'Failed to fetch spaces'
            }));
        }
    }, []);

    const createSpace = useCallback(async (spaceData: any): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await apiService.createSpace(spaceData);
            if (response.success) {
                showSuccess(`🌟 "${spaceData.name}" space created! Time to hyperfocus together.`);
                // Refresh spaces list
                await fetchSpaces();
                return true;
            } else {
                showError(response.error || 'Failed to create space.');
                return false;
            }
        } catch (error: any) {
            showError(error.message || 'Failed to create space.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchSpaces, showSuccess, showError]);

    const joinSpace = useCallback(async (spaceId: string, hyperfocusLevel = 5): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await apiService.joinSpace(spaceId, hyperfocusLevel);
            if (response.success) {
                showSuccess(`🚀 Welcome to the space! Your hyperfocus level: ${hyperfocusLevel}/10`);
                await fetchSpaces(); // Refresh to show updated membership
                return true;
            } else {
                showError(response.error || 'Failed to join space.');
                return false;
            }
        } catch (error: any) {
            showError(error.message || 'Failed to join space.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchSpaces, showSuccess, showError]);

    const leaveSpace = useCallback(async (spaceId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const response = await apiService.leaveSpace(spaceId);
            if (response.success) {
                showSuccess('👋 Left space successfully. Your progress has been saved!');
                await fetchSpaces(); // Refresh to show updated membership
                return true;
            } else {
                showError(response.error || 'Failed to leave space.');
                return false;
            }
        } catch (error: any) {
            showError(error.message || 'Failed to leave space.');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchSpaces, showSuccess, showError]);

    const updateHyperfocusLevel = useCallback(async (spaceId: string, level: number): Promise<boolean> => {
        try {
            const response = await apiService.updateHyperfocusLevel(spaceId, level);
            if (response.success) {
                showSuccess(`🎯 Hyperfocus level updated to ${level}/10! You're dialing in!`);
                return true;
            } else {
                showError(response.error || 'Failed to update hyperfocus level.');
                return false;
            }
        } catch (error: any) {
            showError(error.message || 'Failed to update hyperfocus level.');
            return false;
        }
    }, [showSuccess, showError]);

    // Enhanced real-time methods with ADHD-friendly feedback
    const enhancedStartFocusSession = useCallback(async (
        type: 'pomodoro' | 'ultradian' | 'flow',
        duration: number,
        spaceId?: string
    ): Promise<void> => {
        try {
            await startFocusSession({ type, duration, spaceId });
            const typeMessages = {
                pomodoro: '🍅 Pomodoro started! 25 minutes of focused awesomeness ahead.',
                ultradian: '🌊 Ultradian session begun! Riding your natural energy waves.',
                flow: '✨ Flow session initiated! Let your hyperfocus guide you.',
            };
            showSuccess(typeMessages[type]);
        } catch (error: any) {
            showError('Failed to start focus session.');
        }
    }, [startFocusSession, showSuccess, showError]);

    const enhancedJoinFocusSession = useCallback(async (sessionId: string): Promise<void> => {
        try {
            await joinFocusSession(sessionId);
            showSuccess('🎯 Joined focus session! Time to focus together.');
        } catch (error: any) {
            showError('Failed to join focus session.');
        }
    }, [joinFocusSession, showSuccess, showError]);

    const enhancedEndFocusSession = useCallback(async (sessionId: string): Promise<void> => {
        try {
            await endFocusSession(sessionId);
            showSuccess('🏁 Focus session complete! Great work - you did amazing!');
        } catch (error: any) {
            showError('Failed to end focus session.');
        }
    }, [endFocusSession, showSuccess, showError]);

    const enhancedCreateBodyDoublingSession = useCallback(async (
        spaceId?: string,
        maxParticipants = 4
    ): Promise<void> => {
        try {
            await createBodyDoublingSession({ spaceId, maxParticipants });
            showSuccess('👥 Body doubling session created! Your accountability partner awaits.');
        } catch (error: any) {
            showError('Failed to create body doubling session.');
        }
    }, [createBodyDoublingSession, showSuccess, showError]);

    const enhancedJoinBodyDoublingSession = useCallback(async (sessionId: string): Promise<void> => {
        try {
            await joinBodyDoublingSession(sessionId);
            showSuccess('🤝 Joined body doubling! You\'re not alone in this journey.');
        } catch (error: any) {
            showError('Failed to join body doubling session.');
        }
    }, [joinBodyDoublingSession, showSuccess, showError]);

    const enhancedRequestPartner = useCallback(async (preferences?: any): Promise<void> => {
        try {
            await requestPartner(preferences);
            showSuccess('🔍 Looking for your perfect accountability partner...');
        } catch (error: any) {
            showError('Failed to request partner.');
        }
    }, [requestPartner, showSuccess, showError]);

    const enhancedSendMessage = useCallback(async (message: string, spaceId?: string): Promise<void> => {
        try {
            await sendMessage({ message, spaceId });
            // Don't show success toast for messages - too frequent
        } catch (error: any) {
            showError('Failed to send message.');
        }
    }, [sendMessage, showError]);

    // Utility methods
    const checkConnection = useCallback(async (): Promise<boolean> => {
        return await apiService.checkConnection();
    }, []);

    const refreshData = useCallback(async (): Promise<void> => {
        if (isAuthenticated) {
            await fetchSpaces();
        }
    }, [isAuthenticated, fetchSpaces]);

    // Auto-refresh data when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchSpaces();
        }
    }, [isAuthenticated, fetchSpaces]);

    return {
        // Connection status
        isConnected: connection.isConnected,
        isAuthenticated,
        connectionError: connection.lastError,

        // Loading states
        isLoading,
        authLoading,

        // Auth methods with ADHD-friendly feedback
        login,
        register,
        logout,

        // Spaces management
        spaces: {
            list: spaces.list,
            loading: spaces.loading,
            error: spaces.error,
            fetch: fetchSpaces,
            create: createSpace,
            join: joinSpace,
            leave: leaveSpace,
            updateHyperfocus: updateHyperfocusLevel,
        },

        // Real-time features
        realTime: {
            // Focus sessions
            startFocusSession: enhancedStartFocusSession,
            joinFocusSession: enhancedJoinFocusSession,
            endFocusSession: enhancedEndFocusSession,
            currentFocusSession: focus.currentSession,
            focusActiveSessions: focus.activeSessions,

            // Body doubling
            createBodyDoublingSession: enhancedCreateBodyDoublingSession,
            joinBodyDoublingSession: enhancedJoinBodyDoublingSession,
            requestBodyDoublingPartner: enhancedRequestPartner,
            currentBodyDoublingSession: bodyDoubling.currentSession,
            currentPartner: bodyDoubling.currentPartner,

            // Chat
            sendMessage: enhancedSendMessage,
            messages: chat.messages,
            unreadCount: chat.unreadCount,
            typingUsers: chat.typingUsers,
            markAsRead: markChatAsRead,
        },

        // Utility methods
        showSuccess,
        showError,
        showAdhdFriendlyMessage,
        checkConnection,
        refreshData,
    };
}

// Specialized hooks for specific features
export function useSpacesIntegration() {
    const { spaces, isAuthenticated } = useBackendIntegration();
    return { ...spaces, isAuthenticated };
}

export function useFocusIntegration() {
    const { realTime, isAuthenticated, showAdhdFriendlyMessage } = useBackendIntegration();

    return {
        ...realTime,
        isAuthenticated,
        showFocusMessage: () => showAdhdFriendlyMessage('focus'),
        showFlowMessage: () => showAdhdFriendlyMessage('flow'),
        showDistractionMessage: () => showAdhdFriendlyMessage('distraction'),
    };
}

export function useBodyDoublingIntegration() {
    const { realTime, isAuthenticated, showSuccess } = useBackendIntegration();

    return {
        createSession: realTime.createBodyDoublingSession,
        joinSession: realTime.joinBodyDoublingSession,
        requestPartner: realTime.requestBodyDoublingPartner,
        currentSession: realTime.currentBodyDoublingSession,
        currentPartner: realTime.currentPartner,
        isAuthenticated,
        showPartnerMatchedMessage: () => showSuccess('🤝 Perfect match! Your accountability partner is ready to focus with you!'),
    };
}

export function useChatIntegration() {
    const { realTime, isAuthenticated } = useBackendIntegration();

    return {
        sendMessage: realTime.sendMessage,
        messages: realTime.messages,
        unreadCount: realTime.unreadCount,
        typingUsers: realTime.typingUsers,
        markAsRead: realTime.markAsRead,
        isAuthenticated,
    };
}
