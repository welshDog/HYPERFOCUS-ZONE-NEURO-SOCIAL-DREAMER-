/**
 * 🔗💎⚡ Backend Integration Example Component ⚡💎🔗
 *
 * This component demonstrates how to use the backend integration
 * in existing React Native components
 */

import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useBackendIntegration } from '../hooks/useBackendIntegration';

interface BackendIntegrationExampleProps {
    onClose?: () => void;
}

const BackendIntegrationExample: React.FC<BackendIntegrationExampleProps> = ({ onClose }) => {
    const {
        isConnected,
        isAuthenticated,
        connectionError,
        login,
        register,
        logout,
        spaces,
        realTime,
        showSuccess,
        showError,
        checkConnection,
    } = useBackendIntegration();

    const { user } = useAuth();
    const [connectionStatus, setConnectionStatus] = useState('Checking...');

    useEffect(() => {
        // Check connection status
        const checkStatus = async () => {
            const connected = await checkConnection();
            setConnectionStatus(connected ? 'Connected' : 'Disconnected');
        };

        checkStatus();
    }, [checkConnection]);

    // Demo login function
    const handleDemoLogin = async () => {
        const success = await login('demo@hyperfocus.zone', 'demo123', true);
        if (success) {
            showSuccess('🎉 Demo login successful!');
        }
    };

    // Demo registration function
    const handleDemoRegister = async () => {
        const userData = {
            username: `demo_user_${Date.now()}`,
            email: `demo${Date.now()}@hyperfocus.zone`,
            password: 'demo123',
            neurodivergentProfile: {
                adhdType: 'combined',
                focusPreferences: {
                    preferredTimerType: 'pomodoro',
                    defaultDuration: 25,
                    breakDuration: 5,
                },
            },
        };

        const success = await register(userData);
        if (success) {
            showSuccess('🎉 Demo registration successful!');
        }
    };

    // Demo space creation
    const handleCreateDemoSpace = async () => {
        if (!isAuthenticated) {
            showError('Please login first!');
            return;
        }

        const success = await spaces.create({
            name: `Demo Space ${Date.now()}`,
            description: 'A demo space for testing backend integration',
            category: 'technology',
            tags: ['demo', 'test', 'backend'],
            neurodivergentFriendly: true,
            allowBodyDoubling: true,
            allowFocusSessions: true,
        });

        if (success) {
            showSuccess('🌟 Demo space created!');
        }
    };

    // Demo focus session
    const handleStartFocusSession = async () => {
        if (!isAuthenticated) {
            showError('Please login first!');
            return;
        }

        try {
            await realTime.startFocusSession('pomodoro', 1500000); // 25 minutes
            showSuccess('🎯 Focus session started!');
        } catch (error) {
            showError('Failed to start focus session');
        }
    };

    // Demo body doubling
    const handleCreateBodyDoubling = async () => {
        if (!isAuthenticated) {
            showError('Please login first!');
            return;
        }

        try {
            await realTime.createBodyDoublingSession(undefined, 4);
            showSuccess('👥 Body doubling session created!');
        } catch (error) {
            showError('Failed to create body doubling session');
        }
    };

    // Demo chat message
    const handleSendMessage = async () => {
        if (!isAuthenticated) {
            showError('Please login first!');
            return;
        }

        try {
            await realTime.sendMessage('Hello from the React Native app! 🚀');
            showSuccess('💬 Message sent!');
        } catch (error) {
            showError('Failed to send message');
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🔗 Backend Integration Demo</Text>
                {onClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Connection Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌐 Connection Status</Text>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Backend:</Text>
                    <Text style={[styles.statusValue, isConnected ? styles.connected : styles.disconnected]}>
                        {connectionStatus}
                    </Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Socket:</Text>
                    <Text style={[styles.statusValue, isConnected ? styles.connected : styles.disconnected]}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                </View>
                {connectionError && (
                    <Text style={styles.errorText}>Error: {connectionError}</Text>
                )}
            </View>

            {/* Authentication */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔐 Authentication</Text>
                {isAuthenticated ? (
                    <View>
                        <Text style={styles.userInfo}>
                            👤 Logged in as: {user?.username || 'Unknown'}
                        </Text>
                        <TouchableOpacity style={styles.button} onPress={logout}>
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={handleDemoLogin}>
                            <Text style={styles.buttonText}>Demo Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleDemoRegister}>
                            <Text style={styles.buttonText}>Demo Register</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Spaces Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌟 Interest Spaces</Text>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Loaded Spaces:</Text>
                    <Text style={styles.statusValue}>{spaces.list.length}</Text>
                </View>
                {spaces.loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#6c5ce7" />
                        <Text style={styles.loadingText}>Loading spaces...</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.button} onPress={spaces.fetch}>
                    <Text style={styles.buttonText}>Refresh Spaces</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleCreateDemoSpace}>
                    <Text style={styles.buttonText}>Create Demo Space</Text>
                </TouchableOpacity>
            </View>

            {/* Real-time Features */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚡ Real-time Features</Text>

                {/* Focus Sessions */}
                <View style={styles.featureContainer}>
                    <Text style={styles.featureTitle}>🎯 Focus Sessions</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Active Sessions:</Text>
                        <Text style={styles.statusValue}>{realTime.focusActiveSessions.length}</Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleStartFocusSession}>
                        <Text style={styles.buttonText}>Start Pomodoro (25min)</Text>
                    </TouchableOpacity>
                </View>

                {/* Body Doubling */}
                <View style={styles.featureContainer}>
                    <Text style={styles.featureTitle}>👥 Body Doubling</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Current Partner:</Text>
                        <Text style={styles.statusValue}>
                            {realTime.currentPartner ? realTime.currentPartner.username : 'None'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleCreateBodyDoubling}>
                        <Text style={styles.buttonText}>Create Session</Text>
                    </TouchableOpacity>
                </View>

                {/* Chat */}
                <View style={styles.featureContainer}>
                    <Text style={styles.featureTitle}>💬 Chat</Text>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Messages:</Text>
                        <Text style={styles.statusValue}>{realTime.messages.length}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Unread:</Text>
                        <Text style={styles.statusValue}>{realTime.unreadCount}</Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
                        <Text style={styles.buttonText}>Send Test Message</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    🧠💎⚡ HyperFocus Zone Backend Integration
                </Text>
                <Text style={styles.footerSubtext}>
                    Real-time ADHD-optimized collaboration platform
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#2d3748',
        borderRadius: 20,
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6c5ce7',
        marginBottom: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusLabel: {
        color: '#a0aec0',
        fontSize: 14,
    },
    statusValue: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    connected: {
        color: '#48bb78',
    },
    disconnected: {
        color: '#f56565',
    },
    errorText: {
        color: '#f56565',
        fontSize: 12,
        marginTop: 8,
    },
    userInfo: {
        color: '#ffffff',
        fontSize: 14,
        marginBottom: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#6c5ce7',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        flex: 1,
        marginRight: 4,
    },
    secondaryButton: {
        backgroundColor: '#4a5568',
        marginLeft: 4,
        marginRight: 0,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    loadingText: {
        color: '#a0aec0',
        marginLeft: 8,
        fontSize: 12,
    },
    featureContainer: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    footer: {
        alignItems: 'center',
        padding: 24,
    },
    footerText: {
        color: '#6c5ce7',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footerSubtext: {
        color: '#a0aec0',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
});

export default BackendIntegrationExample;
