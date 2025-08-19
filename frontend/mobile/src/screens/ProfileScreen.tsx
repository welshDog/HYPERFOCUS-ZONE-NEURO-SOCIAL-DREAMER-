/**
 * 👤💎⚡ Profile Screen - User Settings & Preferences ⚡💎👤
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen: React.FC = () => {
    const { colors, typography } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }, typography.title]}>
                    👤 Your Profile
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
                    Customize your HYPERFOCUS Zone experience
                </Text>
            </View>

            <View style={[styles.comingSoon, { backgroundColor: colors.surface }]}>
                <Text style={[styles.comingSoonTitle, { color: colors.primary }, typography.headline]}>
                    🛠️ Under Construction
                </Text>
                <Text style={[styles.comingSoonText, { color: colors.text }, typography.body]}>
                    Your personalized profile dashboard is being built. Soon you'll have:
                </Text>
                <View style={styles.featureList}>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        ⚙️ Accessibility and preference settings
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        📊 Focus session statistics and insights
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        🎨 Theme and appearance customization
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        🏆 Achievement badges and milestones
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
    },
    comingSoon: {
        margin: 20,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    comingSoonTitle: {
        marginBottom: 12,
    },
    comingSoonText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    featureList: {
        alignSelf: 'stretch',
    },
    feature: {
        marginBottom: 8,
        paddingLeft: 8,
    },
});

export default ProfileScreen;
