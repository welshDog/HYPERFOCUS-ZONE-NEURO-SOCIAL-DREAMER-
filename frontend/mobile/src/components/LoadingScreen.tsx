/**
 * 🌟💎⚡ Loading Screen - ADHD-Friendly Loading Experience ⚡💎🌟
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const LoadingScreen: React.FC = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Gentle fade in animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                bounciness: 8,
                speed: 12,
            }),
        ]).start();

        // Continuous gentle rotation
        const rotateAnimation = Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            }),
        );

        rotateAnimation.start();

        return () => {
            rotateAnimation.stop();
        };
    }, [fadeAnim, scaleAnim, rotateAnim]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}>
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            transform: [{ rotate: spin }],
                        },
                    ]}>
                    <Icon name="brain" size={80} color="#6c5ce7" />
                </Animated.View>

                <Text style={styles.title}>HyperFocus Zone</Text>
                <Text style={styles.subtitle}>Neuro Social Dreamer</Text>

                <View style={styles.loadingBar}>
                    <Animated.View
                        style={[
                            styles.loadingProgress,
                            {
                                transform: [{ scaleX: scaleAnim }],
                            },
                        ]}
                    />
                </View>

                <Text style={styles.loadingText}>
                    🧠 Optimizing for neurodivergent minds...
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: 30,
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        borderRadius: 60,
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#b2bec3',
        marginBottom: 40,
        textAlign: 'center',
    },
    loadingBar: {
        width: width * 0.6,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
    },
    loadingProgress: {
        height: '100%',
        backgroundColor: '#6c5ce7',
        borderRadius: 2,
    },
    loadingText: {
        fontSize: 14,
        color: '#b2bec3',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default LoadingScreen;
