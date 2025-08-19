/**
 * 🌟💎⚡ HYPERFOCUS ZONE API SERVER - Real-time Neurodivergent Social Platform ⚡💎🌟
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import route handlers
const authRoutes = require('./routes/auth');
const spacesRoutes = require('./routes/spaces');
// TODO: Create additional route files
// const userRoutes = require('./routes/users');
// const focusSessionRoutes = require('./routes/focusSessions');
// const bodyDoublingRoutes = require('./routes/bodyDoubling');
// const chatRoutes = require('./routes/chat');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Import Socket.IO handlers
const socketAuth = require('./services/socketAuth');
const focusSessionSocket = require('./services/focusSessionSocket');
const bodyDoublingSocket = require('./services/bodyDoublingSocket');
const chatSocket = require('./services/chatSocket');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "ws:", "wss:"]
        }
    }
}));

// Rate limiting for API calls
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8081',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'HyperFocus Zone API',
        version: '1.0.0',
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/spaces', spacesRoutes);
// TODO: Add remaining routes
// app.use('/api/users', authMiddleware, userRoutes);
// app.use('/api/focus-sessions', authMiddleware, focusSessionRoutes);
// app.use('/api/body-doubling', authMiddleware, bodyDoublingRoutes);
// app.use('/api/chat', authMiddleware, chatRoutes);

// 🌟 HYPERFOCUS ZONE Socket.IO Namespace Setup
const mainNamespace = io.of('/');
const focusNamespace = io.of('/focus');
const bodyDoublingNamespace = io.of('/body-doubling');
const chatNamespace = io.of('/chat');

// Socket authentication middleware
mainNamespace.use(socketAuth);
focusNamespace.use(socketAuth);
bodyDoublingNamespace.use(socketAuth);
chatNamespace.use(socketAuth);

// 🧠 Focus Session Real-time Features
focusNamespace.on('connection', (socket) => {
    console.log(`🧠 Focus session connected: ${socket.userId}`);

    // Start focus session
    socket.on('start-focus-session', (sessionData) => {
        focusSessionSocket.startFocusSession(socket, sessionData);
    });

    // Report distraction
    socket.on('report-distraction', (data) => {
        focusSessionSocket.reportDistraction(socket, data);
    });

    // Report flow state
    socket.on('report-flow-state', (data) => {
        focusSessionSocket.reportFlowState(socket, data);
    });

    // Energy check-in
    socket.on('energy-checkin', (data) => {
        focusSessionSocket.handleEnergyCheckin(socket, data);
    });

    // End focus session
    socket.on('end-focus-session', (reason) => {
        focusSessionSocket.endFocusSession(socket, reason);
    });

    socket.on('disconnect', () => {
        focusSessionSocket.handleDisconnect(socket);
    });
});

// 👥 Body Doubling Real-time Features
bodyDoublingNamespace.on('connection', (socket) => {
    console.log(`👥 Body doubling connected: ${socket.userId}`);

    // Request accountability partner
    socket.on('request-partner', (preferences) => {
        bodyDoublingSocket.requestPartner(socket, preferences);
    });

    // Focus check-in
    socket.on('focus-checkin', (data) => {
        bodyDoublingSocket.handleFocusCheckin(socket, data);
    });

    // Break request
    socket.on('break-request', (data) => {
        bodyDoublingSocket.handleBreakRequest(socket, data);
    });

    // Task completion
    socket.on('task-completion', (data) => {
        bodyDoublingSocket.handleTaskCompletion(socket, data);
    });

    // Distraction report
    socket.on('distraction-report', (data) => {
        bodyDoublingSocket.handleDistraction(socket, data);
    });

    // Leave session
    socket.on('leave-session', () => {
        bodyDoublingSocket.leaveSession(socket);
    });

    socket.on('disconnect', () => {
        bodyDoublingSocket.handleDisconnect(socket);
    });
});

// 💬 Chat Real-time Features
chatNamespace.on('connection', (socket) => {
    console.log(`💬 Chat connected: ${socket.userId}`);

    // Join interest space chat
    socket.on('join-space-chat', (spaceId) => {
        chatSocket.joinSpaceChat(socket, spaceId);
    });

    // Send message
    socket.on('send-message', (messageData) => {
        chatSocket.sendMessage(socket, messageData);
    });

    // Typing indicators
    socket.on('typing-start', (data) => {
        chatSocket.handleTypingStart(socket, data);
    });

    socket.on('typing-stop', (data) => {
        chatSocket.handleTypingStop(socket, data);
    });

    // Message reactions
    socket.on('message-reaction', (data) => {
        chatSocket.handleReaction(socket, data);
    });

    // Voice messages
    socket.on('voice-message', (audioData) => {
        chatSocket.handleVoiceMessage(socket, audioData);
    });

    socket.on('disconnect', () => {
        chatSocket.handleDisconnect(socket);
    });
});

// Main namespace for general real-time features
mainNamespace.on('connection', (socket) => {
    console.log(`🌟 User connected: ${socket.userId}`);

    // User presence updates
    socket.on('update-presence', (presence) => {
        socket.broadcast.emit('user-presence-update', {
            userId: socket.userId,
            presence: presence,
            timestamp: new Date().toISOString()
        });
    });

    // Hyperfocus level updates
    socket.on('hyperfocus-update', (level) => {
        socket.broadcast.emit('hyperfocus-level-update', {
            userId: socket.userId,
            level: level,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnect', () => {
        console.log(`🌟 User disconnected: ${socket.userId}`);
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Database connection
const mongoose = require('mongoose');

async function connectDatabase() {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperfocus-zone';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('💎 MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Connect to database before starting server
connectDatabase();

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'The requested resource does not exist',
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🌟 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('🌟 Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🌟 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('🌟 Process terminated');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log('🌟💎⚡ HYPERFOCUS ZONE API SERVER STARTED ⚡💎🌟');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🧠 Focus Sessions: http://localhost:${PORT}/focus`);
    console.log(`👥 Body Doubling: http://localhost:${PORT}/body-doubling`);
    console.log(`💬 Real-time Chat: http://localhost:${PORT}/chat`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log('🌟 Ready for neurodivergent-focused collaboration!');
});

module.exports = { app, server, io };
