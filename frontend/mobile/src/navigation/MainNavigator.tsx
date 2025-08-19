/**
 * 🎯💎⚡ ADHD-Optimized Main Navigator ⚡💎🎯
 *
 * Features:
 * - Single-tap focus navigation
 * - Minimal cognitive load
 * - Quick mode switching between Focus Worlds
 * - Accessible navigation with haptic feedback
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Platform } from 'react-native';
import HapticFeedback from 'react-native-haptic-feedback';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import CommunityScreen from '../screens/CommunityScreen';
import FocusWorldsScreen from '../screens/FocusWorldsScreen';
import InterestHyperspacesScreen from '../screens/InterestHyperspacesScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Focus World specific screens
import DeepWorkScreen from '../screens/focus-worlds/DeepWorkScreen';
import SocialBrowseScreen from '../screens/focus-worlds/SocialBrowseScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const FocusWorldStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animationEnabled: true,
            }}>
            <Stack.Screen name="FocusWorldsMain" component={FocusWorldsScreen} />
            <Stack.Screen name="DeepWork" component={DeepWorkScreen} />
            <Stack.Screen name="SocialBrowse" component={SocialBrowseScreen} />
        </Stack.Navigator>
    );
};

const MainNavigator: React.FC = () => {
    const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    };

    const handleTabPress = () => {
        HapticFeedback.trigger('impactLight', hapticOptions);
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'FocusWorlds':
                            iconName = focused ? 'brain' : 'brain-outline';
                            break;
                        case 'Hyperspaces':
                            iconName = focused ? 'rocket' : 'rocket-outline';
                            break;
                        case 'Community':
                            iconName = focused ? 'account-group' : 'account-group-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'account-circle' : 'account-circle-outline';
                            break;
                        default:
                            iconName = 'help-circle-outline';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#6c5ce7',
                tabBarInactiveTintColor: '#a0a0a0',
                tabBarStyle: {
                    backgroundColor: '#1a1a2e',
                    borderTopColor: '#16213e',
                    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
                    height: Platform.OS === 'ios' ? 85 : 65,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: -5,
                },
                headerShown: false,
                tabBarAccessibilityLabel: `${route.name} tab`,
            })}
            screenListeners={{
                tabPress: handleTabPress,
            }}>
            <Tab.Screen
                name="FocusWorlds"
                component={FocusWorldStack}
                options={{
                    tabBarLabel: '🎯 Focus',
                    tabBarAccessibilityHint: 'Navigate to Focus Worlds for deep work and social browsing',
                }}
            />
            <Tab.Screen
                name="Hyperspaces"
                component={InterestHyperspacesScreen}
                options={{
                    tabBarLabel: '⚡ Interests',
                    tabBarAccessibilityHint: 'Explore Interest Hyperspaces for special interests and communities',
                }}
            />
            <Tab.Screen
                name="Community"
                component={CommunityScreen}
                options={{
                    tabBarLabel: '🤝 Community',
                    tabBarAccessibilityHint: 'Connect with the neurodivergent community and support networks',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: '👤 Profile',
                    tabBarAccessibilityHint: 'View and edit your profile and settings',
                }}
            />
        </Tab.Navigator>
    );
};

export default MainNavigator;
