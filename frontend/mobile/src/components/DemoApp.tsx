/**
 * 🎯💎⚡ Complete Backend Integration Demo App ⚡💎🎯
 *
 * This is a complete demo app showing all backend integration features
 * Perfect for testing and development
 */

import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { RealTimeProvider } from '../contexts/RealTimeContext';
import BackendIntegrationExample from './BackendIntegrationExample';
import EnhancedFocusTimer from './EnhancedFocusTimer';
import IntegrationExamples from './IntegrationExamples';
import QuickIntegrationTest from './QuickIntegrationTest';

type DemoPage = 'menu' | 'test' | 'examples' | 'focus' | 'integration';

const DemoApp: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<DemoPage>('menu');

    const renderMenu = () => (
        <View style={styles.menuContainer}>
            <Text style={styles.title}>🚀 HyperFocus Zone Backend Demo</Text>
            <Text style={styles.subtitle}>Choose a demo to explore:</Text>

            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentPage('test')}
            >
                <Text style={styles.menuButtonText}>🧪 Quick Integration Test</Text>
                <Text style={styles.menuButtonDesc}>Test auth, sockets, and basic features</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentPage('integration')}
            >
                <Text style={styles.menuButtonText}>🔗 Full Integration Example</Text>
                <Text style={styles.menuButtonDesc}>Complete backend integration demo</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentPage('focus')}
            >
                <Text style={styles.menuButtonText}>🎯 Enhanced Focus Timer</Text>
                <Text style={styles.menuButtonDesc}>Real-time focus sessions with flow state</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setCurrentPage('examples')}
            >
                <Text style={styles.menuButtonText}>⚡ Component Examples</Text>
                <Text style={styles.menuButtonDesc}>How to integrate existing components</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>🔧 Setup Requirements:</Text>
                <Text style={styles.infoText}>1. Backend API running on localhost:3001</Text>
                <Text style={styles.infoText}>2. Environment variables configured</Text>
                <Text style={styles.infoText}>3. Dependencies installed (npm install)</Text>
                <Text style={styles.infoText}>4. Demo user: test@hyperfocus.zone</Text>
            </View>
        </View>
    );

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'test':
                return <QuickIntegrationTest />;
            case 'integration':
                return <BackendIntegrationExample onClose={() => setCurrentPage('menu')} />;
            case 'focus':
                return <EnhancedFocusTimer spaceId="demo-space" />;
            case 'examples':
                return <IntegrationExamples />;
            default:
                return renderMenu();
        }
    };

    return (
        <AuthProvider>
            <RealTimeProvider>
                <SafeAreaView style={styles.container}>
                    {currentPage !== 'menu' && (
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setCurrentPage('menu')}
                            >
                                <Text style={styles.backButtonText}>← Back to Menu</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <ScrollView style={styles.content}>
                        {renderCurrentPage()}
                    </ScrollView>
                </SafeAreaView>
            </RealTimeProvider>
        </AuthProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        backgroundColor: '#16213e',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#0f3460',
    },
    backButton: {
        backgroundColor: '#e94560',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    menuContainer: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#cccccc',
        textAlign: 'center',
        marginBottom: 30,
    },
    menuButton: {
        backgroundColor: '#16213e',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#e94560',
    },
    menuButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    menuButtonDesc: {
        color: '#cccccc',
        fontSize: 14,
    },
    infoContainer: {
        backgroundColor: '#0f3460',
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
    },
    infoTitle: {
        color: '#e94560',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoText: {
        color: '#ffffff',
        fontSize: 14,
        marginBottom: 5,
    },
});

export default DemoApp;
