/**
 * ♿💎⚡ Accessibility Context - Inclusive Design Excellence ⚡💎♿
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export interface AccessibilityContextType {
    screenReaderEnabled: boolean;
    reduceMotion: boolean;
    setReduceMotion: (enabled: boolean) => void;
    largeText: boolean;
    setLargeText: (enabled: boolean) => void;
    highContrast: boolean;
    setHighContrast: (enabled: boolean) => void;
    voiceOverEnabled: boolean;
    announceToScreenReader: (message: string) => void;
    // Additional properties expected by components
    announceForScreenReader: (message: string) => void;
    preferredDuration?: number;
}

export const AccessibilityContext = createContext<AccessibilityContextType>({
    screenReaderEnabled: false,
    reduceMotion: false,
    setReduceMotion: () => { },
    largeText: false,
    setLargeText: () => { },
    highContrast: false,
    setHighContrast: () => { },
    voiceOverEnabled: false,
    announceToScreenReader: () => { },
});

interface AccessibilityProviderProps {
    children: ReactNode;
    initialAccessibilityEnabled?: boolean;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
    children,
    initialAccessibilityEnabled = false,
}) => {
    const [screenReaderEnabled, setScreenReaderEnabled] = useState(initialAccessibilityEnabled);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [largeText, setLargeText] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [voiceOverEnabled, setVoiceOverEnabled] = useState(false);

    useEffect(() => {
        loadAccessibilityPreferences();

        // Listen for accessibility changes
        const screenReaderSubscription = AccessibilityInfo.addEventListener(
            'screenReaderChanged',
            setScreenReaderEnabled,
        );

        const announceForAccessibilitySubscription = AccessibilityInfo.addEventListener(
            'announcementFinished',
            (announcement) => {
                console.log('Screen reader announcement finished:', announcement);
            },
        );

        return () => {
            screenReaderSubscription?.remove();
            announceForAccessibilitySubscription?.remove();
        };
    }, []);

    const loadAccessibilityPreferences = async () => {
        try {
            const [
                savedReduceMotion,
                savedLargeText,
                savedHighContrast,
                screenReaderState,
            ] = await Promise.all([
                AsyncStorage.getItem('reduceMotion'),
                AsyncStorage.getItem('largeText'),
                AsyncStorage.getItem('highContrast'),
                AccessibilityInfo.isScreenReaderEnabled(),
            ]);

            setScreenReaderEnabled(screenReaderState);
            setVoiceOverEnabled(screenReaderState);

            if (savedReduceMotion !== null) {
                setReduceMotion(JSON.parse(savedReduceMotion));
            }

            if (savedLargeText !== null) {
                setLargeText(JSON.parse(savedLargeText));
            }

            if (savedHighContrast !== null) {
                setHighContrast(JSON.parse(savedHighContrast));
            }
        } catch (error) {
            console.error('Error loading accessibility preferences:', error);
        }
    };

    const updateReduceMotion = async (enabled: boolean) => {
        setReduceMotion(enabled);
        try {
            await AsyncStorage.setItem('reduceMotion', JSON.stringify(enabled));
        } catch (error) {
            console.error('Error saving reduce motion preference:', error);
        }
    };

    const updateLargeText = async (enabled: boolean) => {
        setLargeText(enabled);
        try {
            await AsyncStorage.setItem('largeText', JSON.stringify(enabled));
        } catch (error) {
            console.error('Error saving large text preference:', error);
        }
    };

    const updateHighContrast = async (enabled: boolean) => {
        setHighContrast(enabled);
        try {
            await AsyncStorage.setItem('highContrast', JSON.stringify(enabled));
        } catch (error) {
            console.error('Error saving high contrast preference:', error);
        }
    };

    const announceToScreenReader = (message: string) => {
        if (screenReaderEnabled) {
            AccessibilityInfo.announceForAccessibility(message);
        }
    };

    const contextValue: AccessibilityContextType = {
        screenReaderEnabled,
        reduceMotion,
        setReduceMotion: updateReduceMotion,
        largeText,
        setLargeText: updateLargeText,
        highContrast,
        setHighContrast: updateHighContrast,
        voiceOverEnabled,
        announceToScreenReader,
        announceForScreenReader: announceToScreenReader, // Alias for consistency
        preferredDuration: 25, // Default 25 minutes for Pomodoro
    };

    return (
        <AccessibilityContext.Provider value={contextValue}>
            {children}
        </AccessibilityContext.Provider>
    );
};

// Custom hook to use accessibility context
export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
