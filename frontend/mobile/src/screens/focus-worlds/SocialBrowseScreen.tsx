/**
 * 🌟💬⚡ Social Browse Screen - Community Interaction Mode ⚡💬🌟
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const SocialBrowseScreen: React.FC = () => {
    const { colors, typography } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }, typography.title]}>
                    🌟 Social Browse Mode
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
                    Gentle community browsing for when you need social connection
                </Text>
            </View>

            <View style={[styles.comingSoon, { backgroundColor: colors.surface }]}>
                <Text style={[styles.comingSoonTitle, { color: colors.primary }, typography.headline]}>
                    💬 Coming Soon!
                </Text>
                <Text style={[styles.comingSoonText, { color: colors.text }, typography.body]}>
                    Social Browse mode is being designed for neurodivergent-friendly community interaction:
                </Text>
                <View style={styles.featureList}>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        🔍 ADHD-optimized content discovery
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        ⚡ Energy-aware interaction suggestions
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        🛡️ Safe space indicators and filtering
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        💎 Interest-based content curation
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

export default SocialBrowseScreen;
