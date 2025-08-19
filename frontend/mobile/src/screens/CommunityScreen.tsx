/**
 * 🌟💎⚡ Community Screen - Neurodivergent Support Network ⚡💎🌟
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const CommunityScreen: React.FC = () => {
    const { colors, typography } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }, typography.title]}>
                    🌟 HYPERFOCUS Community
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
                    Connect with neurodivergent creators and supportive community
                </Text>
            </View>

            <View style={[styles.comingSoon, { backgroundColor: colors.surface }]}>
                <Text style={[styles.comingSoonTitle, { color: colors.primary }, typography.headline]}>
                    🚀 Coming Soon!
                </Text>
                <Text style={[styles.comingSoonText, { color: colors.text }, typography.body]}>
                    The HYPERFOCUS Community hub is under active development. Soon you'll be able to:
                </Text>
                <View style={styles.featureList}>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        💬 Connect with fellow neurodivergent creators
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        🤝 Find accountability partners and work buddies
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        🎯 Join focus sessions and body doubling events
                    </Text>
                    <Text style={[styles.feature, { color: colors.text }, typography.body]}>
                        🌱 Share tips and strategies that work for you
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

export default CommunityScreen;
