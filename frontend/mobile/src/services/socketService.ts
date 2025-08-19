/**
 * 🔌💎⚡ Socket Service - Real-time Communication Hub ⚡💎🔌
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG, SOCKET_EVENTS } from '../config/api';

export interface FocusSession {
    id: string;
    type: 'pomodoro' | 'ultradian' | 'flow';
    duration: number;
    currentTime: number;
    isActive: boolean;
    participants: string[];
    spaceId?: string;
    createdBy: string;
    createdAt: string;
}

export interface BodyDoublingSession {
    id: string;
    participants: Array<{
        userId: string;
        username: string;
        cameraEnabled: boolean;
        micEnabled: boolean;
        currentTask: string;
        focus_level: number;
    }>;
    spaceId?: string;
    maxParticipants: number;
    isActive: boolean;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    readabilityScore?: number;
    timestamp: string;
    spaceId?: string;
    isSystemMessage?: boolean;
    messageType?: 'text' | 'voice' | 'image';
}

class SocketService extends EventEmitter {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private isConnecting = false;
    private authToken: string | null = null;

    constructor() {
        super();
        this.setMaxListeners(50); // ADHD-friendly: Allow many listeners for different components
    }

    async connect(): Promise<boolean> {
        if (this.isConnecting || this.isConnected()) {
            return true;
        }

        this.isConnecting = true;

        try {
            // Get auth token
            this.authToken = await AsyncStorage.getItem('accessToken');

            if (!this.authToken) {
                console.warn('⚠️ No auth token found - connecting as guest');
            }

            // Create socket connection
            this.socket = io(API_CONFIG.BASE_URL.replace('/api', ''), {
                auth: {
                    token: this.authToken
                },
                transports: ['websocket'],
                timeout: API_CONFIG.CONNECTION_TIMEOUT,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
            });

            this.setupEventHandlers();

            // Wait for connection
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, API_CONFIG.CONNECTION_TIMEOUT);

                this.socket!.on('connect', () => {
                    clearTimeout(timeout);
                    console.log('🌐 Socket connected successfully');
                    this.reconnectAttempts = 0;
                    this.isConnecting = false;
                    this.emit('connected');
                    resolve();
                });

                this.socket!.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    console.error('❌ Socket connection error:', error);
                    this.isConnecting = false;
                    reject(error);
                });
            });

            return true;
        } catch (error) {
            console.error('❌ Failed to connect socket:', error);
            this.isConnecting = false;
            return false;
        }
    }

    private setupEventHandlers(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('🌐 Socket connected');
            this.emit('connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            this.emit('disconnected', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.emit('error', error);
            this.handleReconnection();
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
            this.emit('reconnected');
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Socket reconnection failed');
            this.emit('reconnect_failed');
        });

        // Auth events
        this.socket.on('auth_error', (error) => {
            console.error('🔐 Socket auth error:', error);
            this.emit('auth_error', error);
        });

        // ADHD-friendly: Setup namespace-specific event forwarding
        this.setupFocusEvents();
        this.setupBodyDoublingEvents();
        this.setupChatEvents();
    }

    private setupFocusEvents(): void {
        if (!this.socket) return;

        // Focus session events
        this.socket.on(SOCKET_EVENTS.FOCUS.SESSION_STARTED, (session: FocusSession) => {
            console.log('🎯 Focus session started:', session.id);
            this.emit('focusSessionStarted', session);
        });

        this.socket.on(SOCKET_EVENTS.FOCUS.SESSION_UPDATED, (session: FocusSession) => {
            this.emit('focusSessionUpdated', session);
        });

        this.socket.on(SOCKET_EVENTS.FOCUS.SESSION_ENDED, (sessionId: string) => {
            console.log('🏁 Focus session ended:', sessionId);
            this.emit('focusSessionEnded', sessionId);
        });

        this.socket.on(SOCKET_EVENTS.FOCUS.USER_JOINED, ({ sessionId, user }) => {
            console.log('👋 User joined focus session:', user.username);
            this.emit('userJoinedFocus', { sessionId, user });
        });

        this.socket.on(SOCKET_EVENTS.FOCUS.USER_LEFT, ({ sessionId, userId }) => {
            console.log('👋 User left focus session');
            this.emit('userLeftFocus', { sessionId, userId });
        });

        this.socket.on(SOCKET_EVENTS.FOCUS.DISTRACTION_ALERT, ({ sessionId, userId, level }) => {
            console.log('🚨 Distraction alert:', { level });
            this.emit('distractionAlert', { sessionId, userId, level });
        });

        this.socket.on(SOCKET_EVENTS.FOCUS.FLOW_STATE_DETECTED, ({ sessionId, userId }) => {
            console.log('🌊 Flow state detected!');
            this.emit('flowStateDetected', { sessionId, userId });
        });
    }

    private setupBodyDoublingEvents(): void {
        if (!this.socket) return;

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.SESSION_CREATED, (session: BodyDoublingSession) => {
            console.log('👥 Body doubling session created:', session.id);
            this.emit('bodyDoublingSessionCreated', session);
        });

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.SESSION_UPDATED, (session: BodyDoublingSession) => {
            this.emit('bodyDoublingSessionUpdated', session);
        });

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.USER_JOINED, ({ sessionId, user }) => {
            console.log('👋 User joined body doubling:', user.username);
            this.emit('userJoinedBodyDoubling', { sessionId, user });
        });

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.USER_LEFT, ({ sessionId, userId }) => {
            this.emit('userLeftBodyDoubling', { sessionId, userId });
        });

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.TASK_UPDATED, ({ sessionId, userId, task }) => {
            this.emit('taskUpdated', { sessionId, userId, task });
        });

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.FOCUS_LEVEL_UPDATED, ({ sessionId, userId, level }) => {
            this.emit('focusLevelUpdated', { sessionId, userId, level });
        });

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.PARTNER_MATCHED, ({ partnerId, partnerData }) => {
            console.log('🤝 Body doubling partner matched!');
            this.emit('partnerMatched', { partnerId, partnerData });
        });

        this.socket.on(SOCKET_EVENTS.BODY_DOUBLING.CHECK_IN, ({ sessionId, userId, status }) => {
            this.emit('checkIn', { sessionId, userId, status });
        });
    }

    private setupChatEvents(): void {
        if (!this.socket) return;

        this.socket.on(SOCKET_EVENTS.CHAT.MESSAGE_RECEIVED, (message: ChatMessage) => {
            console.log(`💬 Message from ${message.username}: ${message.message.substring(0, 50)}...`);
            this.emit('messageReceived', message);
        });

        this.socket.on(SOCKET_EVENTS.CHAT.USER_TYPING, ({ userId, username, spaceId }) => {
            this.emit('userTyping', { userId, username, spaceId });
        });

        this.socket.on(SOCKET_EVENTS.CHAT.USER_STOPPED_TYPING, ({ userId, spaceId }) => {
            this.emit('userStoppedTyping', { userId, spaceId });
        });

        this.socket.on(SOCKET_EVENTS.CHAT.READABILITY_SCORED, ({ messageId, score, suggestions }) => {
            this.emit('readabilityScored', { messageId, score, suggestions });
        });

        this.socket.on(SOCKET_EVENTS.CHAT.VOICE_MESSAGE_PROCESSED, ({ messageId, transcript }) => {
            this.emit('voiceMessageProcessed', { messageId, transcript });
        });
    }

    private handleReconnection(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            this.emit('maxReconnectAttemptsReached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

        console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            if (!this.isConnected()) {
                this.connect().catch(console.error);
            }
        }, delay);
    }

    // Connection utilities
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    disconnect(): void {
        if (this.socket) {
            console.log('🔌 Disconnecting socket');
            this.socket.disconnect();
            this.socket = null;
        }
        this.emit('disconnected', 'manual');
    }

    // Focus session methods
    async joinFocusSession(sessionId: string): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        console.log('🎯 Joining focus session:', sessionId);
        this.socket.emit(SOCKET_EVENTS.FOCUS.JOIN_SESSION, { sessionId });
    }

    async startFocusSession(data: {
        type: 'pomodoro' | 'ultradian' | 'flow';
        duration: number;
        spaceId?: string;
    }): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        console.log('🎯 Starting focus session:', data.type);
        this.socket.emit(SOCKET_EVENTS.FOCUS.START_SESSION, data);
    }

    async updateFocusSession(sessionId: string, updates: Partial<FocusSession>): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.FOCUS.UPDATE_SESSION, { sessionId, updates });
    }

    async endFocusSession(sessionId: string): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        console.log('🏁 Ending focus session:', sessionId);
        this.socket.emit(SOCKET_EVENTS.FOCUS.END_SESSION, { sessionId });
    }

    async reportDistraction(sessionId: string, level: number): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.FOCUS.REPORT_DISTRACTION, { sessionId, level });
    }

    // Body doubling methods
    async createBodyDoublingSession(data: {
        spaceId?: string;
        maxParticipants?: number;
    }): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        console.log('👥 Creating body doubling session');
        this.socket.emit(SOCKET_EVENTS.BODY_DOUBLING.CREATE_SESSION, data);
    }

    async joinBodyDoublingSession(sessionId: string): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        console.log('👥 Joining body doubling session:', sessionId);
        this.socket.emit(SOCKET_EVENTS.BODY_DOUBLING.JOIN_SESSION, { sessionId });
    }

    async updateTask(sessionId: string, task: string): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.BODY_DOUBLING.UPDATE_TASK, { sessionId, task });
    }

    async updateFocusLevel(sessionId: string, level: number): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.BODY_DOUBLING.UPDATE_FOCUS_LEVEL, { sessionId, level });
    }

    async requestPartner(preferences?: any): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        console.log('🤝 Requesting body doubling partner');
        this.socket.emit(SOCKET_EVENTS.BODY_DOUBLING.REQUEST_PARTNER, { preferences });
    }

    async checkIn(sessionId: string, status: 'working' | 'break' | 'distracted'): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.BODY_DOUBLING.CHECK_IN, { sessionId, status });
    }

    // Chat methods
    async sendMessage(data: {
        message: string;
        spaceId?: string;
        messageType?: 'text' | 'voice' | 'image';
    }): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        console.log('💬 Sending message:', data.message.substring(0, 50) + '...');
        this.socket.emit(SOCKET_EVENTS.CHAT.SEND_MESSAGE, data);
    }

    async startTyping(spaceId?: string): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.CHAT.START_TYPING, { spaceId });
    }

    async stopTyping(spaceId?: string): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.CHAT.STOP_TYPING, { spaceId });
    }

    async requestReadabilityCheck(messageId: string): Promise<void> {
        if (!this.socket) throw new Error('Socket not connected');

        this.socket.emit(SOCKET_EVENTS.CHAT.REQUEST_READABILITY_CHECK, { messageId });
    }

    // Utility methods
    async updateAuthToken(): Promise<void> {
        const newToken = await AsyncStorage.getItem('accessToken');
        if (newToken !== this.authToken) {
            this.authToken = newToken;
            if (this.socket && this.isConnected()) {
                this.socket.auth = { token: newToken };
                this.socket.disconnect().connect();
            }
        }
    }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
