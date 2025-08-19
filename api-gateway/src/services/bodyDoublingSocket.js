/**
 * 🤝💎⚡ Body Doubling Service - ADHD Accountability & Virtual Co-working ⚡💎🤝
 */

const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class BodyDoublingSocket {
    constructor() {
        this.activeSessions = new Map(); // sessionId -> session data
        this.userSessions = new Map(); // userId -> sessionId
        this.matchmakingQueue = new Set(); // users waiting for partners
        this.partnerships = new Map(); // partnerId -> Set of connected users
        this.sessionStats = new Map(); // sessionId -> productivity stats
    }

    // Request body doubling partner
    requestPartner(socket, preferences = {}) {
        try {
            const {
                sessionDuration = 60, // minutes
                taskType = 'general',
                communicationLevel = 'minimal', // minimal, moderate, active
                timeZone = 'UTC',
                language = 'en',
                neurodivergentFriendly = true
            } = preferences;

            // Remove from any existing session first
            this.leaveSession(socket);

            const request = {
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                preferences: {
                    sessionDuration,
                    taskType,
                    communicationLevel,
                    timeZone,
                    language,
                    neurodivergentFriendly
                },
                requestTime: new Date().toISOString(),
                socket
            };

            // Try to find compatible partner
            const partner = this.findCompatiblePartner(request);

            if (partner) {
                // Create session with matched partner
                this.createBodyDoublingSession(request, partner);
            } else {
                // Add to matchmaking queue
                this.matchmakingQueue.add(request);
                socket.emit('partner-search-started', {
                    message: 'Looking for a compatible accountability partner...',
                    estimatedWait: this.estimateWaitTime(request),
                    queuePosition: this.matchmakingQueue.size
                });
            }

            console.log(`🤝 Partner request from ${socket.userId} - Queue size: ${this.matchmakingQueue.size}`);
        } catch (error) {
            console.error('Error requesting partner:', error);
            socket.emit('partner-request-error', {
                error: 'Failed to request partner'
            });
        }
    }

    // Create body doubling session
    createBodyDoublingSession(user1, user2) {
        try {
            const sessionId = uuidv4();
            const roomName = `body-doubling-${sessionId}`;

            // Remove both users from queue
            this.matchmakingQueue.delete(user1);
            this.matchmakingQueue.delete(user2);

            const session = {
                id: sessionId,
                roomName,
                participants: [
                    {
                        userId: user1.userId,
                        username: user1.username,
                        socket: user1.socket,
                        status: 'active',
                        joinTime: new Date().toISOString()
                    },
                    {
                        userId: user2.userId,
                        username: user2.username,
                        socket: user2.socket,
                        status: 'active',
                        joinTime: new Date().toISOString()
                    }
                ],
                startTime: new Date().toISOString(),
                duration: Math.min(user1.preferences.sessionDuration, user2.preferences.sessionDuration),
                taskType: user1.preferences.taskType,
                communicationLevel: user1.preferences.communicationLevel,
                checkins: [],
                productivity: {
                    focusBlocks: 0,
                    breaksTaken: 0,
                    tasksCompleted: 0,
                    distractionCount: 0
                }
            };

            // Store session data
            this.activeSessions.set(sessionId, session);
            this.userSessions.set(user1.userId, sessionId);
            this.userSessions.set(user2.userId, sessionId);

            // Join both users to the session room
            user1.socket.join(roomName);
            user2.socket.join(roomName);

            // Notify both users of successful match
            const matchData = {
                sessionId,
                partnerId: user2.userId,
                partnerUsername: user2.username,
                sessionDuration: session.duration,
                taskType: session.taskType,
                communicationLevel: session.communicationLevel,
                startTime: session.startTime
            };

            user1.socket.emit('partner-matched', {
                ...matchData,
                partnerId: user2.userId,
                partnerUsername: user2.username
            });

            user2.socket.emit('partner-matched', {
                ...matchData,
                partnerId: user1.userId,
                partnerUsername: user1.username
            });

            // Start session timer
            this.startSessionTimer(sessionId);

            console.log(`🤝 Body doubling session created: ${sessionId}`);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    }

    // Handle focus check-ins
    handleFocusCheckin(socket, { taskDescription, energyLevel, mood }) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) {
                socket.emit('checkin-error', {
                    error: 'Not in an active session'
                });
                return;
            }

            const session = this.activeSessions.get(sessionId);
            const checkin = {
                id: uuidv4(),
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                taskDescription,
                energyLevel, // 1-10 scale
                mood, // happy, focused, struggling, anxious, etc.
                timestamp: new Date().toISOString(),
                type: 'focus-checkin'
            };

            session.checkins.push(checkin);

            // Notify partner about check-in (ADHD-friendly encouragement)
            socket.to(session.roomName).emit('partner-checkin', {
                partnerUsername: checkin.username,
                taskDescription: checkin.taskDescription,
                energyLevel: checkin.energyLevel,
                mood: checkin.mood,
                encouragement: this.generateEncouragement(energyLevel, mood)
            });

            socket.emit('checkin-recorded', {
                checkinId: checkin.id,
                message: 'Check-in recorded! Your partner has been notified.'
            });

            console.log(`📝 Focus check-in from ${socket.userId} in session ${sessionId}`);
        } catch (error) {
            console.error('Error handling focus checkin:', error);
            socket.emit('checkin-error', {
                error: 'Failed to record check-in'
            });
        }
    }

    // Handle break notifications
    handleBreakRequest(socket, { breakType = 'short', duration = 5 }) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);

            // Update break statistics
            session.productivity.breaksTaken++;

            // Notify partner about break
            socket.to(session.roomName).emit('partner-break', {
                partnerUsername: socket.userData?.username || 'Anonymous',
                breakType,
                duration,
                message: `Your partner is taking a ${breakType} break for ${duration} minutes`,
                timestamp: new Date().toISOString()
            });

            // Schedule break end reminder
            setTimeout(() => {
                socket.emit('break-reminder', {
                    message: `Break time is up! Ready to get back to work?`,
                    partnerWaiting: true
                });
            }, duration * 60 * 1000);

            console.log(`☕ Break request from ${socket.userId} - ${breakType} for ${duration}min`);
        } catch (error) {
            console.error('Error handling break request:', error);
        }
    }

    // Handle task completion
    handleTaskCompletion(socket, { taskDescription, satisfactionLevel, nextTask }) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);
            session.productivity.tasksCompleted++;

            const completion = {
                id: uuidv4(),
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                taskDescription,
                satisfactionLevel, // 1-10
                nextTask,
                timestamp: new Date().toISOString(),
                celebration: this.generateCelebration(satisfactionLevel)
            };

            session.checkins.push(completion);

            // Share celebration with partner
            socket.to(session.roomName).emit('partner-achievement', {
                partnerUsername: completion.username,
                taskDescription: completion.taskDescription,
                celebration: completion.celebration,
                nextTask: completion.nextTask
            });

            socket.emit('task-completed', {
                message: 'Great job! Task completion recorded.',
                celebration: completion.celebration,
                totalTasks: session.productivity.tasksCompleted
            });

            console.log(`✅ Task completed by ${socket.userId}: ${taskDescription}`);
        } catch (error) {
            console.error('Error handling task completion:', error);
        }
    }

    // Handle distraction reports (ADHD-specific)
    handleDistraction(socket, { distractionType, intensity, handlingStrategy }) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);
            session.productivity.distractionCount++;

            // Generate ADHD-friendly coping strategies
            const suggestions = this.generateDistractionHelp(distractionType, intensity);

            socket.emit('distraction-support', {
                message: 'It\'s okay! Distractions happen. Here are some strategies:',
                suggestions,
                partnerSupport: 'Would you like to check in with your accountability partner?'
            });

            // Optionally notify partner (based on communication level)
            if (session.communicationLevel !== 'minimal') {
                socket.to(session.roomName).emit('partner-distraction', {
                    message: 'Your partner is working through a distraction and could use some encouragement!',
                    supportSuggestions: [
                        'Send a gentle check-in message',
                        'Share your current focus',
                        'Suggest a quick mindfulness moment'
                    ]
                });
            }

            console.log(`🌪️ Distraction handled for ${socket.userId}: ${distractionType}`);
        } catch (error) {
            console.error('Error handling distraction:', error);
        }
    }

    // Leave session
    leaveSession(socket) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);
            if (!session) return;

            // Remove user from session
            this.userSessions.delete(socket.userId);
            socket.leave(session.roomName);

            // Find remaining partner
            const remainingParticipant = session.participants.find(p => p.userId !== socket.userId);

            if (remainingParticipant) {
                // Notify partner of departure
                remainingParticipant.socket.emit('partner-left', {
                    message: 'Your accountability partner has left the session',
                    sessionSummary: this.generateSessionSummary(session),
                    findNewPartner: true
                });

                // Remove partner from session too
                this.userSessions.delete(remainingParticipant.userId);
                remainingParticipant.socket.leave(session.roomName);
            }

            // Clean up session
            this.activeSessions.delete(sessionId);
            this.sessionStats.set(sessionId, this.generateSessionSummary(session));

            console.log(`🤝 User ${socket.userId} left body doubling session ${sessionId}`);
        } catch (error) {
            console.error('Error leaving session:', error);
        }
    }

    // Handle disconnection
    handleDisconnect(socket) {
        try {
            // Remove from queue if waiting
            for (const request of this.matchmakingQueue) {
                if (request.userId === socket.userId) {
                    this.matchmakingQueue.delete(request);
                    break;
                }
            }

            // Leave active session
            this.leaveSession(socket);

            console.log(`🤝 User ${socket.userId} disconnected from body doubling`);
        } catch (error) {
            console.error('Error handling body doubling disconnect:', error);
        }
    }

    // Utility methods

    findCompatiblePartner(request) {
        for (const candidate of this.matchmakingQueue) {
            if (this.areCompatible(request, candidate)) {
                return candidate;
            }
        }
        return null;
    }

    areCompatible(user1, user2) {
        const prefs1 = user1.preferences;
        const prefs2 = user2.preferences;

        // Check basic compatibility
        const durationMatch = Math.abs(prefs1.sessionDuration - prefs2.sessionDuration) <= 30;
        const taskMatch = prefs1.taskType === prefs2.taskType ||
            prefs1.taskType === 'general' ||
            prefs2.taskType === 'general';
        const communicationMatch = prefs1.communicationLevel === prefs2.communicationLevel;
        const neuroMatch = prefs1.neurodivergentFriendly === prefs2.neurodivergentFriendly;

        return durationMatch && taskMatch && communicationMatch && neuroMatch;
    }

    estimateWaitTime(request) {
        // Simple wait time estimation based on queue size and compatibility
        const queueSize = this.matchmakingQueue.size;
        return queueSize < 5 ? '< 2 minutes' : queueSize < 15 ? '2-5 minutes' : '5-10 minutes';
    }

    startSessionTimer(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return;

        // Schedule session end reminder
        setTimeout(() => {
            const currentSession = this.activeSessions.get(sessionId);
            if (currentSession) {
                currentSession.participants.forEach(participant => {
                    participant.socket.emit('session-ending-soon', {
                        message: 'Your body doubling session ends in 5 minutes',
                        sessionSummary: this.generateSessionSummary(currentSession),
                        extendOption: true
                    });
                });
            }
        }, (session.duration - 5) * 60 * 1000);

        // Auto-end session
        setTimeout(() => {
            this.endSession(sessionId);
        }, session.duration * 60 * 1000);
    }

    endSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return;

        const summary = this.generateSessionSummary(session);

        session.participants.forEach(participant => {
            participant.socket.emit('session-ended', {
                message: 'Body doubling session completed!',
                sessionSummary: summary,
                partnerFeedback: true
            });

            this.userSessions.delete(participant.userId);
            participant.socket.leave(session.roomName);
        });

        this.activeSessions.delete(sessionId);
        this.sessionStats.set(sessionId, summary);
    }

    generateSessionSummary(session) {
        const duration = moment().diff(moment(session.startTime), 'minutes');
        return {
            sessionId: session.id,
            duration: `${duration} minutes`,
            tasksCompleted: session.productivity.tasksCompleted,
            breaksTaken: session.productivity.breaksTaken,
            distractions: session.productivity.distractionCount,
            checkins: session.checkins.length,
            productivityScore: this.calculateProductivityScore(session),
            achievements: this.generateAchievements(session)
        };
    }

    calculateProductivityScore(session) {
        const { tasksCompleted, distractionCount, checkins } = session.productivity;
        const baseScore = (tasksCompleted * 10) + (checkins.length * 2);
        const penalty = distractionCount * 2;
        return Math.max(0, Math.min(100, baseScore - penalty));
    }

    generateAchievements(session) {
        const achievements = [];
        const { tasksCompleted, breaksTaken, distractionCount } = session.productivity;

        if (tasksCompleted >= 3) achievements.push('🏆 Task Master');
        if (breaksTaken > 0 && breaksTaken <= 2) achievements.push('⚖️ Balance Keeper');
        if (distractionCount === 0) achievements.push('🎯 Laser Focus');
        if (session.checkins.length >= 5) achievements.push('📊 Progress Tracker');

        return achievements;
    }

    generateEncouragement(energyLevel, mood) {
        const encouragements = {
            high: ['You\'re on fire! 🔥', 'Amazing energy! Keep it up! ⚡', 'Crushing it! 💪'],
            medium: ['Steady progress! 👍', 'You\'ve got this! 🌟', 'Great focus! 🎯'],
            low: ['Take it one step at a time 🐾', 'You\'re doing great! 💙', 'Progress is progress! ✨']
        };

        const level = energyLevel >= 7 ? 'high' : energyLevel >= 4 ? 'medium' : 'low';
        const messages = encouragements[level];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    generateCelebration(satisfactionLevel) {
        if (satisfactionLevel >= 8) return '🎉 Outstanding work! You\'re absolutely crushing it!';
        if (satisfactionLevel >= 6) return '✨ Great job! That\'s solid progress!';
        return '👍 Task completed! Every step forward counts!';
    }

    generateDistractionHelp(type, intensity) {
        const strategies = {
            'mind-wandering': [
                'Try the 5-4-3-2-1 grounding technique',
                'Write down the distraction to address later',
                'Take 3 deep breaths and refocus'
            ],
            'external-noise': [
                'Try noise-canceling headphones or white noise',
                'Find a quieter space if possible',
                'Use focus music or brown noise'
            ],
            'digital': [
                'Close unnecessary browser tabs',
                'Put phone in another room',
                'Use website blockers for 25 minutes'
            ],
            'internal-worry': [
                'Write the worry in a "worry journal"',
                'Schedule time to address it later',
                'Practice the STOP technique (Stop, Take a breath, Observe, Proceed)'
            ]
        };

        return strategies[type] || strategies['mind-wandering'];
    }
}

module.exports = new BodyDoublingSocket();
