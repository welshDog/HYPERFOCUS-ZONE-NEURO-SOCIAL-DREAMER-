/**
 * 🧠💎⚡ Deep Work Screen - Focused Work Mode ⚡💎🧠
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FocusTimer from '../../components/FocusTimer';
import { useTheme } from '../../contexts/ThemeContext';

const DeepWorkScreen: React.FC = () => {
    const { colors, typography } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }, typography.title]}>
                    🧠 Deep Work Mode
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }, typography.body]}>
                    Maximize your hyperfocus for productive work sessions
                </Text>
            </View>

            <FocusTimer />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
    },
});

export default DeepWorkScreen;
