/**
 * 🔌💎⚡ Socket Authentication Middleware - WebSocket JWT Verification ⚡💎🔌
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const socketAuth = async (socket, next) => {
    try {
        // Get token from handshake auth or query
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user in database
        const user = await User.findOne({
            userId: decoded.userId,
            isActive: true
        });

        if (!user) {
            return next(new Error('User not found or account deactivated'));
        }

        // Attach user data to socket
        socket.userId = user.userId;
        socket.userData = {
            username: user.username,
            displayName: user.profile.displayName,
            avatar: user.profile.avatar,
            level: user.gamification.level,
            neurodivergentProfile: user.neurodivergentProfile,
            socialPreferences: user.socialPreferences
        };

        // Update user's last active time
        user.lastActive = new Date();
        await user.save();

        console.log(`🔌 Socket authenticated: ${user.username} (${user.userId})`);
        next();
    } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
    }
};

module.exports = socketAuth;
