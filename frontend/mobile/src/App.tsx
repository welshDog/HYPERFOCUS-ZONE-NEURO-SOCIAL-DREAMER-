/**
 * 🧠💎⚡ ADHD-Optimized Main App Component ⚡💎🧠
 *
 * Features:
 * - Focus Worlds (Deep Work + Social Browse)
 * - Interest Hyperspaces
 * - Neurodivergent-first navigation
 * - Accessibility excellence
 */

import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoadingScreen from './components/LoadingScreen';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { FocusWorldProvider } from './contexts/FocusWorldContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainNavigator from './navigation/MainNavigator';

const App: React.FC = () => {
    const [isReady, setIsReady] = useState(false);
    const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check accessibility settings
                const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
                setAccessibilityEnabled(screenReaderEnabled);

                // Initialize app (preload critical data, check backend connectivity)
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate initialization

                setIsReady(true);
            } catch (error) {
                console.error('App initialization error:', error);
                setIsReady(true); // Continue even if there's an error
            }
        };

        initializeApp();
    }, []);

    if (!isReady) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AccessibilityProvider initialAccessibilityEnabled={accessibilityEnabled}>
                    <FocusWorldProvider>
                        <NavigationContainer>
                            <StatusBar
                                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                                backgroundColor="#1a1a2e"
                            />
                            <MainNavigator />
                        </NavigationContainer>
                    </FocusWorldProvider>
                </AccessibilityProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default App;
