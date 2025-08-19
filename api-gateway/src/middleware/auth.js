/**
 * 🔐💎⚡ Authentication Middleware - JWT Token Verification ⚡💎🔐
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authorization token provided'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({
            userId: decoded.userId,
            isActive: true
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found or account deactivated'
            });
        }

        // Update last active time
        user.lastActive = new Date();
        await user.save();

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

module.exports = authMiddleware;
