/**
 * 🔐💎⚡ Authentication Routes - Secure User Management ⚡💎🔐
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 attempts per window
    message: {
        error: 'Too many authentication attempts. Please try again in 15 minutes.',
        retryAfter: 15 * 60 * 1000
    },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // max 3 registrations per hour per IP
    message: {
        error: 'Too many registration attempts. Please try again in 1 hour.'
    }
});

// Input validation middleware
const validateRegistration = [
    body('username')
        .isLength({ min: 2, max: 50 })
        .withMessage('Username must be between 2-50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    );
};

/**
 * @route POST /api/auth/register
 * @desc Register new user with ADHD-friendly onboarding
 * @access Public
 */
router.post('/register', registerLimiter, validateRegistration, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { username, email, password, neurodivergentProfile = {} } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: existingUser.email === email ?
                    'An account with this email already exists' :
                    'This username is already taken'
            });
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Generate unique user ID
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create user with ADHD-optimized defaults
        const user = new User({
            userId,
            username,
            email,
            passwordHash,
            profile: {
                displayName: username,
                timezone: req.body.timezone || 'UTC',
                language: req.body.language || 'en'
            },
            neurodivergentProfile: {
                isNeurodivergent: neurodivergentProfile.isNeurodivergent || false,
                conditions: neurodivergentProfile.conditions || [],
                accommodations: {
                    largeText: false,
                    highContrast: false,
                    reduceMotion: false,
                    screenReader: false,
                    subtitles: false,
                    ...neurodivergentProfile.accommodations
                },
                focusPreferences: {
                    preferredSessionLength: 25,
                    breakLength: 5,
                    backgroundSounds: 'none',
                    visualMode: 'minimal',
                    distractionLevel: 'medium',
                    energyTracking: true,
                    ...neurodivergentProfile.focusPreferences
                }
            },
            socialPreferences: {
                visibility: 'friends',
                allowBodyDoubling: true,
                shareProgress: true,
                communicationLevel: 'moderate'
            },
            gamification: {
                level: 1,
                xp: 0,
                streak: 0,
                lastActiveDate: new Date(),
                achievements: [],
                badges: []
            }
        });

        await user.save();

        // Generate tokens
        const accessToken = generateToken(userId);
        const refreshToken = generateRefreshToken(userId);

        // Set secure cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to HYPERFOCUS ZONE! 🎉',
            data: {
                user: {
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    neurodivergentProfile: user.neurodivergentProfile,
                    socialPreferences: user.socialPreferences,
                    gamification: user.gamification
                },
                accessToken,
                onboardingComplete: false,
                welcomeMessage: 'Your ADHD-friendly workspace is ready! Let\'s set up your focus preferences.'
            }
        });

        console.log(`✅ New user registered: ${username} (${userId})`);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.'
        });
    }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return tokens
 * @access Public
 */
router.post('/login', authLimiter, validateLogin, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password format'
            });
        }

        const { email, password, rememberMe = false } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last active
        user.lastActive = new Date();
        await user.save();

        // Generate tokens
        const tokenExpiry = rememberMe ? '30d' : '7d';
        const accessToken = jwt.sign(
            { userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: tokenExpiry }
        );
        const refreshToken = generateRefreshToken(user.userId);

        // Set secure cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Calculate current streak
        const today = new Date().toISOString().split('T')[0];
        const lastActiveDate = user.gamification.lastActiveDate?.toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let currentStreak = user.gamification.streak;
        if (lastActiveDate === yesterday) {
            currentStreak += 1;
        } else if (lastActiveDate !== today) {
            currentStreak = 1;
        }

        // Update streak
        user.gamification.streak = currentStreak;
        user.gamification.lastActiveDate = new Date();
        await user.save();

        res.json({
            success: true,
            message: `Welcome back, ${user.username}! 🌟`,
            data: {
                user: {
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    neurodivergentProfile: user.neurodivergentProfile,
                    socialPreferences: user.socialPreferences,
                    gamification: {
                        ...user.gamification.toObject(),
                        streak: currentStreak
                    }
                },
                accessToken,
                streakUpdate: currentStreak > user.gamification.streak,
                dailyMotivation: getDailyMotivation(currentStreak)
            }
        });

        console.log(`✅ User logged in: ${user.username} (streak: ${currentStreak})`);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.'
        });
    }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Private
 */
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: 'No refresh token provided'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token type'
            });
        }

        // Check if user still exists and is active
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

        // Generate new access token
        const accessToken = generateToken(user.userId);

        res.json({
            success: true,
            data: {
                accessToken,
                user: {
                    userId: user.userId,
                    username: user.username,
                    profile: user.profile
                }
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid refresh token'
        });
    }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user and clear tokens
 * @access Private
 */
router.post('/logout', async (req, res) => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Logged out successfully. See you next time! 👋'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', async (req, res) => {
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
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    neurodivergentProfile: user.neurodivergentProfile,
                    socialPreferences: user.socialPreferences,
                    gamification: user.gamification,
                    lastActive: user.lastActive,
                    memberSince: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
});

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', async (req, res) => {
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
                error: 'User not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'profile.displayName',
            'profile.bio',
            'profile.pronouns',
            'profile.timezone',
            'profile.language',
            'neurodivergentProfile',
            'socialPreferences'
        ];

        const updates = req.body;

        // Safely update nested fields
        if (updates.profile) {
            Object.keys(updates.profile).forEach(key => {
                if (['displayName', 'bio', 'pronouns', 'timezone', 'language'].includes(key)) {
                    user.profile[key] = updates.profile[key];
                }
            });
        }

        if (updates.neurodivergentProfile) {
            Object.keys(updates.neurodivergentProfile).forEach(key => {
                if (['isNeurodivergent', 'conditions', 'accommodations', 'focusPreferences'].includes(key)) {
                    if (key === 'accommodations' || key === 'focusPreferences') {
                        user.neurodivergentProfile[key] = {
                            ...user.neurodivergentProfile[key].toObject(),
                            ...updates.neurodivergentProfile[key]
                        };
                    } else {
                        user.neurodivergentProfile[key] = updates.neurodivergentProfile[key];
                    }
                }
            });
        }

        if (updates.socialPreferences) {
            user.socialPreferences = {
                ...user.socialPreferences.toObject(),
                ...updates.socialPreferences
            };
        }

        user.updatedAt = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully! 🎉',
            data: {
                user: {
                    userId: user.userId,
                    username: user.username,
                    profile: user.profile,
                    neurodivergentProfile: user.neurodivergentProfile,
                    socialPreferences: user.socialPreferences
                }
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Profile update failed'
        });
    }
});

// Helper function for daily motivation
function getDailyMotivation(streak) {
    const motivations = [
        "Every journey begins with a single step! 🌱",
        "Consistency is key - you're building something amazing! ⚡",
        "Look at that streak! You're on fire! 🔥",
        "Your commitment is inspiring! Keep going! 🌟",
        "Wow! You're absolutely crushing it! 💎",
        "Legend status achieved! Nothing can stop you now! 🏆"
    ];

    if (streak === 1) return motivations[0];
    if (streak < 7) return motivations[1];
    if (streak < 14) return motivations[2];
    if (streak < 30) return motivations[3];
    if (streak < 60) return motivations[4];
    return motivations[5];
}

module.exports = router;
