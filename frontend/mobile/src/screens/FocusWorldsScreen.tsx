/**
 * 🎯💎⚡ Focus Worlds Screen - Main Hub ⚡💎🎯
 *
 * ADHD-Optimized Focus Management:
 * - Deep Work World: Hyperfocus session environment
 * - Social Browse World: ADHD-friendly social browsing
 * - Quick mode switching with minimal friction
 */

import React, { useContext, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { FocusWorldContext } from '../contexts/FocusWorldContext';
import { ThemeContext } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface FocusWorldCardProps {
    title: string;
    description: string;
    icon: string;
    color: string;
    onPress: () => void;
    isActive: boolean;
}

const FocusWorldCard: React.FC<FocusWorldCardProps> = ({
    title,
    description,
    icon,
    color,
    onPress,
    isActive,
}) => {
    const scaleAnim = new Animated.Value(1);

    const handlePress = () => {
        HapticFeedback.trigger('impactMedium');

        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        onPress();
    };

    return (
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                style={[
                    styles.card,
                    { backgroundColor: color },
                    isActive && styles.activeCard,
                ]}
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={`${title} Focus World`}
                accessibilityHint={description}>
                <View style={styles.cardIcon}>
                    <Icon name={icon} size={40} color="#ffffff" />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
                {isActive && (
                    <View style={styles.activeIndicator}>
                        <Icon name="check-circle" size={20} color="#00b894" />
                        <Text style={styles.activeText}>Active</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const FocusWorldsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { currentWorld, setCurrentWorld } = useContext(FocusWorldContext);
    const { theme } = useContext(ThemeContext);
    const [sessionTime, setSessionTime] = useState(0);

    const focusWorlds = [
        {
            id: 'deep-work',
            title: '🧠 Deep Work',
            description: 'Hyperfocus session environment with distraction blocking',
            icon: 'brain',
            color: '#6c5ce7',
            screen: 'DeepWork',
        },
        {
            id: 'social-browse',
            title: '🌊 Social Browse',
            description: 'ADHD-friendly social browsing with attention management',
            icon: 'account-group',
            color: '#00b894',
            screen: 'SocialBrowse',
        },
    ];

    const handleWorldSelect = (world: any) => {
        setCurrentWorld(world.id);
        navigation.navigate(world.screen);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        🎯 Focus Worlds
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Choose your optimal environment for productivity and connection
                    </Text>
                </View>

                <View style={styles.worldsContainer}>
                    {focusWorlds.map((world) => (
                        <FocusWorldCard
                            key={world.id}
                            title={world.title}
                            description={world.description}
                            icon={world.icon}
                            color={world.color}
                            onPress={() => handleWorldSelect(world)}
                            isActive={currentWorld === world.id}
                        />
                    ))}
                </View>

                <View style={styles.statsContainer}>
                    <Text style={[styles.statsTitle, { color: theme.text }]}>
                        📊 Today's Focus Stats
                    </Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Icon name="timer" size={24} color="#6c5ce7" />
                            <Text style={[styles.statValue, { color: theme.text }]}>2h 15m</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                Deep Work
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="lightning-bolt" size={24} color="#00b894" />
                            <Text style={[styles.statValue, { color: theme.text }]}>45m</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                Social Time
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Icon name="trophy" size={24} color="#fdcb6e" />
                            <Text style={[styles.statValue, { color: theme.text }]}>3</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                Achievements
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    worldsContainer: {
        marginBottom: 30,
    },
    cardContainer: {
        marginBottom: 20,
    },
    card: {
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    activeCard: {
        borderWidth: 3,
        borderColor: '#00b894',
    },
    cardIcon: {
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 18,
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    activeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    statsContainer: {
        backgroundColor: 'rgba(108, 92, 231, 0.1)',
        borderRadius: 15,
        padding: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
});

export default FocusWorldsScreen;
