/**
 * 🧪💎⚡ Quick Integration Test Component ⚡💎🧪
 *
 * Quick test for backend authentication and real-time features
 */

import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useBackendIntegration } from '../hooks/useBackendIntegration';

const QuickIntegrationTest: React.FC = () => {
    const {
        isConnected,
        isAuthenticated,
        login,
        logout,
        spaces,
        realTime,
        showSuccess,
        showError,
    } = useBackendIntegration();

    const [testResults, setTestResults] = useState<string[]>([]);
    const [currentTest, setCurrentTest] = useState<string>('');
    const [testProgress, setTestProgress] = useState<number>(0);
    const [totalTests, setTotalTests] = useState<number>(4);

    const addResult = (result: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };

    const updateProgress = (current: number, total: number, testName: string) => {
        setTestProgress(current);
        setTotalTests(total);
        setCurrentTest(testName);
    };

    const testAuthentication = async () => {
        addResult('🔐 Testing authentication...');
        try {
            const success = await login('test@hyperfocus.zone', 'testpassword123', true);
            if (success) {
                addResult('✅ Authentication SUCCESS');
                showSuccess('Login successful!');
            } else {
                addResult('❌ Authentication FAILED');
                showError('Login failed');
            }
        } catch (error) {
            addResult(`❌ Auth Error: ${error}`);
        }
    };

    const testSocketConnection = () => {
        addResult('🔌 Testing Socket.IO connection...');
        if (isConnected) {
            addResult('✅ Socket.IO connected');
            showSuccess('Real-time connection active!');
        } else {
            addResult('❌ Socket.IO not connected');
            showError('Connection issue');
        }
    };

    const testFocusSession = async () => {
        addResult('🎯 Testing focus session...');
        try {
            await realTime.startFocusSession('pomodoro', 25 * 60 * 1000, 'test-space');
            addResult('✅ Focus session started');
            showSuccess('Pomodoro timer started!');
        } catch (error) {
            addResult(`❌ Focus session error: ${error}`);
        }
    };

    const testSpacesLoad = async () => {
        addResult('🌟 Testing spaces load...');
        try {
            await spaces.fetch();
            addResult(`✅ Loaded ${spaces.list.length} spaces`);
            showSuccess('Spaces loaded successfully!');
        } catch (error) {
            addResult(`❌ Spaces error: ${error}`);
        }
    };

    const runAllTests = async () => {
        setTestResults([]);
        setTestProgress(0);
        addResult('🚀 Starting comprehensive backend integration test...');

        // Test sequence with progress tracking
        updateProgress(1, 4, 'Socket Connection');
        testSocketConnection();
        await new Promise(resolve => setTimeout(resolve, 1000));

        updateProgress(2, 4, 'Authentication');
        await testAuthentication();
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isAuthenticated) {
            updateProgress(3, 4, 'Spaces Management');
            await testSpacesLoad();
            await new Promise(resolve => setTimeout(resolve, 1000));

            updateProgress(4, 4, 'Focus Sessions');
            await testFocusSession();
        }

        updateProgress(4, 4, 'Complete');
        setCurrentTest('🎉 All tests complete!');
        addResult('🎉 Test sequence complete!');
    }; useEffect(() => {
        addResult('🔗 Backend Integration Test loaded');
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🧪 Backend Integration Test</Text>

            {/* Connection Status */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Connection Status:</Text>
                <Text style={[styles.statusValue, { color: isConnected ? '#4ade80' : '#ef4444' }]}>
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </Text>
            </View>

            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Authentication:</Text>
                <Text style={[styles.statusValue, { color: isAuthenticated ? '#4ade80' : '#ef4444' }]}>
                    {isAuthenticated ? '🔐 Authenticated' : '🔒 Not Authenticated'}
                </Text>
            </View>

            {/* Progress Indicator */}
            {testProgress > 0 && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressTitle}>🧪 Test Progress</Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(testProgress / totalTests) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {testProgress}/{totalTests} - {currentTest}
                    </Text>
                </View>
            )}

            {/* Test Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={runAllTests}>
                    <Text style={styles.buttonText}>🚀 Run All Tests</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={testAuthentication}>
                    <Text style={styles.buttonText}>🔐 Test Auth</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={testSocketConnection}>
                    <Text style={styles.buttonText}>🔌 Test Socket</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={testFocusSession}>
                    <Text style={styles.buttonText}>🎯 Test Focus</Text>
                </TouchableOpacity>

                {isAuthenticated && (
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <Text style={styles.buttonText}>🔓 Logout</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}
            <ScrollView style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>📊 Test Results:</Text>
                {testResults.map((result, index) => (
                    <Text key={index} style={styles.resultText}>
                        {result}
                    </Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1a1a2e',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 20,
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#16213e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    statusLabel: {
        fontSize: 16,
        color: '#e94560',
        fontWeight: '600',
    },
    statusValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginVertical: 20,
    },
    primaryButton: {
        backgroundColor: '#e94560',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    secondaryButton: {
        backgroundColor: '#0f3460',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        flex: 1,
        backgroundColor: '#16213e',
        borderRadius: 10,
        padding: 15,
        maxHeight: 300,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#e94560',
        marginBottom: 10,
    },
    resultText: {
        color: '#ffffff',
        fontSize: 14,
        marginBottom: 5,
        fontFamily: 'monospace',
    },
    progressContainer: {
        backgroundColor: '#16213e',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e94560',
        marginBottom: 10,
        textAlign: 'center',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#0f3460',
        borderRadius: 4,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4ade80',
        borderRadius: 4,
    },
    progressText: {
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default QuickIntegrationTest;
