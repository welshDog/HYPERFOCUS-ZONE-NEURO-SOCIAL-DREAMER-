/**
 * 🌐💎⚡ Real-time Context - Socket.IO State Management ⚡💎🌐
 */

import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { BodyDoublingSession, ChatMessage, FocusSession, socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface ConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    reconnectAttempts: number;
    lastError: string | null;
}

interface FocusState {
    activeSessions: FocusSession[];
    currentSession: FocusSession | null;
    recentDistraction: boolean;
    flowStateActive: boolean;
}

interface BodyDoublingState {
    activeSessions: BodyDoublingSession[];
    currentSession: BodyDoublingSession | null;
    currentPartner: any | null;
    checkInStatus: 'working' | 'break' | 'distracted' | null;
}

interface ChatState {
    messages: ChatMessage[];
    typingUsers: Array<{ userId: string; username: string; spaceId?: string }>;
    unreadCount: number;
    currentSpace: string | null;
}

interface RealTimeState {
    connection: ConnectionState;
    focus: FocusState;
    bodyDoubling: BodyDoublingState;
    chat: ChatState;
}

type RealTimeAction =
    // Connection actions
    | { type: 'CONNECTION_CONNECTING' }
    | { type: 'CONNECTION_CONNECTED' }
    | { type: 'CONNECTION_DISCONNECTED'; payload: { reason: string } }
    | { type: 'CONNECTION_ERROR'; payload: { error: string } }
    | { type: 'CONNECTION_RECONNECT_ATTEMPT'; payload: { attempt: number } }

    // Focus session actions
    | { type: 'FOCUS_SESSION_STARTED'; payload: { session: FocusSession } }
    | { type: 'FOCUS_SESSION_UPDATED'; payload: { session: FocusSession } }
    | { type: 'FOCUS_SESSION_ENDED'; payload: { sessionId: string } }
    | { type: 'FOCUS_USER_JOINED'; payload: { sessionId: string; user: any } }
    | { type: 'FOCUS_USER_LEFT'; payload: { sessionId: string; userId: string } }
    | { type: 'FOCUS_DISTRACTION_ALERT'; payload: { sessionId: string; userId: string; level: number } }
    | { type: 'FOCUS_FLOW_STATE_DETECTED'; payload: { sessionId: string; userId: string } }
    | { type: 'FOCUS_SET_CURRENT_SESSION'; payload: { session: FocusSession | null } }

    // Body doubling actions
    | { type: 'BODY_DOUBLING_SESSION_CREATED'; payload: { session: BodyDoublingSession } }
    | { type: 'BODY_DOUBLING_SESSION_UPDATED'; payload: { session: BodyDoublingSession } }
    | { type: 'BODY_DOUBLING_USER_JOINED'; payload: { sessionId: string; user: any } }
    | { type: 'BODY_DOUBLING_USER_LEFT'; payload: { sessionId: string; userId: string } }
    | { type: 'BODY_DOUBLING_TASK_UPDATED'; payload: { sessionId: string; userId: string; task: string } }
    | { type: 'BODY_DOUBLING_FOCUS_LEVEL_UPDATED'; payload: { sessionId: string; userId: string; level: number } }
    | { type: 'BODY_DOUBLING_PARTNER_MATCHED'; payload: { partnerId: string; partnerData: any } }
    | { type: 'BODY_DOUBLING_CHECK_IN'; payload: { sessionId: string; userId: string; status: string } }
    | { type: 'BODY_DOUBLING_SET_CURRENT_SESSION'; payload: { session: BodyDoublingSession | null } }

    // Chat actions
    | { type: 'CHAT_MESSAGE_RECEIVED'; payload: { message: ChatMessage } }
    | { type: 'CHAT_USER_TYPING'; payload: { userId: string; username: string; spaceId?: string } }
    | { type: 'CHAT_USER_STOPPED_TYPING'; payload: { userId: string; spaceId?: string } }
    | { type: 'CHAT_READABILITY_SCORED'; payload: { messageId: string; score: number; suggestions: string[] } }
    | { type: 'CHAT_VOICE_MESSAGE_PROCESSED'; payload: { messageId: string; transcript: string } }
    | { type: 'CHAT_SET_CURRENT_SPACE'; payload: { spaceId: string | null } }
    | { type: 'CHAT_MARK_AS_READ' }
    | { type: 'CHAT_CLEAR_MESSAGES' };

const initialState: RealTimeState = {
    connection: {
        isConnected: false,
        isConnecting: false,
        reconnectAttempts: 0,
        lastError: null,
    },
    focus: {
        activeSessions: [],
        currentSession: null,
        recentDistraction: false,
        flowStateActive: false,
    },
    bodyDoubling: {
        activeSessions: [],
        currentSession: null,
        currentPartner: null,
        checkInStatus: null,
    },
    chat: {
        messages: [],
        typingUsers: [],
        unreadCount: 0,
        currentSpace: null,
    },
};

function realTimeReducer(state: RealTimeState, action: RealTimeAction): RealTimeState {
    switch (action.type) {
        // Connection reducers
        case 'CONNECTION_CONNECTING':
            return {
                ...state,
                connection: {
                    ...state.connection,
                    isConnecting: true,
                    lastError: null,
                },
            };

        case 'CONNECTION_CONNECTED':
            return {
                ...state,
                connection: {
                    isConnected: true,
                    isConnecting: false,
                    reconnectAttempts: 0,
                    lastError: null,
                },
            };

        case 'CONNECTION_DISCONNECTED':
            return {
                ...state,
                connection: {
                    ...state.connection,
                    isConnected: false,
                    isConnecting: false,
                },
            };

        case 'CONNECTION_ERROR':
            return {
                ...state,
                connection: {
                    ...state.connection,
                    isConnecting: false,
                    lastError: action.payload.error,
                },
            };

        case 'CONNECTION_RECONNECT_ATTEMPT':
            return {
                ...state,
                connection: {
                    ...state.connection,
                    reconnectAttempts: action.payload.attempt,
                },
            };

        // Focus session reducers
        case 'FOCUS_SESSION_STARTED':
            return {
                ...state,
                focus: {
                    ...state.focus,
                    activeSessions: [...state.focus.activeSessions, action.payload.session],
                },
            };

        case 'FOCUS_SESSION_UPDATED':
            return {
                ...state,
                focus: {
                    ...state.focus,
                    activeSessions: state.focus.activeSessions.map(session =>
                        session.id === action.payload.session.id ? action.payload.session : session
                    ),
                    currentSession: state.focus.currentSession?.id === action.payload.session.id
                        ? action.payload.session
                        : state.focus.currentSession,
                },
            };

        case 'FOCUS_SESSION_ENDED':
            return {
                ...state,
                focus: {
                    ...state.focus,
                    activeSessions: state.focus.activeSessions.filter(
                        session => session.id !== action.payload.sessionId
                    ),
                    currentSession: state.focus.currentSession?.id === action.payload.sessionId
                        ? null
                        : state.focus.currentSession,
                    flowStateActive: false,
                },
            };

        case 'FOCUS_DISTRACTION_ALERT':
            return {
                ...state,
                focus: {
                    ...state.focus,
                    recentDistraction: true,
                    flowStateActive: false,
                },
            };

        case 'FOCUS_FLOW_STATE_DETECTED':
            return {
                ...state,
                focus: {
                    ...state.focus,
                    flowStateActive: true,
                    recentDistraction: false,
                },
            };

        case 'FOCUS_SET_CURRENT_SESSION':
            return {
                ...state,
                focus: {
                    ...state.focus,
                    currentSession: action.payload.session,
                },
            };

        // Body doubling reducers
        case 'BODY_DOUBLING_SESSION_CREATED':
            return {
                ...state,
                bodyDoubling: {
                    ...state.bodyDoubling,
                    activeSessions: [...state.bodyDoubling.activeSessions, action.payload.session],
                },
            };

        case 'BODY_DOUBLING_SESSION_UPDATED':
            return {
                ...state,
                bodyDoubling: {
                    ...state.bodyDoubling,
                    activeSessions: state.bodyDoubling.activeSessions.map(session =>
                        session.id === action.payload.session.id ? action.payload.session : session
                    ),
                    currentSession: state.bodyDoubling.currentSession?.id === action.payload.session.id
                        ? action.payload.session
                        : state.bodyDoubling.currentSession,
                },
            };

        case 'BODY_DOUBLING_PARTNER_MATCHED':
            return {
                ...state,
                bodyDoubling: {
                    ...state.bodyDoubling,
                    currentPartner: action.payload.partnerData,
                },
            };

        case 'BODY_DOUBLING_CHECK_IN':
            return {
                ...state,
                bodyDoubling: {
                    ...state.bodyDoubling,
                    checkInStatus: action.payload.status as any,
                },
            };

        case 'BODY_DOUBLING_SET_CURRENT_SESSION':
            return {
                ...state,
                bodyDoubling: {
                    ...state.bodyDoubling,
                    currentSession: action.payload.session,
                },
            };

        // Chat reducers
        case 'CHAT_MESSAGE_RECEIVED':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    messages: [...state.chat.messages, action.payload.message].slice(-100), // Keep last 100 messages
                    unreadCount: state.chat.unreadCount + 1,
                },
            };

        case 'CHAT_USER_TYPING':
            const typingUser = {
                userId: action.payload.userId,
                username: action.payload.username,
                spaceId: action.payload.spaceId,
            };

            return {
                ...state,
                chat: {
                    ...state.chat,
                    typingUsers: [
                        ...state.chat.typingUsers.filter(user => user.userId !== action.payload.userId),
                        typingUser,
                    ],
                },
            };

        case 'CHAT_USER_STOPPED_TYPING':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    typingUsers: state.chat.typingUsers.filter(
                        user => user.userId !== action.payload.userId
                    ),
                },
            };

        case 'CHAT_SET_CURRENT_SPACE':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    currentSpace: action.payload.spaceId,
                },
            };

        case 'CHAT_MARK_AS_READ':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    unreadCount: 0,
                },
            };

        case 'CHAT_CLEAR_MESSAGES':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    messages: [],
                    unreadCount: 0,
                },
            };

        default:
            return state;
    }
}

interface RealTimeContextType {
    // State
    connection: ConnectionState;
    focus: FocusState;
    bodyDoubling: BodyDoublingState;
    chat: ChatState;

    // Actions
    connectSocket: () => Promise<boolean>;
    disconnectSocket: () => void;

    // Focus session actions
    startFocusSession: (data: { type: 'pomodoro' | 'ultradian' | 'flow'; duration: number; spaceId?: string }) => Promise<void>;
    joinFocusSession: (sessionId: string) => Promise<void>;
    endFocusSession: (sessionId: string) => Promise<void>;
    reportDistraction: (sessionId: string, level: number) => Promise<void>;
    setCurrentFocusSession: (session: FocusSession | null) => void;

    // Body doubling actions
    createBodyDoublingSession: (data: { spaceId?: string; maxParticipants?: number }) => Promise<void>;
    joinBodyDoublingSession: (sessionId: string) => Promise<void>;
    updateTask: (sessionId: string, task: string) => Promise<void>;
    updateFocusLevel: (sessionId: string, level: number) => Promise<void>;
    requestPartner: (preferences?: any) => Promise<void>;
    checkIn: (sessionId: string, status: 'working' | 'break' | 'distracted') => Promise<void>;
    setCurrentBodyDoublingSession: (session: BodyDoublingSession | null) => void;

    // Chat actions
    sendMessage: (data: { message: string; spaceId?: string; messageType?: 'text' | 'voice' | 'image' }) => Promise<void>;
    startTyping: (spaceId?: string) => Promise<void>;
    stopTyping: (spaceId?: string) => Promise<void>;
    setCurrentChatSpace: (spaceId: string | null) => void;
    markChatAsRead: () => void;
    clearChatMessages: () => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

interface RealTimeProviderProps {
    children: ReactNode;
}

export function RealTimeProvider({ children }: RealTimeProviderProps) {
    const [state, dispatch] = useReducer(realTimeReducer, initialState);
    const { isAuthenticated, user } = useAuth();

    // Setup socket event listeners
    useEffect(() => {
        if (!isAuthenticated) return;

        console.log('🌐 Setting up real-time event listeners');

        // Connection events
        socketService.on('connected', () => {
            dispatch({ type: 'CONNECTION_CONNECTED' });
        });

        socketService.on('disconnected', (reason: string) => {
            dispatch({ type: 'CONNECTION_DISCONNECTED', payload: { reason } });
        });

        socketService.on('error', (error: Error) => {
            dispatch({ type: 'CONNECTION_ERROR', payload: { error: error.message } });
        });

        socketService.on('reconnected', () => {
            dispatch({ type: 'CONNECTION_CONNECTED' });
        });

        // Focus session events
        socketService.on('focusSessionStarted', (session: FocusSession) => {
            dispatch({ type: 'FOCUS_SESSION_STARTED', payload: { session } });
        });

        socketService.on('focusSessionUpdated', (session: FocusSession) => {
            dispatch({ type: 'FOCUS_SESSION_UPDATED', payload: { session } });
        });

        socketService.on('focusSessionEnded', (sessionId: string) => {
            dispatch({ type: 'FOCUS_SESSION_ENDED', payload: { sessionId } });
        });

        socketService.on('userJoinedFocus', ({ sessionId, user }: any) => {
            dispatch({ type: 'FOCUS_USER_JOINED', payload: { sessionId, user } });
        });

        socketService.on('userLeftFocus', ({ sessionId, userId }: any) => {
            dispatch({ type: 'FOCUS_USER_LEFT', payload: { sessionId, userId } });
        });

        socketService.on('distractionAlert', ({ sessionId, userId, level }: any) => {
            dispatch({ type: 'FOCUS_DISTRACTION_ALERT', payload: { sessionId, userId, level } });
        });

        socketService.on('flowStateDetected', ({ sessionId, userId }: any) => {
            dispatch({ type: 'FOCUS_FLOW_STATE_DETECTED', payload: { sessionId, userId } });
        });

        // Body doubling events
        socketService.on('bodyDoublingSessionCreated', (session: BodyDoublingSession) => {
            dispatch({ type: 'BODY_DOUBLING_SESSION_CREATED', payload: { session } });
        });

        socketService.on('bodyDoublingSessionUpdated', (session: BodyDoublingSession) => {
            dispatch({ type: 'BODY_DOUBLING_SESSION_UPDATED', payload: { session } });
        });

        socketService.on('userJoinedBodyDoubling', ({ sessionId, user }: any) => {
            dispatch({ type: 'BODY_DOUBLING_USER_JOINED', payload: { sessionId, user } });
        });

        socketService.on('userLeftBodyDoubling', ({ sessionId, userId }: any) => {
            dispatch({ type: 'BODY_DOUBLING_USER_LEFT', payload: { sessionId, userId } });
        });

        socketService.on('taskUpdated', ({ sessionId, userId, task }: any) => {
            dispatch({ type: 'BODY_DOUBLING_TASK_UPDATED', payload: { sessionId, userId, task } });
        });

        socketService.on('focusLevelUpdated', ({ sessionId, userId, level }: any) => {
            dispatch({ type: 'BODY_DOUBLING_FOCUS_LEVEL_UPDATED', payload: { sessionId, userId, level } });
        });

        socketService.on('partnerMatched', ({ partnerId, partnerData }: any) => {
            dispatch({ type: 'BODY_DOUBLING_PARTNER_MATCHED', payload: { partnerId, partnerData } });
        });

        socketService.on('checkIn', ({ sessionId, userId, status }: any) => {
            dispatch({ type: 'BODY_DOUBLING_CHECK_IN', payload: { sessionId, userId, status } });
        });

        // Chat events
        socketService.on('messageReceived', (message: ChatMessage) => {
            dispatch({ type: 'CHAT_MESSAGE_RECEIVED', payload: { message } });
        });

        socketService.on('userTyping', ({ userId, username, spaceId }: any) => {
            dispatch({ type: 'CHAT_USER_TYPING', payload: { userId, username, spaceId } });
        });

        socketService.on('userStoppedTyping', ({ userId, spaceId }: any) => {
            dispatch({ type: 'CHAT_USER_STOPPED_TYPING', payload: { userId, spaceId } });
        });

        socketService.on('readabilityScored', ({ messageId, score, suggestions }: any) => {
            dispatch({ type: 'CHAT_READABILITY_SCORED', payload: { messageId, score, suggestions } });
        });

        socketService.on('voiceMessageProcessed', ({ messageId, transcript }: any) => {
            dispatch({ type: 'CHAT_VOICE_MESSAGE_PROCESSED', payload: { messageId, transcript } });
        });

        // Cleanup listeners on unmount
        return () => {
            socketService.removeAllListeners();
        };
    }, [isAuthenticated, user]);

    // Socket connection methods
    const connectSocket = async (): Promise<boolean> => {
        if (!isAuthenticated) return false;

        dispatch({ type: 'CONNECTION_CONNECTING' });
        return await socketService.connect();
    };

    const disconnectSocket = (): void => {
        socketService.disconnect();
    };

    // Focus session methods
    const startFocusSession = async (data: {
        type: 'pomodoro' | 'ultradian' | 'flow';
        duration: number;
        spaceId?: string;
    }): Promise<void> => {
        await socketService.startFocusSession(data);
    };

    const joinFocusSession = async (sessionId: string): Promise<void> => {
        await socketService.joinFocusSession(sessionId);
    };

    const endFocusSession = async (sessionId: string): Promise<void> => {
        await socketService.endFocusSession(sessionId);
    };

    const reportDistraction = async (sessionId: string, level: number): Promise<void> => {
        await socketService.reportDistraction(sessionId, level);
    };

    const setCurrentFocusSession = (session: FocusSession | null): void => {
        dispatch({ type: 'FOCUS_SET_CURRENT_SESSION', payload: { session } });
    };

    // Body doubling methods
    const createBodyDoublingSession = async (data: {
        spaceId?: string;
        maxParticipants?: number;
    }): Promise<void> => {
        await socketService.createBodyDoublingSession(data);
    };

    const joinBodyDoublingSession = async (sessionId: string): Promise<void> => {
        await socketService.joinBodyDoublingSession(sessionId);
    };

    const updateTask = async (sessionId: string, task: string): Promise<void> => {
        await socketService.updateTask(sessionId, task);
    };

    const updateFocusLevel = async (sessionId: string, level: number): Promise<void> => {
        await socketService.updateFocusLevel(sessionId, level);
    };

    const requestPartner = async (preferences?: any): Promise<void> => {
        await socketService.requestPartner(preferences);
    };

    const checkIn = async (sessionId: string, status: 'working' | 'break' | 'distracted'): Promise<void> => {
        await socketService.checkIn(sessionId, status);
    };

    const setCurrentBodyDoublingSession = (session: BodyDoublingSession | null): void => {
        dispatch({ type: 'BODY_DOUBLING_SET_CURRENT_SESSION', payload: { session } });
    };

    // Chat methods
    const sendMessage = async (data: {
        message: string;
        spaceId?: string;
        messageType?: 'text' | 'voice' | 'image';
    }): Promise<void> => {
        await socketService.sendMessage(data);
    };

    const startTyping = async (spaceId?: string): Promise<void> => {
        await socketService.startTyping(spaceId);
    };

    const stopTyping = async (spaceId?: string): Promise<void> => {
        await socketService.stopTyping(spaceId);
    };

    const setCurrentChatSpace = (spaceId: string | null): void => {
        dispatch({ type: 'CHAT_SET_CURRENT_SPACE', payload: { spaceId } });
    };

    const markChatAsRead = (): void => {
        dispatch({ type: 'CHAT_MARK_AS_READ' });
    };

    const clearChatMessages = (): void => {
        dispatch({ type: 'CHAT_CLEAR_MESSAGES' });
    };

    const contextValue: RealTimeContextType = {
        // State
        connection: state.connection,
        focus: state.focus,
        bodyDoubling: state.bodyDoubling,
        chat: state.chat,

        // Actions
        connectSocket,
        disconnectSocket,

        // Focus session actions
        startFocusSession,
        joinFocusSession,
        endFocusSession,
        reportDistraction,
        setCurrentFocusSession,

        // Body doubling actions
        createBodyDoublingSession,
        joinBodyDoublingSession,
        updateTask,
        updateFocusLevel,
        requestPartner,
        checkIn,
        setCurrentBodyDoublingSession,

        // Chat actions
        sendMessage,
        startTyping,
        stopTyping,
        setCurrentChatSpace,
        markChatAsRead,
        clearChatMessages,
    };

    return (
        <RealTimeContext.Provider value={contextValue}>
            {children}
        </RealTimeContext.Provider>
    );
}

export function useRealTime(): RealTimeContextType {
    const context = useContext(RealTimeContext);
    if (context === undefined) {
        throw new Error('useRealTime must be used within a RealTimeProvider');
    }
    return context;
}

// Helper hooks for specific features
export function useFocusSession(): {
    activeSessions: FocusSession[];
    currentSession: FocusSession | null;
    isInFlowState: boolean;
    hasRecentDistraction: boolean;
    startSession: (data: { type: 'pomodoro' | 'ultradian' | 'flow'; duration: number; spaceId?: string }) => Promise<void>;
    joinSession: (sessionId: string) => Promise<void>;
    endSession: (sessionId: string) => Promise<void>;
    reportDistraction: (sessionId: string, level: number) => Promise<void>;
} {
    const { focus, startFocusSession, joinFocusSession, endFocusSession, reportDistraction } = useRealTime();

    return {
        activeSessions: focus.activeSessions,
        currentSession: focus.currentSession,
        isInFlowState: focus.flowStateActive,
        hasRecentDistraction: focus.recentDistraction,
        startSession: startFocusSession,
        joinSession: joinFocusSession,
        endSession: endFocusSession,
        reportDistraction,
    };
}

export function useBodyDoubling(): {
    activeSessions: BodyDoublingSession[];
    currentSession: BodyDoublingSession | null;
    currentPartner: any | null;
    checkInStatus: 'working' | 'break' | 'distracted' | null;
    createSession: (data: { spaceId?: string; maxParticipants?: number }) => Promise<void>;
    joinSession: (sessionId: string) => Promise<void>;
    updateTask: (sessionId: string, task: string) => Promise<void>;
    requestPartner: (preferences?: any) => Promise<void>;
    checkIn: (sessionId: string, status: 'working' | 'break' | 'distracted') => Promise<void>;
} {
    const {
        bodyDoubling,
        createBodyDoublingSession,
        joinBodyDoublingSession,
        updateTask,
        requestPartner,
        checkIn
    } = useRealTime();

    return {
        activeSessions: bodyDoubling.activeSessions,
        currentSession: bodyDoubling.currentSession,
        currentPartner: bodyDoubling.currentPartner,
        checkInStatus: bodyDoubling.checkInStatus,
        createSession: createBodyDoublingSession,
        joinSession: joinBodyDoublingSession,
        updateTask,
        requestPartner,
        checkIn,
    };
}

export function useChat(): {
    messages: ChatMessage[];
    typingUsers: Array<{ userId: string; username: string; spaceId?: string }>;
    unreadCount: number;
    currentSpace: string | null;
    sendMessage: (data: { message: string; spaceId?: string; messageType?: 'text' | 'voice' | 'image' }) => Promise<void>;
    startTyping: (spaceId?: string) => Promise<void>;
    stopTyping: (spaceId?: string) => Promise<void>;
    markAsRead: () => void;
    setCurrentSpace: (spaceId: string | null) => void;
} {
    const {
        chat,
        sendMessage,
        startTyping,
        stopTyping,
        markChatAsRead,
        setCurrentChatSpace
    } = useRealTime();

    return {
        messages: chat.messages,
        typingUsers: chat.typingUsers,
        unreadCount: chat.unreadCount,
        currentSpace: chat.currentSpace,
        sendMessage,
        startTyping,
        stopTyping,
        markAsRead: markChatAsRead,
        setCurrentSpace: setCurrentChatSpace,
    };
}
