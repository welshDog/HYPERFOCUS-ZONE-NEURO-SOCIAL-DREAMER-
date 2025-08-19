/**
 * 💬💎⚡ Real-time Chat Service - ADHD-Optimized Communication ⚡💎💬
 */

const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class ChatSocket {
    constructor() {
        this.activeChats = new Map(); // spaceId -> Set of users
        this.typingUsers = new Map(); // spaceId -> Set of typing users
        this.messageHistory = new Map(); // spaceId -> Array of recent messages
        this.userPreferences = new Map(); // userId -> chat preferences
    }

    // Join interest space chat room
    joinSpaceChat(socket, spaceId) {
        try {
            socket.join(`space-${spaceId}`);

            // Add user to active chat tracking
            if (!this.activeChats.has(spaceId)) {
                this.activeChats.set(spaceId, new Set());
            }
            this.activeChats.get(spaceId).add(socket.userId);

            // Send recent message history (ADHD-friendly: limited to prevent overwhelm)
            const recentMessages = this.getRecentMessages(spaceId, 20);
            socket.emit('chat-history', {
                spaceId,
                messages: recentMessages,
                userCount: this.activeChats.get(spaceId).size
            });

            // Notify others of user joining (subtle notification)
            socket.to(`space-${spaceId}`).emit('user-joined-chat', {
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                timestamp: new Date().toISOString(),
                userCount: this.activeChats.get(spaceId).size
            });

            console.log(`💬 User ${socket.userId} joined space ${spaceId} chat`);
        } catch (error) {
            console.error('Error joining space chat:', error);
            socket.emit('chat-error', {
                message: 'Failed to join chat',
                spaceId
            });
        }
    }

    // Send message with ADHD-optimized features
    sendMessage(socket, messageData) {
        try {
            const { spaceId, content, messageType = 'text', replyTo = null } = messageData;

            // Validate message content
            if (!content || content.trim().length === 0) {
                socket.emit('message-error', {
                    error: 'Message cannot be empty'
                });
                return;
            }

            // ADHD-friendly message length check
            if (content.length > 2000) {
                socket.emit('message-error', {
                    error: 'Message too long. Please keep messages under 2000 characters for better readability.'
                });
                return;
            }

            const message = {
                id: uuidv4(),
                spaceId,
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                content: this.sanitizeMessage(content),
                messageType,
                replyTo,
                timestamp: new Date().toISOString(),
                reactions: {},
                isEdited: false,
                // ADHD-friendly features
                readabilityScore: this.calculateReadability(content),
                hasLinks: this.containsLinks(content),
                hasMentions: this.extractMentions(content),
                energyLevel: this.detectEnergyLevel(content)
            };

            // Store message in history
            this.addToMessageHistory(spaceId, message);

            // Send to all users in the space
            socket.to(`space-${spaceId}`).emit('new-message', message);
            socket.emit('message-sent', {
                messageId: message.id,
                timestamp: message.timestamp
            });

            // Remove user from typing indicators
            this.removeFromTyping(socket, spaceId);

            console.log(`💬 Message sent in space ${spaceId} by ${socket.userId}`);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message-error', {
                error: 'Failed to send message'
            });
        }
    }

    // Handle typing indicators (ADHD-considerate)
    handleTypingStart(socket, { spaceId }) {
        try {
            if (!this.typingUsers.has(spaceId)) {
                this.typingUsers.set(spaceId, new Set());
            }

            this.typingUsers.get(spaceId).add(socket.userId);

            // Send typing indicator to others (gentle, non-distracting)
            socket.to(`space-${spaceId}`).emit('user-typing', {
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                spaceId
            });

            // Auto-clear typing after 5 seconds (ADHD consideration)
            setTimeout(() => {
                this.removeFromTyping(socket, spaceId);
            }, 5000);
        } catch (error) {
            console.error('Error handling typing start:', error);
        }
    }

    handleTypingStop(socket, { spaceId }) {
        this.removeFromTyping(socket, spaceId);
    }

    removeFromTyping(socket, spaceId) {
        if (this.typingUsers.has(spaceId)) {
            this.typingUsers.get(spaceId).delete(socket.userId);

            socket.to(`space-${spaceId}`).emit('user-stopped-typing', {
                userId: socket.userId,
                spaceId
            });
        }
    }

    // Handle message reactions (emotional regulation support)
    handleReaction(socket, { messageId, spaceId, reaction }) {
        try {
            const validReactions = ['❤️', '👍', '😊', '💡', '🔥', '✨', '🧠', '💎', '⚡', '🌟'];

            if (!validReactions.includes(reaction)) {
                socket.emit('reaction-error', {
                    error: 'Invalid reaction'
                });
                return;
            }

            // Broadcast reaction to space
            socket.to(`space-${spaceId}`).emit('message-reaction', {
                messageId,
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                reaction,
                timestamp: new Date().toISOString()
            });

            console.log(`💬 Reaction ${reaction} added to message ${messageId}`);
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    }

    // Handle voice messages (alternative communication method)
    handleVoiceMessage(socket, { spaceId, audioData, duration }) {
        try {
            if (!audioData || duration > 60000) { // Max 1 minute
                socket.emit('voice-message-error', {
                    error: 'Voice message too long or invalid'
                });
                return;
            }

            const voiceMessage = {
                id: uuidv4(),
                spaceId,
                userId: socket.userId,
                username: socket.userData?.username || 'Anonymous',
                messageType: 'voice',
                audioData,
                duration,
                timestamp: new Date().toISOString(),
                reactions: {}
            };

            // Store and broadcast voice message
            this.addToMessageHistory(spaceId, voiceMessage);
            socket.to(`space-${spaceId}`).emit('voice-message', voiceMessage);
            socket.emit('voice-message-sent', {
                messageId: voiceMessage.id
            });

            console.log(`🎤 Voice message sent in space ${spaceId}`);
        } catch (error) {
            console.error('Error handling voice message:', error);
            socket.emit('voice-message-error', {
                error: 'Failed to send voice message'
            });
        }
    }

    // Handle disconnection
    handleDisconnect(socket) {
        try {
            // Remove from all active chats
            for (const [spaceId, users] of this.activeChats) {
                if (users.has(socket.userId)) {
                    users.delete(socket.userId);

                    // Notify others of user leaving
                    socket.to(`space-${spaceId}`).emit('user-left-chat', {
                        userId: socket.userId,
                        userCount: users.size
                    });
                }
            }

            // Remove from typing indicators
            for (const [spaceId, typingUsers] of this.typingUsers) {
                if (typingUsers.has(socket.userId)) {
                    typingUsers.delete(socket.userId);
                    socket.to(`space-${spaceId}`).emit('user-stopped-typing', {
                        userId: socket.userId,
                        spaceId
                    });
                }
            }

            console.log(`💬 User ${socket.userId} disconnected from chat`);
        } catch (error) {
            console.error('Error handling chat disconnect:', error);
        }
    }

    // Utility methods

    getRecentMessages(spaceId, limit = 20) {
        const messages = this.messageHistory.get(spaceId) || [];
        return messages.slice(-limit);
    }

    addToMessageHistory(spaceId, message) {
        if (!this.messageHistory.has(spaceId)) {
            this.messageHistory.set(spaceId, []);
        }

        const messages = this.messageHistory.get(spaceId);
        messages.push(message);

        // Keep only last 100 messages in memory (ADHD: prevent overwhelm)
        if (messages.length > 100) {
            messages.splice(0, messages.length - 100);
        }
    }

    sanitizeMessage(content) {
        // Basic sanitization - remove harmful scripts
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .trim();
    }

    calculateReadability(content) {
        // Simple readability score for ADHD-friendly content
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/).filter(w => w.length > 0);
        const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

        // Lower score = more readable (ADHD-friendly)
        return avgWordsPerSentence < 15 ? 'high' : avgWordsPerSentence < 25 ? 'medium' : 'low';
    }

    containsLinks(content) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return urlRegex.test(content);
    }

    extractMentions(content) {
        const mentionRegex = /@(\w+)/g;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1]);
        }
        return mentions;
    }

    detectEnergyLevel(content) {
        // Detect energy level in message for ADHD awareness
        const exclamationCount = (content.match(/!/g) || []).length;
        const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
        const energyWords = ['excited', 'amazing', 'awesome', 'wow', 'incredible', 'hyperfocus'];
        const hasEnergyWords = energyWords.some(word =>
            content.toLowerCase().includes(word)
        );

        if (exclamationCount > 2 || capsRatio > 0.3 || hasEnergyWords) {
            return 'high';
        } else if (exclamationCount > 0 || capsRatio > 0.1) {
            return 'medium';
        }
        return 'low';
    }
}

module.exports = new ChatSocket();
