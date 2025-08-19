/**
 * 💎🗄️⚡ MongoDB Models - HYPERFOCUS ZONE Database Schemas ⚡🗄️💎
 */

const mongoose = require('mongoose');

// User Schema with ADHD-specific preferences
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    profile: {
        displayName: String,
        avatar: String,
        bio: { type: String, maxlength: 500 },
        pronouns: String,
        timezone: { type: String, default: 'UTC' },
        language: { type: String, default: 'en' }
    },
    neurodivergentProfile: {
        isNeurodivergent: { type: Boolean, default: false },
        conditions: [{
            type: String,
            enum: ['ADHD', 'Autism', 'Dyslexia', 'Anxiety', 'Depression', 'Other']
        }],
        accommodations: {
            largeText: { type: Boolean, default: false },
            highContrast: { type: Boolean, default: false },
            reduceMotion: { type: Boolean, default: false },
            screenReader: { type: Boolean, default: false },
            subtitles: { type: Boolean, default: false }
        },
        focusPreferences: {
            preferredSessionLength: { type: Number, default: 25 }, // minutes
            breakLength: { type: Number, default: 5 },
            backgroundSounds: { type: String, default: 'none' },
            visualMode: { type: String, default: 'minimal' },
            distractionLevel: { type: String, default: 'medium' },
            energyTracking: { type: Boolean, default: true }
        }
    },
    socialPreferences: {
        visibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
        allowBodyDoubling: { type: Boolean, default: true },
        shareProgress: { type: Boolean, default: true },
        communicationLevel: { type: String, enum: ['minimal', 'moderate', 'active'], default: 'moderate' }
    },
    gamification: {
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        lastActiveDate: Date,
        achievements: [{
            id: String,
            name: String,
            description: String,
            earnedAt: Date,
            category: String
        }],
        badges: [String]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Interest Space Schema
const interestSpaceSchema = new mongoose.Schema({
    spaceId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 1000
    },
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Art & Creativity', 'Science', 'Gaming', 'Health & Wellness',
            'Education', 'Music', 'Sports', 'Literature', 'Other']
    },
    tags: [String],
    creator: {
        type: String,
        required: true,
        ref: 'User'
    },
    moderators: [{
        type: String,
        ref: 'User'
    }],
    members: [{
        userId: { type: String, ref: 'User' },
        joinedAt: Date,
        role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
        hyperfocusLevel: { type: Number, min: 1, max: 10, default: 5 }
    }],
    settings: {
        privacy: { type: String, enum: ['public', 'private', 'invite-only'], default: 'public' },
        allowBodyDoubling: { type: Boolean, default: true },
        allowFocusSessions: { type: Boolean, default: true },
        moderationLevel: { type: String, enum: ['minimal', 'moderate', 'strict'], default: 'moderate' },
        neurodivergentFriendly: { type: Boolean, default: true }
    },
    statistics: {
        memberCount: { type: Number, default: 0 },
        messageCount: { type: Number, default: 0 },
        activeFocusSessions: { type: Number, default: 0 },
        bodyDoublingPairs: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Message Schema for Chat
const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    spaceId: {
        type: String,
        required: true,
        ref: 'InterestSpace',
        index: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    messageType: {
        type: String,
        enum: ['text', 'voice', 'image', 'file', 'system'],
        default: 'text'
    },
    replyTo: {
        type: String,
        ref: 'Message'
    },
    attachments: [{
        type: String,
        url: String,
        filename: String,
        size: Number
    }],
    reactions: [{
        emoji: String,
        userId: { type: String, ref: 'User' },
        timestamp: Date
    }],
    metadata: {
        readabilityScore: String,
        hasLinks: Boolean,
        mentions: [String],
        energyLevel: String,
        editHistory: [{
            content: String,
            editedAt: Date
        }]
    },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Focus Session Schema
const focusSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    template: {
        type: String,
        required: true,
        enum: ['pomodoro-classic', 'pomodoro-micro', 'pomodoro-extended', 'custom-flow']
    },
    taskDescription: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: Date,
    duration: {
        planned: Number, // minutes
        actual: Number
    },
    phases: [{
        type: { type: String, enum: ['focus', 'break', 'longBreak'] },
        startTime: Date,
        endTime: Date,
        duration: Number,
        completed: Boolean
    }],
    progress: {
        cyclesCompleted: { type: Number, default: 0 },
        breaksCompleted: { type: Number, default: 0 },
        distractionReports: { type: Number, default: 0 },
        flowStateAchieved: { type: Boolean, default: false },
        productivity: { type: Number, min: 0, max: 100 }
    },
    analytics: {
        startEnergy: { type: Number, min: 1, max: 10 },
        endEnergy: { type: Number, min: 1, max: 10 },
        checkIns: [{
            energyLevel: Number,
            mood: String,
            notes: String,
            timestamp: Date
        }],
        distractions: [{
            type: String,
            intensity: Number,
            timestamp: Date,
            resolved: Boolean
        }],
        achievements: [{
            type: String,
            timestamp: Date,
            description: String
        }]
    },
    settings: {
        backgroundSound: String,
        visualMode: String,
        accountabilityMode: Boolean,
        shareProgress: Boolean
    },
    isCompleted: { type: Boolean, default: false },
    endReason: {
        type: String,
        enum: ['completed', 'user-ended', 'interrupted', 'disconnected']
    },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Body Doubling Session Schema
const bodyDoublingSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    participants: [{
        userId: { type: String, ref: 'User' },
        username: String,
        joinTime: Date,
        leaveTime: Date,
        status: { type: String, enum: ['active', 'break', 'left'], default: 'active' }
    }],
    sessionType: {
        type: String,
        enum: ['peer-to-peer', 'group', 'silent', 'interactive'],
        default: 'peer-to-peer'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: Date,
    plannedDuration: Number, // minutes
    actualDuration: Number,
    taskTypes: [String],
    communicationLevel: {
        type: String,
        enum: ['minimal', 'moderate', 'active'],
        default: 'moderate'
    },
    checkins: [{
        userId: String,
        taskDescription: String,
        energyLevel: Number,
        mood: String,
        timestamp: Date,
        type: { type: String, enum: ['focus-checkin', 'break-request', 'task-completion', 'distraction'] }
    }],
    productivity: {
        totalTasks: { type: Number, default: 0 },
        completedTasks: { type: Number, default: 0 },
        totalBreaks: { type: Number, default: 0 },
        distractions: { type: Number, default: 0 },
        collaborativeGoals: { type: Number, default: 0 }
    },
    feedback: [{
        fromUserId: String,
        toUserId: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        timestamp: Date
    }],
    isActive: { type: Boolean, default: true },
    endReason: {
        type: String,
        enum: ['completed', 'partner-left', 'mutual-end', 'timeout', 'interrupted']
    },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
    achievementId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['focus', 'consistency', 'social', 'learning', 'milestone'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'legendary'],
        default: 'bronze'
    },
    icon: String,
    criteria: {
        type: String, // JSON string describing unlock criteria
        required: true
    },
    xpReward: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
    notificationId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['focus-reminder', 'partner-request', 'achievement', 'space-invitation',
            'message-mention', 'session-end', 'streak-milestone']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: mongoose.Schema.Types.Mixed, // Additional data for the notification
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    actionUrl: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Create indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'gamification.level': -1 });
userSchema.index({ lastActive: -1 });

interestSpaceSchema.index({ category: 1 });
interestSpaceSchema.index({ tags: 1 });
interestSpaceSchema.index({ 'members.userId': 1 });
interestSpaceSchema.index({ createdAt: -1 });

messageSchema.index({ spaceId: 1, createdAt: -1 });
messageSchema.index({ userId: 1 });
messageSchema.index({ createdAt: -1 });

focusSessionSchema.index({ userId: 1, createdAt: -1 });
focusSessionSchema.index({ startTime: -1 });
focusSessionSchema.index({ isCompleted: 1 });

bodyDoublingSessionSchema.index({ 'participants.userId': 1 });
bodyDoublingSessionSchema.index({ startTime: -1 });
bodyDoublingSessionSchema.index({ isActive: 1 });

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create models
const User = mongoose.model('User', userSchema);
const InterestSpace = mongoose.model('InterestSpace', interestSpaceSchema);
const Message = mongoose.model('Message', messageSchema);
const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
const BodyDoublingSession = mongoose.model('BodyDoublingSession', bodyDoublingSessionSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
    User,
    InterestSpace,
    Message,
    FocusSession,
    BodyDoublingSession,
    Achievement,
    Notification
};
