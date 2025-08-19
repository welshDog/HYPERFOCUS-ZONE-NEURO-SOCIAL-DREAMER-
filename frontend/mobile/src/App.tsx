/**
 * 🧠💎⚡ ADHD-Optimized Main App Component ⚡💎🧠
 *
 * Features:
 * - Focus Worlds (Deep Work + Social Browse)
 * - Interest Hyperspaces
 * - Real-time Backend Integration
 * - Neurodivergent-first navigation
 * - Accessibility excellence
 */

import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DemoApp from './components/DemoApp';
import LoadingScreen from './components/LoadingScreen';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AuthProvider } from './contexts/AuthContext';
import { FocusWorldProvider } from './contexts/FocusWorldContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainNavigator from './navigation/MainNavigator';

const App: React.FC = () => {
    const [isReady, setIsReady] = useState(false);
    const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
    // 🧪 Demo mode for backend integration testing
    const [demoMode, setDemoMode] = useState(true); // Set to false for main app

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check accessibility settings
                const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
                setAccessibilityEnabled(screenReaderEnabled);

                // Initialize app (preload critical data, check backend connectivity)
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate initialization

                console.log('🚀 HyperFocus Zone initialized with backend integration!');
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

    // 🧪 Demo Mode: Return the backend integration demo
    if (demoMode) {
        return (
            <SafeAreaProvider>
                <ThemeProvider>
                    <AccessibilityProvider initialAccessibilityEnabled={accessibilityEnabled}>
                        <StatusBar
                            barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                            backgroundColor="#1a1a2e"
                        />
                        <DemoApp />
                    </AccessibilityProvider>
                </ThemeProvider>
            </SafeAreaProvider>
        );
    }

    // 🚀 Main App Mode: Return the full navigation system
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AccessibilityProvider initialAccessibilityEnabled={accessibilityEnabled}>
                    <AuthProvider>
                        <RealTimeProvider>
                            <FocusWorldProvider>
                                <NavigationContainer>
                                    <StatusBar
                                        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                                        backgroundColor="#1a1a2e"
                                    />
                                    <MainNavigator />
                                </NavigationContainer>
                            </FocusWorldProvider>
                        </RealTimeProvider>
                    </AuthProvider>
                </AccessibilityProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default App;
