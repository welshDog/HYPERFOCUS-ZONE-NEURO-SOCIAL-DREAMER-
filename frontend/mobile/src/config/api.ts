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

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,

    // File upload limits
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

    // ADHD-friendly settings
    REQUEST_DEBOUNCE: 300, // ms - prevent rapid-fire requests
    CONNECTION_TIMEOUT: 10000, // ms - faster feedback for ADHD users
};

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
        UPDATE_PROFILE: '/auth/profile',
    },

    // Interest Spaces
    SPACES: {
        LIST: '/spaces',
        CREATE: '/spaces',
        GET: (spaceId: string) => `/spaces/${spaceId}`,
        JOIN: (spaceId: string) => `/spaces/${spaceId}/join`,
        LEAVE: (spaceId: string) => `/spaces/${spaceId}/leave`,
        UPDATE_HYPERFOCUS: (spaceId: string) => `/spaces/${spaceId}/hyperfocus`,
        MEMBERS: (spaceId: string) => `/spaces/${spaceId}/members`,
    },

    // Focus Sessions (Future endpoints)
    FOCUS: {
        START: '/focus-sessions/start',
        END: '/focus-sessions/end',
        HISTORY: '/focus-sessions/history',
        TEMPLATES: '/focus-sessions/templates',
    },

    // Body Doubling (Future endpoints)
    BODY_DOUBLING: {
        REQUEST_PARTNER: '/body-doubling/request',
        SESSIONS: '/body-doubling/sessions',
        FEEDBACK: '/body-doubling/feedback',
    },

    // Chat (Future endpoints)
    CHAT: {
        MESSAGES: (spaceId: string) => `/chat/${spaceId}/messages`,
        SEND: (spaceId: string) => `/chat/${spaceId}/send`,
        REACTIONS: (messageId: string) => `/chat/messages/${messageId}/reactions`,
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
        REPORT_DISTRACTION: 'report-distraction',
        REPORT_FLOW_STATE: 'report-flow-state',
        ENERGY_CHECKIN: 'energy-checkin',
        SESSION_STARTED: 'focus-session-started',
        SESSION_ENDED: 'focus-session-ended',
        TIMER_UPDATE: 'timer-update',
        PHASE_COMPLETED: 'focus-phase-completed',
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
    },

    // Chat
    CHAT: {
        JOIN_SPACE: 'join-space-chat',
        SEND_MESSAGE: 'send-message',
        NEW_MESSAGE: 'new-message',
        TYPING_START: 'typing-start',
        TYPING_STOP: 'typing-stop',
        USER_TYPING: 'user-typing',
        MESSAGE_REACTION: 'message-reaction',
        VOICE_MESSAGE: 'voice-message',
    },

    // General
    UPDATE_PRESENCE: 'update-presence',
    USER_PRESENCE_UPDATE: 'user-presence-update',
};

// Error Types
export const ERROR_TYPES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
};

// Success Messages (ADHD-friendly encouragement)
export const SUCCESS_MESSAGES = {
    LOGIN: 'Welcome back! Ready to hyperfocus? 🌟',
    REGISTER: 'Account created! Your ADHD-friendly workspace awaits! 🎉',
    SPACE_JOINED: 'You\'re in! Time to connect with your community! 🚀',
    SPACE_CREATED: 'Space created! You\'re building something amazing! ✨',
    FOCUS_STARTED: 'Focus mode activated! You\'ve got this! 🧠',
    PARTNER_MATCHED: 'Accountability partner found! Let\'s work together! 🤝',
    MESSAGE_SENT: 'Message sent! Great communication! 💬',
};

export default {
    API_CONFIG,
    API_ENDPOINTS,
    SOCKET_NAMESPACES,
    SOCKET_EVENTS,
    ERROR_TYPES,
    SUCCESS_MESSAGES,
};
