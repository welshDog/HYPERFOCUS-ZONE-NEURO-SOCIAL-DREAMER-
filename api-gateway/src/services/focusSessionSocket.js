/**
 * 🎯💎⚡ Focus Session Service - ADHD-Optimized Deep Work Engine ⚡💎🎯
 */

const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class FocusSessionSocket {
    constructor() {
        this.activeSessions = new Map(); // sessionId -> session data
        this.userSessions = new Map(); // userId -> sessionId
        this.groupSessions = new Map(); // groupId -> Set of sessionIds
        this.sessionTemplates = new Map(); // templates for different work types
        this.productivityData = new Map(); // userId -> productivity history
        this.initializeTemplates();
    }

    initializeTemplates() {
        // ADHD-optimized session templates
        this.sessionTemplates.set('pomodoro-classic', {
            name: 'Classic Pomodoro',
            focusDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            cyclesBeforeLongBreak: 4,
            description: 'Traditional 25-minute focus blocks'
        });

        this.sessionTemplates.set('pomodoro-micro', {
            name: 'Micro Focus',
            focusDuration: 15,
            shortBreak: 3,
            longBreak: 10,
            cyclesBeforeLongBreak: 3,
            description: 'Shorter blocks for ADHD-friendly focus'
        });

        this.sessionTemplates.set('pomodoro-extended', {
            name: 'Hyperfocus Extended',
            focusDuration: 45,
            shortBreak: 10,
            longBreak: 20,
            cyclesBeforeLongBreak: 3,
            description: 'Longer blocks for hyperfocus states'
        });

        this.sessionTemplates.set('custom-flow', {
            name: 'Flow State',
            focusDuration: 0, // User-defined
            shortBreak: 0,
            longBreak: 0,
            cyclesBeforeLongBreak: 0,
            description: 'Custom duration for uninterrupted flow'
        });
    }

    // Start individual focus session
    startFocusSession(socket, sessionData) {
        try {
            const {
                templateId = 'pomodoro-classic',
                customDuration = null,
                taskDescription = '',
                difficulty = 'medium',
                energyLevel = 5,
                distractionLevel = 'low',
                backgroundSound = 'none',
                visualMode = 'minimal',
                accountabilityMode = false,
                shareProgress = false
            } = sessionData;

            // End any existing session
            this.endFocusSession(socket);

            const template = this.sessionTemplates.get(templateId);
            const sessionId = uuidv4();

            const session = {
                id: sessionId,
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                template: templateId,
                taskDescription,
                difficulty,
                energyLevel,
                distractionLevel,
                settings: {
                    backgroundSound,
                    visualMode,
                    accountabilityMode,
                    shareProgress
                },
                startTime: new Date().toISOString(),
                currentPhase: 'focus', // focus, break, longBreak
                currentCycle: 1,
                totalCycles: 0,
                durations: {
                    focus: customDuration || template.focusDuration,
                    shortBreak: template.shortBreak,
                    longBreak: template.longBreak,
                    cyclesBeforeLongBreak: template.cyclesBeforeLongBreak
                },
                progress: {
                    timeSpent: 0,
                    breaksCompleted: 0,
                    cyclesCompleted: 0,
                    distractionReports: 0,
                    flowStateAchieved: false
                },
                analytics: {
                    startEnergy: energyLevel,
                    checkIns: [],
                    distractions: [],
                    achievements: []
                }
            };

            // Store session
            this.activeSessions.set(sessionId, session);
            this.userSessions.set(socket.userId, sessionId);

            // Join accountability room if enabled
            if (accountabilityMode) {
                socket.join('accountability-room');
                socket.to('accountability-room').emit('user-started-focus', {
                    username: session.username,
                    taskDescription: session.taskDescription,
                    duration: session.durations.focus,
                    template: template.name
                });
            }

            // Start the session timer
            this.startSessionTimer(socket, sessionId);

            // Send session started confirmation
            socket.emit('focus-session-started', {
                sessionId,
                template: template.name,
                duration: session.durations.focus,
                taskDescription: session.taskDescription,
                currentPhase: 'focus',
                settings: session.settings,
                encouragement: this.generateStartEncouragement(energyLevel, difficulty)
            });

            console.log(`🎯 Focus session started: ${sessionId} by ${socket.userId}`);
        } catch (error) {
            console.error('Error starting focus session:', error);
            socket.emit('focus-session-error', {
                error: 'Failed to start focus session'
            });
        }
    }

    // Start timer for session phases
    startSessionTimer(socket, sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return;

        const duration = this.getCurrentPhaseDuration(session);

        // Send timer updates every minute
        const timerInterval = setInterval(() => {
            const currentSession = this.activeSessions.get(sessionId);
            if (!currentSession) {
                clearInterval(timerInterval);
                return;
            }

            currentSession.progress.timeSpent++;

            socket.emit('timer-update', {
                sessionId,
                timeRemaining: duration - currentSession.progress.timeSpent,
                totalTime: duration,
                currentPhase: currentSession.currentPhase,
                progress: Math.round((currentSession.progress.timeSpent / duration) * 100),
                motivationalMessage: this.getTimerMessage(currentSession)
            });

            // Check for session phase completion
            if (currentSession.progress.timeSpent >= duration) {
                clearInterval(timerInterval);
                this.handlePhaseCompletion(socket, sessionId);
            }
        }, 60000); // Update every minute

        // Store timer reference
        session.timerId = timerInterval;
    }

    // Handle completion of focus/break phases
    handlePhaseCompletion(socket, sessionId) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) return;

            const wasInFocus = session.currentPhase === 'focus';

            if (wasInFocus) {
                // Focus period completed
                session.progress.cyclesCompleted++;
                session.totalCycles++;

                // Determine next phase (short break vs long break)
                const needsLongBreak = session.totalCycles % session.durations.cyclesBeforeLongBreak === 0;
                session.currentPhase = needsLongBreak ? 'longBreak' : 'break';

                // Send completion celebration
                socket.emit('focus-phase-completed', {
                    sessionId,
                    cyclesCompleted: session.progress.cyclesCompleted,
                    nextPhase: session.currentPhase,
                    celebration: this.generateCompletionCelebration(session),
                    achievements: this.checkAchievements(session),
                    breakDuration: needsLongBreak ? session.durations.longBreak : session.durations.shortBreak,
                    breakSuggestions: this.generateBreakSuggestions(session.energyLevel, needsLongBreak)
                });

                // Share with accountability partners if enabled
                if (session.settings.accountabilityMode) {
                    socket.to('accountability-room').emit('partner-completed-focus', {
                        username: session.username,
                        cyclesCompleted: session.progress.cyclesCompleted,
                        taskDescription: session.taskDescription
                    });
                }
            } else {
                // Break completed
                session.progress.breaksCompleted++;
                session.currentPhase = 'focus';
                session.currentCycle++;

                socket.emit('break-completed', {
                    sessionId,
                    message: 'Break time is over! Ready to focus again?',
                    nextFocusDuration: session.durations.focus,
                    energyBoost: this.generateEnergyBoost(session),
                    focusTips: this.generateFocusTips(session.distractionLevel)
                });
            }

            // Reset progress timer and start next phase
            session.progress.timeSpent = 0;
            this.startSessionTimer(socket, sessionId);
        } catch (error) {
            console.error('Error handling phase completion:', error);
        }
    }

    // Handle distraction reports during focus
    reportDistraction(socket, { distractionType, intensity, timestamp }) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);
            if (!session || session.currentPhase !== 'focus') return;

            session.progress.distractionReports++;
            session.analytics.distractions.push({
                type: distractionType,
                intensity,
                timestamp: timestamp || new Date().toISOString(),
                phase: session.currentPhase,
                timeIntoSession: session.progress.timeSpent
            });

            // Generate contextual help
            const help = this.generateDistractionHelp(distractionType, intensity, session);

            socket.emit('distraction-acknowledged', {
                message: 'It\'s okay! Distractions are normal.',
                helpStrategies: help.strategies,
                quickActions: help.quickActions,
                encouragement: help.encouragement,
                continueSession: true
            });

            // Track patterns for future sessions
            this.updateDistractionPatterns(socket.userId, distractionType, session);

            console.log(`🌪️ Distraction reported in session ${sessionId}: ${distractionType}`);
        } catch (error) {
            console.error('Error handling distraction report:', error);
        }
    }

    // Handle flow state detection
    reportFlowState(socket, { confidence = 0.8, indicators = [] }) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);
            if (!session) return;

            session.progress.flowStateAchieved = true;
            session.analytics.achievements.push({
                type: 'flow-state',
                timestamp: new Date().toISOString(),
                confidence,
                indicators
            });

            socket.emit('flow-state-detected', {
                message: '🌊 Flow state achieved! You\'re in the zone!',
                celebration: '✨ Amazing focus! This is where the magic happens! ✨',
                suggestion: 'Consider extending this session if you\'re feeling good',
                currentStreak: this.calculateFlowStreak(socket.userId)
            });

            console.log(`🌊 Flow state achieved in session ${sessionId}`);
        } catch (error) {
            console.error('Error handling flow state report:', error);
        }
    }

    // Handle energy/mood check-ins
    handleEnergyCheckin(socket, { energyLevel, mood, notes }) {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);
            if (!session) return;

            const checkin = {
                energyLevel,
                mood,
                notes,
                timestamp: new Date().toISOString(),
                phase: session.currentPhase,
                timeIntoSession: session.progress.timeSpent
            };

            session.analytics.checkIns.push(checkin);

            // Provide adaptive feedback
            const feedback = this.generateAdaptiveFeedback(energyLevel, mood, session);

            socket.emit('checkin-processed', {
                message: 'Check-in recorded! Thanks for staying aware.',
                feedback: feedback.message,
                suggestions: feedback.suggestions,
                adaptations: feedback.adaptations
            });

            console.log(`📊 Energy check-in: ${energyLevel}/10 mood: ${mood}`);
        } catch (error) {
            console.error('Error handling energy checkin:', error);
        }
    }

    // End focus session
    endFocusSession(socket, reason = 'user-ended') {
        try {
            const sessionId = this.userSessions.get(socket.userId);
            if (!sessionId) return;

            const session = this.activeSessions.get(sessionId);
            if (!session) return;

            // Clear timer
            if (session.timerId) {
                clearInterval(session.timerId);
            }

            // Calculate final statistics
            const endTime = new Date().toISOString();
            const totalMinutes = moment(endTime).diff(moment(session.startTime), 'minutes');
            const summary = this.generateSessionSummary(session, totalMinutes, reason);

            // Save to productivity history
            this.saveProductivityData(socket.userId, summary);

            // Send session summary
            socket.emit('focus-session-ended', {
                sessionId,
                reason,
                summary,
                achievements: session.analytics.achievements,
                insights: this.generateInsights(session),
                nextSessionSuggestions: this.generateNextSessionSuggestions(session)
            });

            // Notify accountability partners
            if (session.settings.accountabilityMode) {
                socket.leave('accountability-room');
                socket.to('accountability-room').emit('partner-ended-session', {
                    username: session.username,
                    summary: {
                        cyclesCompleted: session.progress.cyclesCompleted,
                        totalTime: totalMinutes,
                        reason
                    }
                });
            }

            // Clean up
            this.activeSessions.delete(sessionId);
            this.userSessions.delete(socket.userId);

            console.log(`🎯 Focus session ended: ${sessionId} - ${reason}`);
        } catch (error) {
            console.error('Error ending focus session:', error);
        }
    }

    // Handle disconnection
    handleDisconnect(socket) {
        try {
            this.endFocusSession(socket, 'disconnected');
            console.log(`🎯 User ${socket.userId} disconnected from focus sessions`);
        } catch (error) {
            console.error('Error handling focus session disconnect:', error);
        }
    }

    // Utility methods

    getCurrentPhaseDuration(session) {
        switch (session.currentPhase) {
            case 'focus':
                return session.durations.focus;
            case 'break':
                return session.durations.shortBreak;
            case 'longBreak':
                return session.durations.longBreak;
            default:
                return session.durations.focus;
        }
    }

    generateStartEncouragement(energyLevel, difficulty) {
        const encouragements = {
            high: [
                'You\'re energized and ready! Let\'s channel that into deep work! ⚡',
                'High energy detected! Perfect time for tackling challenging tasks! 🔥',
                'You\'re in a great headspace! Let\'s make this session count! 🚀'
            ],
            medium: [
                'Steady energy is perfect for consistent progress! 🎯',
                'Great mindset for a productive session! 💪',
                'You\'re ready to dive in! Let\'s build momentum! 📈'
            ],
            low: [
                'Low energy? No problem! Even small steps count! 🌱',
                'Starting is the hardest part - you\'ve got this! 💙',
                'Gentle progress is still progress! Be kind to yourself! ✨'
            ]
        };

        const level = energyLevel >= 7 ? 'high' : energyLevel >= 4 ? 'medium' : 'low';
        const messages = encouragements[level];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getTimerMessage(session) {
        const timeRemaining = this.getCurrentPhaseDuration(session) - session.progress.timeSpent;
        const phase = session.currentPhase;

        if (phase === 'focus') {
            if (timeRemaining > 15) return 'You\'re in the zone! Keep that focus flowing! 🎯';
            if (timeRemaining > 5) return 'Great progress! The finish line is in sight! 📈';
            return 'Final stretch! You\'ve got this! 💪';
        } else {
            if (timeRemaining > 3) return 'Recharge time! Let your mind rest and reset! 🔋';
            return 'Break almost over! Ready to dive back in! ⚡';
        }
    }

    generateCompletionCelebration(session) {
        const celebrations = [
            '🎉 Focus block completed! Your brain just leveled up!',
            '✨ Awesome work! You stayed focused like a champion!',
            '🏆 Another win! Your consistency is building success!',
            '🔥 Nailed it! That\'s the power of focused effort!',
            '⚡ Focus mastery achieved! You\'re unstoppable!'
        ];
        return celebrations[Math.floor(Math.random() * celebrations.length)];
    }

    generateBreakSuggestions(energyLevel, isLongBreak) {
        const suggestions = {
            high: isLongBreak ?
                ['Take a walk outside', 'Do some light stretching', 'Hydrate and have a healthy snack'] :
                ['Quick breathing exercise', 'Look away from screen', 'Stand and stretch'],
            medium: isLongBreak ?
                ['Light physical activity', 'Practice mindfulness', 'Connect with nature'] :
                ['Deep breathing', 'Gentle neck rolls', 'Drink water'],
            low: isLongBreak ?
                ['Rest your eyes', 'Gentle movement', 'Listen to calming music'] :
                ['Close eyes and breathe', 'Gentle head massage', 'Positive affirmation']
        };

        const level = energyLevel >= 7 ? 'high' : energyLevel >= 4 ? 'medium' : 'low';
        return suggestions[level];
    }

    generateDistractionHelp(type, intensity, session) {
        const strategies = {
            'mind-wandering': {
                strategies: ['Note the thought and return to task', 'Use the 3-2-1 refocus technique', 'Remind yourself of your task goal'],
                quickActions: ['Take 3 deep breaths', 'Read your task description', 'Adjust your posture'],
                encouragement: 'Mind wandering is normal for ADHD brains! Gently guide your attention back. 🧠'
            },
            'external': {
                strategies: ['Adjust your environment', 'Use noise-canceling headphones', 'Find a quieter space'],
                quickActions: ['Block distracting websites', 'Turn off notifications', 'Use focus music'],
                encouragement: 'External distractions are manageable! Take control of your environment. 🎯'
            },
            'digital': {
                strategies: ['Close unnecessary tabs', 'Put phone in another room', 'Use app blockers'],
                quickActions: ['Turn on airplane mode', 'Use website blocker', 'Hide taskbar'],
                encouragement: 'Digital distractions are the modern challenge! You can master them. 📱'
            },
            'internal': {
                strategies: ['Acknowledge the feeling', 'Write it down for later', 'Practice self-compassion'],
                quickActions: ['Take slow breaths', 'Gentle self-talk', 'Ground yourself (5-4-3-2-1)'],
                encouragement: 'Internal struggles are part of the journey. Be patient with yourself. 💙'
            }
        };

        return strategies[type] || strategies['mind-wandering'];
    }

    checkAchievements(session) {
        const achievements = [];
        const { cyclesCompleted, distractionReports, flowStateAchieved } = session.progress;

        if (cyclesCompleted === 1) achievements.push('🌟 First Focus');
        if (cyclesCompleted === 3) achievements.push('🔥 Triple Threat');
        if (cyclesCompleted >= 5) achievements.push('🏆 Focus Champion');
        if (distractionReports === 0) achievements.push('🎯 Laser Focus');
        if (distractionReports > 0 && distractionReports < 3) achievements.push('🧘 Mindful Recovery');
        if (flowStateAchieved) achievements.push('🌊 Flow Master');

        return achievements;
    }

    generateSessionSummary(session, totalMinutes, reason) {
        return {
            sessionId: session.id,
            template: session.template,
            totalTime: totalMinutes,
            cyclesCompleted: session.progress.cyclesCompleted,
            breaksCompleted: session.progress.breaksCompleted,
            distractionsHandled: session.progress.distractionReports,
            flowStateAchieved: session.progress.flowStateAchieved,
            taskDescription: session.taskDescription,
            endReason: reason,
            productivity: this.calculateProductivityScore(session),
            mood: this.analyzeMoodTrend(session.analytics.checkIns),
            energyTrend: this.analyzeEnergyTrend(session.analytics.checkIns)
        };
    }

    calculateProductivityScore(session) {
        const baseScore = session.progress.cyclesCompleted * 25;
        const flowBonus = session.progress.flowStateAchieved ? 20 : 0;
        const distractionPenalty = session.progress.distractionReports * 5;
        return Math.max(0, Math.min(100, baseScore + flowBonus - distractionPenalty));
    }

    generateInsights(session) {
        const insights = [];

        if (session.progress.flowStateAchieved) {
            insights.push('🌊 You achieved flow state! Try to replicate the conditions that led to this.');
        }

        if (session.progress.distractionReports === 0) {
            insights.push('🎯 Zero distractions! Your environment and mindset were perfectly aligned.');
        }

        if (session.analytics.checkIns.length > 0) {
            const avgEnergy = session.analytics.checkIns.reduce((sum, c) => sum + c.energyLevel, 0) / session.analytics.checkIns.length;
            if (avgEnergy > session.energyLevel) {
                insights.push('📈 Your energy increased during the session! Focused work energizes you.');
            }
        }

        return insights;
    }

    saveProductivityData(userId, summary) {
        if (!this.productivityData.has(userId)) {
            this.productivityData.set(userId, []);
        }

        const userData = this.productivityData.get(userId);
        userData.push({
            ...summary,
            date: new Date().toISOString().split('T')[0]
        });

        // Keep only last 30 sessions
        if (userData.length > 30) {
            userData.splice(0, userData.length - 30);
        }
    }

    analyzeMoodTrend(checkIns) {
        if (checkIns.length === 0) return 'stable';

        const moods = checkIns.map(c => c.mood);
        const positiveMoods = ['happy', 'excited', 'motivated', 'focused'];
        const positiveCount = moods.filter(m => positiveMoods.includes(m)).length;

        return positiveCount > moods.length / 2 ? 'positive' : 'neutral';
    }

    analyzeEnergyTrend(checkIns) {
        if (checkIns.length < 2) return 'stable';

        const first = checkIns[0].energyLevel;
        const last = checkIns[checkIns.length - 1].energyLevel;

        if (last > first + 1) return 'increasing';
        if (last < first - 1) return 'decreasing';
        return 'stable';
    }
}

module.exports = new FocusSessionSocket();
