/**
 * 🎨💎⚡ Theme Context - ADHD-Friendly Visual Design ⚡💎🎨
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export interface Theme {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    border: string;
}

const lightTheme: Theme = {
    background: '#f8f9fa',
    surface: '#ffffff',
    primary: '#6c5ce7',
    secondary: '#00b894',
    text: '#2d3436',
    textSecondary: '#636e72',
    accent: '#fd79a8',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e17055',
    border: '#ddd',
};

const darkTheme: Theme = {
    background: '#1a1a2e',
    surface: '#16213e',
    primary: '#6c5ce7',
    secondary: '#00b894',
    text: '#ffffff',
    textSecondary: '#b2bec3',
    accent: '#fd79a8',
    success: '#00b894',
    warning: '#fdcb6e',
    error: '#e17055',
    border: '#2d3748',
};

const highContrastTheme: Theme = {
    background: '#000000',
    surface: '#1a1a1a',
    primary: '#00ff00',
    secondary: '#00ffff',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#ffff00',
    success: '#00ff00',
    warning: '#ffaa00',
    error: '#ff0000',
    border: '#ffffff',
};

export interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    isHighContrast: boolean;
    toggleTheme: () => void;
    setHighContrast: (enabled: boolean) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    isDark: false,
    isHighContrast: false,
    toggleTheme: () => { },
    setHighContrast: () => { },
    fontSize: 16,
    setFontSize: () => { },
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [isHighContrast, setIsHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState(16);

    const getTheme = (): Theme => {
        if (isHighContrast) return highContrastTheme;
        return isDark ? darkTheme : lightTheme;
    };

    useEffect(() => {
        loadThemePreferences();

        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (colorScheme) {
                setIsDark(colorScheme === 'dark');
            }
        });

        return () => subscription?.remove();
    }, []);

    const loadThemePreferences = async () => {
        try {
            const [savedTheme, savedContrast, savedFontSize] = await Promise.all([
                AsyncStorage.getItem('isDark'),
                AsyncStorage.getItem('isHighContrast'),
                AsyncStorage.getItem('fontSize'),
            ]);

            if (savedTheme !== null) {
                setIsDark(JSON.parse(savedTheme));
            } else {
                // Use system preference
                const systemTheme = Appearance.getColorScheme();
                setIsDark(systemTheme === 'dark');
            }

            if (savedContrast !== null) {
                setIsHighContrast(JSON.parse(savedContrast));
            }

            if (savedFontSize !== null) {
                setFontSize(parseInt(savedFontSize, 10));
            }
        } catch (error) {
            console.error('Error loading theme preferences:', error);
        }
    };

    const toggleTheme = async () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        try {
            await AsyncStorage.setItem('isDark', JSON.stringify(newIsDark));
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const setHighContrastEnabled = async (enabled: boolean) => {
        setIsHighContrast(enabled);

        try {
            await AsyncStorage.setItem('isHighContrast', JSON.stringify(enabled));
        } catch (error) {
            console.error('Error saving contrast preference:', error);
        }
    };

    const updateFontSize = async (size: number) => {
        setFontSize(size);

        try {
            await AsyncStorage.setItem('fontSize', size.toString());
        } catch (error) {
            console.error('Error saving font size preference:', error);
        }
    };

    const contextValue: ThemeContextType = {
        theme: getTheme(),
        isDark,
        isHighContrast,
        toggleTheme,
        setHighContrast: setHighContrastEnabled,
        fontSize,
        setFontSize: updateFontSize,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return {
        colors: context.theme,
        typography: {
            display: { fontSize: context.fontSize + 8, fontWeight: 'bold' },
            title: { fontSize: context.fontSize + 4, fontWeight: 'bold' },
            headline: { fontSize: context.fontSize + 2, fontWeight: '600' },
            subtitle: { fontSize: context.fontSize, fontWeight: '600' },
            body: { fontSize: context.fontSize },
            caption: { fontSize: context.fontSize - 2 },
        },
        isDark: context.isDark,
        isHighContrast: context.isHighContrast,
        toggleTheme: context.toggleTheme,
        setHighContrast: context.setHighContrast,
        fontSize: context.fontSize,
        setFontSize: context.setFontSize,
    };
};
