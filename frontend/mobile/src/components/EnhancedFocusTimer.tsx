/**
 * 🎯💎⚡ Enhanced Focus Timer with Backend Integration ⚡💎🎯
 *
 * This component demonstrates how to upgrade existing components
 * to use the new backend integration
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useFocusSession } from '../contexts/RealTimeContext';
import { useBackendIntegration } from '../hooks/useBackendIntegration';

interface EnhancedFocusTimerProps {
    spaceId?: string;
    onSessionComplete?: (session: any) => void;
}

const EnhancedFocusTimer: React.FC<EnhancedFocusTimerProps> = ({
    spaceId,
    onSessionComplete
}) => {
    const { user, isAuthenticated } = useAuth();
    const {
        currentSession,
        activeSessions,
        isInFlowState,
        hasRecentDistraction,
        startSession,
        endSession,
        reportDistraction
    } = useFocusSession();

    const {
        isConnected,
        showAdhdFriendlyMessage,
        showSuccess,
        showError
    } = useBackendIntegration();

    const [localTime, setLocalTime] = useState(0);
    const [isLocalActive, setIsLocalActive] = useState(false);
    const [sessionType, setSessionType] = useState<'pomodoro' | 'ultradian' | 'flow'>('pomodoro');
    const [isStarting, setIsStarting] = useState(false);

    // Sync local timer with backend session
    useEffect(() => {
        if (currentSession) {
            setLocalTime(currentSession.currentTime);
            setIsLocalActive(currentSession.isActive);
        }
    }, [currentSession]);

    // Local timer for UI updates
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isLocalActive && currentSession) {
            interval = setInterval(() => {
                setLocalTime(prev => {
                    const newTime = prev + 1000;
                    if (newTime >= currentSession.duration) {
                        handleSessionComplete();
                        return currentSession.duration;
                    }
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLocalActive, currentSession]);

    // Handle flow state detection
    useEffect(() => {
        if (isInFlowState) {
            showAdhdFriendlyMessage('flow');
        }
    }, [isInFlowState, showAdhdFriendlyMessage]);

    // Handle distraction alerts
    useEffect(() => {
        if (hasRecentDistraction) {
            showAdhdFriendlyMessage('distraction');
        }
    }, [hasRecentDistraction, showAdhdFriendlyMessage]);

    const handleSessionComplete = useCallback(() => {
        setIsLocalActive(false);
        showSuccess('🏁 Focus session complete! Amazing work!');

        if (currentSession && onSessionComplete) {
            onSessionComplete(currentSession);
        }
    }, [currentSession, onSessionComplete, showSuccess]);

    const handleStartSession = async () => {
        if (!isAuthenticated) {
            Alert.alert(
                '🔐 Login Required',
                'Please log in to start a focus session with real-time features!',
                [{ text: 'OK' }]
            );
            return;
        }

        if (!isConnected) {
            Alert.alert(
                '🌐 Connection Required',
                'Please check your internet connection to sync with the backend.',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsStarting(true);

        try {
            const durations = {
                pomodoro: 25 * 60 * 1000, // 25 minutes
                ultradian: 90 * 60 * 1000, // 90 minutes
                flow: 120 * 60 * 1000, // 2 hours
            };

            await startSession({
                type: sessionType,
                duration: durations[sessionType],
                spaceId,
            });

            setIsLocalActive(true);
            showAdhdFriendlyMessage('focus');
        } catch (error) {
            console.error('Failed to start session:', error);
            showError('Failed to start focus session. Please try again.');
        } finally {
            setIsStarting(false);
        }
    };

    const handleEndSession = async () => {
        if (!currentSession) return;

        try {
            await endSession(currentSession.id);
            setIsLocalActive(false);
            setLocalTime(0);
            showSuccess('Session ended successfully!');
        } catch (error) {
            console.error('Failed to end session:', error);
            showError('Failed to end session. Please try again.');
        }
    };

    const handleReportDistraction = async () => {
        if (!currentSession) return;

        try {
            await reportDistraction(currentSession.id, 3); // Medium distraction level
            showAdhdFriendlyMessage('distraction');
        } catch (error) {
            console.error('Failed to report distraction:', error);
        }
    };

    const formatTime = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = (): number => {
        if (!currentSession) return 0;
        return (localTime / currentSession.duration) * 100;
    };

    const getSessionTypeEmoji = (type: string): string => {
        switch (type) {
            case 'pomodoro': return '🍅';
            case 'ultradian': return '🌊';
            case 'flow': return '✨';
            default: return '🎯';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {getSessionTypeEmoji(sessionType)} Focus Timer
                </Text>
                <View style={styles.statusIndicators}>
                    <View style={[styles.indicator, isConnected ? styles.connected : styles.disconnected]}>
                        <Text style={styles.indicatorText}>
                            {isConnected ? '🌐' : '📱'}
                        </Text>
                    </View>
                    {isAuthenticated && (
                        <View style={[styles.indicator, styles.authenticated]}>
                            <Text style={styles.indicatorText}>🔐</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Timer Display */}
            <View style={styles.timerContainer}>
                {currentSession ? (
                    <View style={styles.activeTimer}>
                        <Text style={styles.timerText}>
                            {formatTime(currentSession.duration - localTime)}
                        </Text>
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { width: `${getProgress()}%` }]} />
                        </View>
                        <Text style={styles.sessionInfo}>
                            {getSessionTypeEmoji(currentSession.type)} {currentSession.type.toUpperCase()} SESSION
                        </Text>
                        {currentSession.participants.length > 1 && (
                            <Text style={styles.participantsInfo}>
                                👥 {currentSession.participants.length} participants
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.inactiveTimer}>
                        <Text style={styles.selectTypeText}>Select Focus Type:</Text>
                        <View style={styles.typeSelector}>
                            {(['pomodoro', 'ultradian', 'flow'] as const).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        sessionType === type && styles.selectedType
                                    ]}
                                    onPress={() => setSessionType(type)}
                                >
                                    <Text style={styles.typeEmoji}>{getSessionTypeEmoji(type)}</Text>
                                    <Text style={styles.typeText}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {/* Flow State Indicator */}
            {isInFlowState && (
                <View style={styles.flowStateContainer}>
                    <Text style={styles.flowStateText}>✨ FLOW STATE ACTIVE ✨</Text>
                    <Text style={styles.flowStateSubtext}>You're in the zone! Keep going!</Text>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                {currentSession ? (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.distractionButton]}
                            onPress={handleReportDistraction}
                        >
                            <Text style={styles.buttonText}>🌊 Distracted</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.endButton]}
                            onPress={handleEndSession}
                        >
                            <Text style={styles.buttonText}>🏁 End Session</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.startButton]}
                        onPress={handleStartSession}
                        disabled={isStarting}
                    >
                        {isStarting ? (
                            <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                            <Text style={styles.buttonText}>
                                🚀 Start {getSessionTypeEmoji(sessionType)} {sessionType}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Active Sessions Info */}
            {activeSessions.length > 0 && (
                <View style={styles.activeSessionsContainer}>
                    <Text style={styles.activeSessionsTitle}>
                        🌟 Active Sessions ({activeSessions.length})
                    </Text>
                    {activeSessions.slice(0, 3).map((session) => (
                        <View key={session.id} style={styles.sessionItem}>
                            <Text style={styles.sessionItemText}>
                                {getSessionTypeEmoji(session.type)} {session.type} - {session.participants.length} participants
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* User Status */}
            {user && (
                <View style={styles.userStatus}>
                    <Text style={styles.userStatusText}>
                        👤 {user.username} {isConnected ? '🟢' : '🔴'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        margin: 16,
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
    statusIndicators: {
        flexDirection: 'row',
    },
    indicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    connected: {
        backgroundColor: '#48bb78',
    },
    disconnected: {
        backgroundColor: '#f56565',
    },
    authenticated: {
        backgroundColor: '#6c5ce7',
    },
    indicatorText: {
        fontSize: 16,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    activeTimer: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#6c5ce7',
        marginBottom: 16,
    },
    progressContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#2d3748',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#6c5ce7',
    },
    sessionInfo: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    participantsInfo: {
        fontSize: 14,
        color: '#a0aec0',
    },
    inactiveTimer: {
        alignItems: 'center',
    },
    selectTypeText: {
        fontSize: 18,
        color: '#ffffff',
        marginBottom: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    typeButton: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#2d3748',
        minWidth: 80,
    },
    selectedType: {
        backgroundColor: '#6c5ce7',
    },
    typeEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    typeText: {
        fontSize: 12,
        color: '#ffffff',
        textTransform: 'capitalize',
    },
    flowStateContainer: {
        backgroundColor: '#38b2ac',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    flowStateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    flowStateSubtext: {
        fontSize: 14,
        color: '#ffffff',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 4,
    },
    startButton: {
        backgroundColor: '#6c5ce7',
    },
    endButton: {
        backgroundColor: '#f56565',
    },
    distractionButton: {
        backgroundColor: '#ed8936',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeSessionsContainer: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    activeSessionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c5ce7',
        marginBottom: 8,
    },
    sessionItem: {
        paddingVertical: 4,
    },
    sessionItemText: {
        fontSize: 12,
        color: '#a0aec0',
    },
    userStatus: {
        alignItems: 'center',
    },
    userStatusText: {
        fontSize: 12,
        color: '#a0aec0',
    },
});

export default EnhancedFocusTimer;
