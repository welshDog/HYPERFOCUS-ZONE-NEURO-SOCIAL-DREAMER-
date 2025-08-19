/**
 * 🌐💎⚡ API Configuration - Backend Connection Settings ⚡💎🌐
 */

// API Configuration
export const API_CONFIG = {
    // Backend API Base URL
    BASE_URL: __DEV__ ? 'http://localhost:5000/api' : 'https://api.hyperfocus-zone.com/api',

    // Socket.IO Server URL
    SOCKET_URL: __DEV__ ? 'http://localhost:5000' : 'https://api.hyperfocus-zone.com',

    // Request timeout (30 seconds)
    TIMEOUT: 30000,

    // Connection timeout (faster feedback for ADHD users)
    CONNECTION_TIMEOUT: 10000,

    // Retry configuration
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,

    // Cache configuration
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile',
        ME: '/auth/me',
        UPDATE_PROFILE: '/auth/profile',
        DELETE_ACCOUNT: '/auth/account',
        VERIFY_EMAIL: '/auth/verify-email',
        RESET_PASSWORD: '/auth/reset-password',
        CHANGE_PASSWORD: '/auth/change-password',
    },

    // User Management
    USERS: {
        LIST: '/users',
        GET: '/users/:id',
        UPDATE: '/users/:id',
        SEARCH: '/users/search',
        FOLLOW: '/users/:id/follow',
        UNFOLLOW: '/users/:id/unfollow',
        FOLLOWERS: '/users/:id/followers',
        FOLLOWING: '/users/:id/following',
        ACTIVITY: '/users/:id/activity',
        PREFERENCES: '/users/:id/preferences',
    },

    // Spaces Management
    SPACES: {
        LIST: '/spaces',
        CREATE: '/spaces',
        GET: (spaceId: string) => `/spaces/${spaceId}`,
        UPDATE: '/spaces/:id',
        DELETE: '/spaces/:id',
        JOIN: (spaceId: string) => `/spaces/${spaceId}/join`,
        LEAVE: (spaceId: string) => `/spaces/${spaceId}/leave`,
        MEMBERS: (spaceId: string) => `/spaces/${spaceId}/members`,
        UPDATE_HYPERFOCUS: (spaceId: string) => `/spaces/${spaceId}/hyperfocus`,
        INVITE: '/spaces/:id/invite',
        SEARCH: '/spaces/search',
        POPULAR: '/spaces/popular',
        RECOMMENDED: '/spaces/recommended',
        MY_SPACES: '/spaces/my-spaces',
    },

    // Focus Sessions
    FOCUS: {
        LIST: '/focus/sessions',
        CREATE: '/focus/sessions',
        GET: '/focus/sessions/:id',
        UPDATE: '/focus/sessions/:id',
        DELETE: '/focus/sessions/:id',
        JOIN: '/focus/sessions/:id/join',
        LEAVE: '/focus/sessions/:id/leave',
        STATS: '/focus/stats',
        REPORT_DISTRACTION: '/focus/sessions/:id/distraction',
        REPORT_FLOW_STATE: '/focus/sessions/:id/flow-state',
        ENERGY_CHECKIN: '/focus/sessions/:id/energy',
        ANALYTICS: '/focus/analytics',
    },

    // Body Doubling
    BODY_DOUBLING: {
        LIST: '/body-doubling/sessions',
        CREATE: '/body-doubling/sessions',
        GET: '/body-doubling/sessions/:id',
        UPDATE: '/body-doubling/sessions/:id',
        DELETE: '/body-doubling/sessions/:id',
        JOIN: '/body-doubling/sessions/:id/join',
        LEAVE: '/body-doubling/sessions/:id/leave',
        REQUEST_PARTNER: '/body-doubling/request-partner',
        ACCEPT_PARTNER: '/body-doubling/accept-partner/:id',
        DECLINE_PARTNER: '/body-doubling/decline-partner/:id',
        REPORT_TASK: '/body-doubling/sessions/:id/task',
        CHECK_IN: '/body-doubling/sessions/:id/checkin',
    },

    // Chat & Messaging
    CHAT: {
        SPACES: '/chat/spaces/:spaceId/messages',
        SEND: '/chat/spaces/:spaceId/messages',
        GET_MESSAGES: '/chat/spaces/:spaceId/messages',
        EDIT_MESSAGE: '/chat/messages/:messageId',
        DELETE_MESSAGE: '/chat/messages/:messageId',
        REACT_MESSAGE: '/chat/messages/:messageId/react',
        REPORT_MESSAGE: '/chat/messages/:messageId/report',
        VOICE_MESSAGE: '/chat/spaces/:spaceId/voice',
        UPLOAD_FILE: '/chat/upload',
    },

    // Notifications
    NOTIFICATIONS: {
        LIST: '/notifications',
        GET: '/notifications/:id',
        MARK_READ: '/notifications/:id/read',
        MARK_ALL_READ: '/notifications/mark-all-read',
        DELETE: '/notifications/:id',
        SETTINGS: '/notifications/settings',
        SUBSCRIBE: '/notifications/subscribe',
        UNSUBSCRIBE: '/notifications/unsubscribe',
    },
};

// Socket.IO Namespaces
export const SOCKET_NAMESPACES = {
    MAIN: '/',
    FOCUS: '/focus',
    BODY_DOUBLING: '/body-doubling',
    CHAT: '/chat',
};

// Socket Events
export const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',

    // Focus Sessions
    FOCUS: {
        START_SESSION: 'start-focus-session',
        END_SESSION: 'end-focus-session',
        JOIN_SESSION: 'join-focus-session',
        UPDATE_SESSION: 'update-focus-session',
        REPORT_DISTRACTION: 'report-distraction',
        REPORT_FLOW_STATE: 'report-flow-state',
        ENERGY_CHECKIN: 'energy-checkin',
        SESSION_STARTED: 'focus-session-started',
        SESSION_ENDED: 'focus-session-ended',
        SESSION_UPDATED: 'focus-session-updated',
        USER_JOINED: 'focus-user-joined',
        USER_LEFT: 'focus-user-left',
        DISTRACTION_ALERT: 'focus-distraction-alert',
        FLOW_STATE_DETECTED: 'focus-flow-state-detected',
        TIMER_UPDATE: 'timer-update',
        PHASE_COMPLETED: 'phase-completed',
        BREAK_COMPLETED: 'break-completed',
    },

    // Body Doubling
    BODY_DOUBLING: {
        REQUEST_PARTNER: 'request-partner',
        PARTNER_MATCHED: 'partner-matched',
        FOCUS_CHECKIN: 'focus-checkin',
        BREAK_REQUEST: 'break-request',
        TASK_COMPLETION: 'task-completion',
        DISTRACTION_REPORT: 'distraction-report',
        LEAVE_SESSION: 'leave-session',
        PARTNER_LEFT: 'partner-left',
        CREATE_SESSION: 'create-body-doubling-session',
        JOIN_SESSION: 'join-body-doubling-session',
        SESSION_CREATED: 'body-doubling-session-created',
        SESSION_UPDATED: 'body-doubling-session-updated',
        USER_JOINED: 'body-doubling-user-joined',
        USER_LEFT: 'body-doubling-user-left',
        TASK_UPDATED: 'body-doubling-task-updated',
        FOCUS_LEVEL_UPDATED: 'body-doubling-focus-level-updated',
        UPDATE_TASK: 'update-body-doubling-task',
        UPDATE_FOCUS_LEVEL: 'update-body-doubling-focus-level',
        CHECK_IN: 'body-doubling-check-in',
    },

    // Chat
    CHAT: {
        JOIN_SPACE: 'join-space',
        SEND_MESSAGE: 'send-message',
        NEW_MESSAGE: 'new-message',
        MESSAGE_RECEIVED: 'message-received',
        TYPING_START: 'typing-start',
        TYPING_STOP: 'typing-stop',
        USER_TYPING: 'user-typing',
        USER_STOPPED_TYPING: 'user-stopped-typing',
        MESSAGE_REACTION: 'message-reaction',
        VOICE_MESSAGE: 'voice-message',
        START_TYPING: 'start-typing',
        STOP_TYPING: 'stop-typing',
        READABILITY_SCORED: 'readability-scored',
        VOICE_MESSAGE_PROCESSED: 'voice-message-processed',
        REQUEST_READABILITY_CHECK: 'request-readability-check',
    },

    // General Real-time Events
    USER_CONNECTED: 'user-connected',
    USER_DISCONNECTED: 'user-disconnected',
    SPACE_UPDATED: 'space-updated',
    NOTIFICATION_RECEIVED: 'notification-received',
    ERROR: 'error',
    RECONNECT: 'reconnect',
    RECONNECT_ERROR: 'reconnect_error',
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

// Error codes
export const ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    FORBIDDEN: 'FORBIDDEN',
    RATE_LIMITED: 'RATE_LIMITED',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR', // Alias for compatibility
};

// Error types (alias for backward compatibility)
export const ERROR_TYPES = ERROR_CODES;

// Success messages
export const SUCCESS_MESSAGES = {
    LOGIN: 'Successfully logged in! 🎉',
    REGISTER: 'Account created successfully! Welcome to HyperFocus Zone! 🌟',
    LOGOUT: 'Logged out successfully. See you soon! 👋',
    PROFILE_UPDATED: 'Profile updated successfully! ✨',
    PASSWORD_CHANGED: 'Password changed successfully! 🔒',
    EMAIL_VERIFIED: 'Email verified successfully! ✅',
    SESSION_STARTED: 'Focus session started! Let\'s get into the zone! 🎯',
    SESSION_COMPLETED: 'Great job! Session completed! 🏆',
    SPACE_JOINED: 'Welcome to the space! 🚀',
    MESSAGE_SENT: 'Message sent! 💬',
};
