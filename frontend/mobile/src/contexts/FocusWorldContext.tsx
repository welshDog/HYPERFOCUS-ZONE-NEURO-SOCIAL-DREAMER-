/**
 * 🎯💎⚡ Focus World Context - ADHD-Optimized State Management ⚡💎🎯
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

export interface FocusWorldContextType {
    currentWorld: string | null;
    setCurrentWorld: (world: string) => void;
    sessionStartTime: Date | null;
    sessionDuration: number;
    isSessionActive: boolean;
    startSession: (worldType: string) => void;
    endSession: () => void;
    sessionStats: {
        deepWorkMinutes: number;
        socialBrowseMinutes: number;
        totalSessions: number;
    };
}

export const FocusWorldContext = createContext<FocusWorldContextType>({
    currentWorld: null,
    setCurrentWorld: () => { },
    sessionStartTime: null,
    sessionDuration: 0,
    isSessionActive: false,
    startSession: () => { },
    endSession: () => { },
    sessionStats: {
        deepWorkMinutes: 0,
        socialBrowseMinutes: 0,
        totalSessions: 0,
    },
});

interface FocusWorldProviderProps {
    children: ReactNode;
}

export const FocusWorldProvider: React.FC<FocusWorldProviderProps> = ({ children }) => {
    const [currentWorld, setCurrentWorld] = useState<string | null>(null);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        deepWorkMinutes: 0,
        socialBrowseMinutes: 0,
        totalSessions: 0,
    });

    useEffect(() => {
        loadSessionStats();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isSessionActive && sessionStartTime) {
            interval = setInterval(() => {
                const duration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
                setSessionDuration(duration);
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isSessionActive, sessionStartTime]);

    const loadSessionStats = async () => {
        try {
            const stats = await AsyncStorage.getItem('focusWorldStats');
            if (stats) {
                setSessionStats(JSON.parse(stats));
            }
        } catch (error) {
            console.error('Error loading session stats:', error);
        }
    };

    const saveSessionStats = async (newStats: any) => {
        try {
            await AsyncStorage.setItem('focusWorldStats', JSON.stringify(newStats));
        } catch (error) {
            console.error('Error saving session stats:', error);
        }
    };

    const startSession = (worldType: string) => {
        setCurrentWorld(worldType);
        setSessionStartTime(new Date());
        setSessionDuration(0);
        setIsSessionActive(true);
    };

    const endSession = () => {
        if (sessionStartTime && isSessionActive) {
            const sessionLength = Math.floor((Date.now() - sessionStartTime.getTime()) / 60000); // minutes

            const newStats = {
                ...sessionStats,
                totalSessions: sessionStats.totalSessions + 1,
            };

            if (currentWorld === 'deep-work') {
                newStats.deepWorkMinutes += sessionLength;
            } else if (currentWorld === 'social-browse') {
                newStats.socialBrowseMinutes += sessionLength;
            }

            setSessionStats(newStats);
            saveSessionStats(newStats);
        }

        setIsSessionActive(false);
        setSessionStartTime(null);
        setSessionDuration(0);
    };

    const contextValue: FocusWorldContextType = {
        currentWorld,
        setCurrentWorld,
        sessionStartTime,
        sessionDuration,
        isSessionActive,
        startSession,
        endSession,
        sessionStats,
    };

    return (
        <FocusWorldContext.Provider value={contextValue}>
            {children}
        </FocusWorldContext.Provider>
    );
};
