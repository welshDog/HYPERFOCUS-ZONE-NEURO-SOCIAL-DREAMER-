/**
 * 🎯⏱️⚡ Focus Timer Component - ADHD-Optimized Pomodoro ⚡⏱️🎯
 *
 * Features:
 * - Customizable focus/break intervals for ADHD brains
 * - Visual progress indicators (not just numbers)
 * - Gentle break reminders to prevent hyperfocus burnout
 * - Achievement tracking and streak visualization
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import { Circle, Svg } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTheme } from '../contexts/ThemeContext';

interface FocusTimerProps {
    onSessionComplete?: (sessionData: FocusSession) => void;
    initialFocusMinutes?: number;
    initialBreakMinutes?: number;
}

interface FocusSession {
    type: 'focus' | 'break';
    duration: number;
    completed: boolean;
    startTime: Date;
    endTime?: Date;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
    onSessionComplete,
    initialFocusMinutes = 25,
    initialBreakMinutes = 5,
}) => {
    const { colors, typography } = useTheme();
    const { announceForScreenReader, preferredDuration } = useAccessibility();

    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
    const [timeLeft, setTimeLeft] = useState(initialFocusMinutes * 60);
    const [totalTime, setTotalTime] = useState(initialFocusMinutes * 60);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Use accessibility preferences for duration
    const focusDuration = preferredDuration?.focus || initialFocusMinutes;
    const breakDuration = preferredDuration?.break || initialBreakMinutes;

    useEffect(() => {
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, isPaused]);

    useEffect(() => {
        const progress = 1 - (timeLeft / totalTime);
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [timeLeft, totalTime, progressAnim]);

    const handleSessionComplete = () => {
        setIsRunning(false);
        setIsPaused(false);

        // Haptic feedback for session completion
        HapticFeedback.trigger('notificationSuccess');
        Vibration.vibrate([500, 200, 500]);

        const sessionData: FocusSession = {
            type: sessionType,
            duration: totalTime,
            completed: true,
            startTime: new Date(Date.now() - totalTime * 1000),
            endTime: new Date(),
        };

        if (sessionType === 'focus') {
            setSessionsCompleted(prev => prev + 1);
            setCurrentStreak(prev => prev + 1);
            announceForScreenReader(`Focus session completed! Great job! ${sessionsCompleted + 1} sessions completed today.`);

            // Switch to break mode
            setSessionType('break');
            setTimeLeft(breakDuration * 60);
            setTotalTime(breakDuration * 60);

            Alert.alert(
                '🎉 Focus Session Complete!',
                `Great hyperfocus session! Time for a ${breakDuration}-minute break to recharge.`,
                [
                    {
                        text: 'Start Break',
                        onPress: () => startTimer(),
                    },
                    {
                        text: 'Skip Break',
                        onPress: () => switchToFocus(),
                    },
                ]
            );
        } else {
            announceForScreenReader('Break time complete! Ready for another focus session?');

            // Switch to focus mode
            switchToFocus();

            Alert.alert(
                '⚡ Break Complete!',
                'Feeling refreshed? Ready for another focus session?',
                [
                    {
                        text: 'Start Focus',
                        onPress: () => startTimer(),
                    },
                    {
                        text: 'Extend Break',
                        onPress: () => extendBreak(),
                    },
                ]
            );
        }

        onSessionComplete?.(sessionData);
    };

    const startTimer = () => {
        setIsRunning(true);
        setIsPaused(false);
        announceForScreenReader(`${sessionType} session started for ${Math.floor(timeLeft / 60)} minutes`);

        // Start pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const pauseTimer = () => {
        setIsPaused(true);
        announceForScreenReader('Timer paused');
        pulseAnim.stopAnimation();
    };

    const resumeTimer = () => {
        setIsPaused(false);
        announceForScreenReader('Timer resumed');
        startTimer();
    };

    const resetTimer = () => {
        setIsRunning(false);
        setIsPaused(false);
        const duration = sessionType === 'focus' ? focusDuration : breakDuration;
        setTimeLeft(duration * 60);
        setTotalTime(duration * 60);
        progressAnim.setValue(0);
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
        announceForScreenReader('Timer reset');
    };

    const switchToFocus = () => {
        setSessionType('focus');
        setTimeLeft(focusDuration * 60);
        setTotalTime(focusDuration * 60);
        setIsRunning(false);
        setIsPaused(false);
        progressAnim.setValue(0);
    };

    const extendBreak = () => {
        const extraTime = 5 * 60; // 5 more minutes
        setTimeLeft(prev => prev + extraTime);
        setTotalTime(prev => prev + extraTime);
        announceForScreenReader('Break extended by 5 minutes');
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = 1 - (timeLeft / totalTime);
    const strokeDasharray = 2 * Math.PI * 90; // radius = 90
    const strokeDashoffset = strokeDasharray * (1 - progress);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={styles.header}>
                <Text style={[styles.sessionType, { color: colors.text }, typography.headline]}>
                    {sessionType === 'focus' ? '🧠 Focus Session' : '🌱 Break Time'}
                </Text>
                <Text style={[styles.sessionDescription, { color: colors.textSecondary, ...typography.body }]}>
                    {sessionType === 'focus'
                        ? 'Deep work mode - minimize distractions'
                        : 'Recharge and reset your mind'}
                </Text>
            </View>

            <Animated.View
                style={[
                    styles.timerContainer,
                    { transform: [{ scale: pulseAnim }] }
                ]}
            >
                <Svg width={200} height={200} style={styles.progressRing}>
                    {/* Background circle */}
                    <Circle
                        cx={100}
                        cy={100}
                        r={90}
                        stroke={colors.border}
                        strokeWidth={8}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <Circle
                        cx={100}
                        cy={100}
                        r={90}
                        stroke={sessionType === 'focus' ? colors.primary : colors.secondary}
                        strokeWidth={8}
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                    />
                </Svg>

                <View style={styles.timerContent}>
                    <Text style={[styles.timeDisplay, { color: colors.text }, typography.display]}>
                        {formatTime(timeLeft)}
                    </Text>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }, typography.caption]}>
                        {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
                    </Text>
                </View>
            </Animated.View>

            <View style={styles.controls}>
                {!isRunning ? (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                        onPress={startTimer}
                        accessibilityLabel={`Start ${sessionType} session`}
                        accessibilityHint={`Begin ${Math.floor(timeLeft / 60)} minute ${sessionType} session`}
                    >
                        <Icon name="play" size={24} color={colors.onPrimary} />
                        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                            Start {sessionType === 'focus' ? 'Focus' : 'Break'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.runningControls}>
                        <TouchableOpacity
                            style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={isPaused ? resumeTimer : pauseTimer}
                            accessibilityLabel={isPaused ? 'Resume timer' : 'Pause timer'}
                        >
                            <Icon
                                name={isPaused ? "play" : "pause"}
                                size={20}
                                color={colors.text}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={resetTimer}
                            accessibilityLabel="Reset timer"
                        >
                            <Icon name="stop" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>
                        {sessionsCompleted}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Sessions Today
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.secondary }]}>
                        {currentStreak}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Current Streak
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.accent }]}>
                        {Math.floor((sessionsCompleted * focusDuration) / 60)}h
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Focus Time
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        margin: 10,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    sessionType: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    sessionDescription: {
        fontSize: 16,
        textAlign: 'center',
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    progressRing: {
        position: 'absolute',
    },
    timerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeDisplay: {
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'monospace',
    },
    timeLabel: {
        fontSize: 14,
        marginTop: 5,
    },
    controls: {
        marginBottom: 20,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        minWidth: 200,
        justifyContent: 'center',
    },
    runningControls: {
        flexDirection: 'row',
        gap: 15,
    },
    secondaryButton: {
        padding: 15,
        borderRadius: 25,
        borderWidth: 2,
        minWidth: 60,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
});

export default FocusTimer;
