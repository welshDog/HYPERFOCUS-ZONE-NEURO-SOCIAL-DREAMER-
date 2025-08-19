/**
 * 🔗💎⚡ Integration Examples for Existing Components ⚡💎🔗
 *
 * This file demonstrates how to upgrade existing React Native components
 * to use the new backend integration features
 */

import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useBackendIntegration } from '../hooks/useBackendIntegration';

// Example 1: Simple Button Component with Real-time Features
const RealtimeActionButton: React.FC<{ actionType: string; spaceId?: string }> = ({
    actionType,
    spaceId
}) => {
    const { realTime, isConnected, showSuccess } = useBackendIntegration();

    const handleAction = async () => {
        if (!isConnected) return;

        switch (actionType) {
            case 'focus':
                await realTime.startFocusSession('pomodoro', 25 * 60 * 1000, spaceId);
                showSuccess('🎯 Focus session started!');
                break;
            case 'body-doubling':
                await realTime.createBodyDoublingSession(spaceId, 4);
                showSuccess('🤝 Body doubling session created!');
                break;
            case 'chat':
                await realTime.sendMessage('Hello from React Native!', spaceId || 'general');
                showSuccess('💬 Message sent!');
                break;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.actionButton, !isConnected && styles.disabledButton]}
            onPress={handleAction}
            disabled={!isConnected}
        >
            <Text style={styles.buttonText}>
                {actionType === 'focus' && '🎯 Start Focus'}
                {actionType === 'body-doubling' && '🤝 Find Partner'}
                {actionType === 'chat' && '💬 Send Message'}
            </Text>
        </TouchableOpacity>
    );
};

// Example 2: Space Card with Backend Integration
const SpaceCard: React.FC<{ spaceId: string }> = ({ spaceId }) => {
    const { spaces, realTime, isAuthenticated } = useBackendIntegration();
    const [spaceData, setSpaceData] = useState<any>(null);

    useEffect(() => {
        const space = spaces.list.find(s => s.id === spaceId);
        setSpaceData(space);
    }, [spaces.list, spaceId]);

    const joinSpace = async () => {
        if (!isAuthenticated) return;
        await spaces.join(spaceId, 8); // Hyperfocus level 8/10
    };

    if (!spaceData) return null;

    return (
        <View style={styles.spaceCard}>
            <Text style={styles.spaceName}>{spaceData.name}</Text>
            <Text style={styles.spaceDescription}>{spaceData.description}</Text>
            <View style={styles.spaceStats}>
                <Text style={styles.statText}>
                    👥 {spaceData.activeMembers} members
                </Text>
                <Text style={styles.statText}>
                    🎯 {realTime.currentFocusSession ? 1 : 0} focus sessions
                </Text>
            </View>
            <TouchableOpacity style={styles.joinButton} onPress={joinSpace}>
                <Text style={styles.buttonText}>Join Space</Text>
            </TouchableOpacity>
        </View>
    );
};

// Example 3: Chat Message Component with ADHD Features
const ChatMessage: React.FC<{ messageId: string }> = ({ messageId }) => {
    const { realTime, showAdhdFriendlyMessage } = useBackendIntegration();
    const [message, setMessage] = useState<any>(null);

    useEffect(() => {
        // For demo purposes, create mock message
        setMessage({
            id: messageId,
            author: { username: 'Demo User' },
            message: 'This is a demo message',
            timestamp: new Date().toISOString(),
            spaceId: 'general'
        });
    }, [messageId]);

    const reactToMessage = async (reaction: string) => {
        await realTime.sendMessage(reaction, message.spaceId);
        showAdhdFriendlyMessage('success');
    }; if (!message) return null;

    return (
        <View style={styles.messageCard}>
            <Text style={styles.messageAuthor}>{message.author.username}</Text>
            <Text style={styles.messageText}>{message.message}</Text>
            <Text style={styles.messageTime}>
                {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
            <View style={styles.reactionBar}>
                <TouchableOpacity onPress={() => reactToMessage('👍')}>
                    <Text style={styles.reactionButton}>👍</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => reactToMessage('❤️')}>
                    <Text style={styles.reactionButton}>❤️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => reactToMessage('🔥')}>
                    <Text style={styles.reactionButton}>🔥</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Example 4: Flow State Indicator Component
const FlowStateIndicator: React.FC = () => {
    const { realTime, showAdhdFriendlyMessage } = useBackendIntegration();
    const currentSession = realTime.currentFocusSession;
    const isInFlowState = false; // Mock for demo - would be realTime.isInFlowState if available
    const hasRecentDistraction = false; // Mock for demo

    useEffect(() => {
        if (isInFlowState) {
            showAdhdFriendlyMessage('flow');
        } else if (hasRecentDistraction) {
            showAdhdFriendlyMessage('distraction');
        }
    }, [isInFlowState, hasRecentDistraction]); if (!currentSession) return null;

    return (
        <View style={styles.flowIndicator}>
            <Text style={styles.flowTitle}>🧠 Flow State Monitor</Text>
            <View style={[
                styles.flowStatus,
                { backgroundColor: isInFlowState ? '#4ade80' : hasRecentDistraction ? '#ef4444' : '#fbbf24' }
            ]}>
                <Text style={styles.flowText}>
                    {isInFlowState ? '✨ IN FLOW STATE!' :
                        hasRecentDistraction ? '🌊 Gentle refocus' :
                            '🎯 Focus building...'}
                </Text>
            </View>
        </View>
    );
};

// Main Integration Examples Container
const IntegrationExamples: React.FC = () => {
    const { isConnected, isAuthenticated, spaces, realTime } = useBackendIntegration();

    useEffect(() => {
        if (isAuthenticated) {
            spaces.fetch(); // Load available spaces
        }
    }, [isAuthenticated]);

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🔗 Integration Examples</Text>

            <Text style={styles.sectionTitle}>📊 Connection Status</Text>
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Socket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </Text>
                <Text style={styles.statusText}>
                    Auth: {isAuthenticated ? '🔐 Authenticated' : '🔒 Login Required'}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>⚡ Real-time Action Buttons</Text>
            <RealtimeActionButton actionType="focus" spaceId="general" />
            <RealtimeActionButton actionType="body-doubling" spaceId="general" />
            <RealtimeActionButton actionType="chat" spaceId="general" />

            <Text style={styles.sectionTitle}>🌟 Available Spaces</Text>
            {spaces.list.slice(0, 3).map(space => (
                <SpaceCard key={space.id} spaceId={space.id} />
            ))}

            <Text style={styles.sectionTitle}>🧠 Flow State Monitor</Text>
            <FlowStateIndicator />

            <Text style={styles.sectionTitle}>💬 Chat Example</Text>
            <ChatMessage key="demo-message-1" messageId="demo-message-1" />
            <ChatMessage key="demo-message-2" messageId="demo-message-2" />
            <ChatMessage key="demo-message-3" messageId="demo-message-3" />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1a1a2e',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e94560',
        marginTop: 20,
        marginBottom: 10,
    },
    statusContainer: {
        backgroundColor: '#16213e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 16,
        marginBottom: 5,
    },
    actionButton: {
        backgroundColor: '#0f3460',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    disabledButton: {
        backgroundColor: '#666666',
        opacity: 0.5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    spaceCard: {
        backgroundColor: '#16213e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    spaceName: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    spaceDescription: {
        color: '#cccccc',
        fontSize: 14,
        marginBottom: 10,
    },
    spaceStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statText: {
        color: '#e94560',
        fontSize: 12,
    },
    joinButton: {
        backgroundColor: '#e94560',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    messageCard: {
        backgroundColor: '#16213e',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    messageAuthor: {
        color: '#e94560',
        fontSize: 14,
        fontWeight: 'bold',
    },
    messageText: {
        color: '#ffffff',
        fontSize: 16,
        marginVertical: 5,
    },
    messageTime: {
        color: '#888888',
        fontSize: 12,
    },
    reactionBar: {
        flexDirection: 'row',
        marginTop: 5,
    },
    reactionButton: {
        fontSize: 18,
        marginRight: 15,
    },
    flowIndicator: {
        backgroundColor: '#16213e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    flowTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    flowStatus: {
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    flowText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default IntegrationExamples;
