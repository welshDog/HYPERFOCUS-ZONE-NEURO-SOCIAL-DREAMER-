/**
 * 🌟💎⚡ Interest Spaces Routes - Hyperfocus Communities API ⚡💎🌟
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult, query } = require('express-validator');
const { InterestSpace, User, Message } = require('../models');

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
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

// Input validation
const validateSpaceCreation = [
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Space name must be between 2-100 characters')
        .trim(),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must be under 1000 characters'),
    body('category')
        .isIn(['Technology', 'Art & Creativity', 'Science', 'Gaming', 'Health & Wellness',
            'Education', 'Music', 'Sports', 'Literature', 'Other'])
        .withMessage('Invalid category'),
    body('tags')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Maximum 10 tags allowed'),
    body('privacy')
        .optional()
        .isIn(['public', 'private', 'invite-only'])
        .withMessage('Invalid privacy setting')
];

/**
 * @route GET /api/spaces
 * @desc Get list of interest spaces with filters
 * @access Private
 */
router.get('/', authenticateToken, [
    query('category').optional().isString(),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sort').optional().isIn(['newest', 'popular', 'active', 'alphabetical'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameters',
                details: errors.array()
            });
        }

        const {
            category,
            search,
            page = 1,
            limit = 20,
            sort = 'popular'
        } = req.query;

        // Build query
        const query = { isActive: true };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Only show public spaces or spaces user is a member of
        query.$or = [
            { 'settings.privacy': 'public' },
            { 'members.userId': req.user.userId }
        ];

        // Build sort
        let sortOption = {};
        switch (sort) {
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'popular':
                sortOption = { 'statistics.memberCount': -1 };
                break;
            case 'active':
                sortOption = { 'statistics.messageCount': -1 };
                break;
            case 'alphabetical':
                sortOption = { name: 1 };
                break;
            default:
                sortOption = { 'statistics.memberCount': -1 };
        }

        const skip = (page - 1) * limit;

        const [spaces, totalCount] = await Promise.all([
            InterestSpace.find(query)
                .select('spaceId name description category tags creator statistics settings createdAt members')
                .populate('creator', 'username profile.displayName')
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit)),
            InterestSpace.countDocuments(query)
        ]);

        // Add user membership status
        const spacesWithMembership = spaces.map(space => {
            const isMember = space.members.some(member => member.userId === req.user.userId);
            const membershipInfo = space.members.find(member => member.userId === req.user.userId);

            return {
                ...space.toObject(),
                isMember,
                userRole: membershipInfo?.role || null,
                hyperfocusLevel: membershipInfo?.hyperfocusLevel || null,
                members: undefined // Remove members array for privacy
            };
        });

        res.json({
            success: true,
            data: {
                spaces: spacesWithMembership,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    hasNext: page * limit < totalCount,
                    hasPrev: page > 1
                },
                filters: {
                    category,
                    search,
                    sort
                }
            }
        });
    } catch (error) {
        console.error('Get spaces error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch interest spaces'
        });
    }
});

/**
 * @route POST /api/spaces
 * @desc Create new interest space
 * @access Private
 */
router.post('/', authenticateToken, validateSpaceCreation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const {
            name,
            description = '',
            category,
            tags = [],
            privacy = 'public',
            allowBodyDoubling = true,
            allowFocusSessions = true,
            neurodivergentFriendly = true
        } = req.body;

        // Generate unique space ID
        const spaceId = `space_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const space = new InterestSpace({
            spaceId,
            name: name.trim(),
            description: description.trim(),
            category,
            tags: tags.filter(tag => tag && tag.trim()).map(tag => tag.trim().toLowerCase()),
            creator: req.user.userId,
            moderators: [req.user.userId],
            members: [{
                userId: req.user.userId,
                joinedAt: new Date(),
                role: 'admin',
                hyperfocusLevel: 8 // Creator starts with high engagement
            }],
            settings: {
                privacy,
                allowBodyDoubling,
                allowFocusSessions,
                moderationLevel: 'moderate',
                neurodivergentFriendly
            },
            statistics: {
                memberCount: 1,
                messageCount: 0,
                activeFocusSessions: 0,
                bodyDoublingPairs: 0
            }
        });

        await space.save();

        // Add creator achievement
        req.user.gamification.xp += 50; // XP for creating space
        req.user.gamification.achievements.push({
            id: 'space-creator',
            name: 'Space Creator',
            description: 'Created your first interest space',
            earnedAt: new Date(),
            category: 'social'
        });
        await req.user.save();

        res.status(201).json({
            success: true,
            message: 'Interest space created successfully! 🎉',
            data: {
                space: {
                    spaceId: space.spaceId,
                    name: space.name,
                    description: space.description,
                    category: space.category,
                    tags: space.tags,
                    settings: space.settings,
                    statistics: space.statistics,
                    createdAt: space.createdAt,
                    userRole: 'admin'
                },
                xpGained: 50,
                achievementUnlocked: 'Space Creator'
            }
        });

        console.log(`🌟 New interest space created: ${name} by ${req.user.username}`);
    } catch (error) {
        console.error('Create space error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create interest space'
        });
    }
});

/**
 * @route GET /api/spaces/:spaceId
 * @desc Get specific interest space details
 * @access Private
 */
router.get('/:spaceId', authenticateToken, async (req, res) => {
    try {
        const { spaceId } = req.params;

        const space = await InterestSpace.findOne({
            spaceId,
            isActive: true
        })
            .populate('creator', 'username profile.displayName profile.avatar')
            .populate('moderators', 'username profile.displayName');

        if (!space) {
            return res.status(404).json({
                success: false,
                error: 'Interest space not found'
            });
        }

        // Check access permissions
        const isMember = space.members.some(member => member.userId === req.user.userId);
        const isPublic = space.settings.privacy === 'public';

        if (!isPublic && !isMember) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. This is a private space.'
            });
        }

        // Get user's membership info
        const membershipInfo = space.members.find(member => member.userId === req.user.userId);

        // Get recent activity (messages, focus sessions, etc.)
        const recentMessages = await Message.find({
            spaceId,
            isDeleted: false
        })
            .populate('userId', 'username profile.displayName profile.avatar')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                space: {
                    spaceId: space.spaceId,
                    name: space.name,
                    description: space.description,
                    category: space.category,
                    tags: space.tags,
                    creator: space.creator,
                    moderators: space.moderators,
                    settings: space.settings,
                    statistics: space.statistics,
                    createdAt: space.createdAt,
                    isMember,
                    userRole: membershipInfo?.role || null,
                    hyperfocusLevel: membershipInfo?.hyperfocusLevel || null,
                    joinedAt: membershipInfo?.joinedAt || null,
                    memberCount: space.members.length
                },
                recentActivity: {
                    messages: recentMessages,
                    activeFocusSessions: space.statistics.activeFocusSessions,
                    bodyDoublingPairs: space.statistics.bodyDoublingPairs
                }
            }
        });
    } catch (error) {
        console.error('Get space details error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch space details'
        });
    }
});

/**
 * @route POST /api/spaces/:spaceId/join
 * @desc Join an interest space
 * @access Private
 */
router.post('/:spaceId/join', authenticateToken, async (req, res) => {
    try {
        const { spaceId } = req.params;
        const { hyperfocusLevel = 5 } = req.body;

        const space = await InterestSpace.findOne({
            spaceId,
            isActive: true
        });

        if (!space) {
            return res.status(404).json({
                success: false,
                error: 'Interest space not found'
            });
        }

        // Check if already a member
        const existingMember = space.members.find(member => member.userId === req.user.userId);
        if (existingMember) {
            return res.status(400).json({
                success: false,
                error: 'You are already a member of this space'
            });
        }

        // Check privacy settings
        if (space.settings.privacy === 'private' || space.settings.privacy === 'invite-only') {
            return res.status(403).json({
                success: false,
                error: 'This space requires an invitation to join'
            });
        }

        // Add user as member
        space.members.push({
            userId: req.user.userId,
            joinedAt: new Date(),
            role: 'member',
            hyperfocusLevel: Math.max(1, Math.min(10, hyperfocusLevel))
        });

        space.statistics.memberCount = space.members.length;
        await space.save();

        // Add XP for joining space
        req.user.gamification.xp += 10;
        await req.user.save();

        res.json({
            success: true,
            message: `Welcome to ${space.name}! 🎉`,
            data: {
                space: {
                    spaceId: space.spaceId,
                    name: space.name,
                    memberCount: space.statistics.memberCount
                },
                userRole: 'member',
                hyperfocusLevel,
                xpGained: 10
            }
        });

        console.log(`🌟 User ${req.user.username} joined space ${space.name}`);
    } catch (error) {
        console.error('Join space error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join interest space'
        });
    }
});

/**
 * @route POST /api/spaces/:spaceId/leave
 * @desc Leave an interest space
 * @access Private
 */
router.post('/:spaceId/leave', authenticateToken, async (req, res) => {
    try {
        const { spaceId } = req.params;

        const space = await InterestSpace.findOne({
            spaceId,
            isActive: true
        });

        if (!space) {
            return res.status(404).json({
                success: false,
                error: 'Interest space not found'
            });
        }

        // Check if user is a member
        const memberIndex = space.members.findIndex(member => member.userId === req.user.userId);
        if (memberIndex === -1) {
            return res.status(400).json({
                success: false,
                error: 'You are not a member of this space'
            });
        }

        const member = space.members[memberIndex];

        // Prevent creator from leaving (must transfer ownership first)
        if (space.creator === req.user.userId) {
            return res.status(400).json({
                success: false,
                error: 'Space creator cannot leave. Please transfer ownership first.'
            });
        }

        // Remove user from members
        space.members.splice(memberIndex, 1);

        // Remove from moderators if applicable
        space.moderators = space.moderators.filter(modId => modId !== req.user.userId);

        space.statistics.memberCount = space.members.length;
        await space.save();

        res.json({
            success: true,
            message: `You have left ${space.name}. We'll miss you! 👋`,
            data: {
                spaceId: space.spaceId,
                spaceName: space.name
            }
        });

        console.log(`👋 User ${req.user.username} left space ${space.name}`);
    } catch (error) {
        console.error('Leave space error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to leave interest space'
        });
    }
});

/**
 * @route PUT /api/spaces/:spaceId/hyperfocus
 * @desc Update user's hyperfocus level in a space
 * @access Private
 */
router.put('/:spaceId/hyperfocus', authenticateToken, [
    body('hyperfocusLevel')
        .isInt({ min: 1, max: 10 })
        .withMessage('Hyperfocus level must be between 1-10')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Invalid hyperfocus level'
            });
        }

        const { spaceId } = req.params;
        const { hyperfocusLevel } = req.body;

        const space = await InterestSpace.findOne({
            spaceId,
            isActive: true
        });

        if (!space) {
            return res.status(404).json({
                success: false,
                error: 'Interest space not found'
            });
        }

        // Find and update member's hyperfocus level
        const member = space.members.find(member => member.userId === req.user.userId);
        if (!member) {
            return res.status(403).json({
                success: false,
                error: 'You are not a member of this space'
            });
        }

        const oldLevel = member.hyperfocusLevel;
        member.hyperfocusLevel = hyperfocusLevel;

        await space.save();

        res.json({
            success: true,
            message: 'Hyperfocus level updated! 🎯',
            data: {
                spaceId: space.spaceId,
                oldLevel,
                newLevel: hyperfocusLevel,
                encouragement: getHyperfocusEncouragement(hyperfocusLevel)
            }
        });
    } catch (error) {
        console.error('Update hyperfocus error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update hyperfocus level'
        });
    }
});

/**
 * @route GET /api/spaces/:spaceId/members
 * @desc Get space members list
 * @access Private
 */
router.get('/:spaceId/members', authenticateToken, async (req, res) => {
    try {
        const { spaceId } = req.params;

        const space = await InterestSpace.findOne({
            spaceId,
            isActive: true
        });

        if (!space) {
            return res.status(404).json({
                success: false,
                error: 'Interest space not found'
            });
        }

        // Check if user is a member
        const isMember = space.members.some(member => member.userId === req.user.userId);
        if (!isMember) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You must be a member to view the member list.'
            });
        }

        // Get member details
        const memberUserIds = space.members.map(member => member.userId);
        const users = await User.find({
            userId: { $in: memberUserIds },
            isActive: true
        })
            .select('userId username profile.displayName profile.avatar gamification.level');

        // Combine member info with user data
        const membersWithDetails = space.members
            .filter(member => users.some(user => user.userId === member.userId))
            .map(member => {
                const user = users.find(user => user.userId === member.userId);
                return {
                    userId: member.userId,
                    username: user.username,
                    displayName: user.profile.displayName,
                    avatar: user.profile.avatar,
                    level: user.gamification.level,
                    role: member.role,
                    hyperfocusLevel: member.hyperfocusLevel,
                    joinedAt: member.joinedAt,
                    isOnline: false // TODO: Add real-time presence
                };
            })
            .sort((a, b) => {
                // Sort by role (admin/mod first), then by hyperfocus level
                const roleOrder = { admin: 0, moderator: 1, member: 2 };
                if (roleOrder[a.role] !== roleOrder[b.role]) {
                    return roleOrder[a.role] - roleOrder[b.role];
                }
                return b.hyperfocusLevel - a.hyperfocusLevel;
            });

        res.json({
            success: true,
            data: {
                spaceId: space.spaceId,
                spaceName: space.name,
                totalMembers: membersWithDetails.length,
                members: membersWithDetails
            }
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch members'
        });
    }
});

// Helper function for hyperfocus encouragement
function getHyperfocusEncouragement(level) {
    const encouragements = {
        1: "Every journey starts with curiosity! 🌱",
        2: "Building interest! Keep exploring! 👀",
        3: "Getting engaged! You're on the right track! 📈",
        4: "Good focus developing! 🎯",
        5: "Solid engagement! Right in the sweet spot! ⚖️",
        6: "Strong interest! You're really into this! 💪",
        7: "High engagement! You're in your element! ⚡",
        8: "Intense focus! You're absolutely absorbed! 🔥",
        9: "Deep hyperfocus! Nothing can distract you! 🌊",
        10: "LEGENDARY HYPERFOCUS! You've reached the zone! 🏆"
    };
    return encouragements[level] || "Great focus level! 🌟";
}

module.exports = router;
