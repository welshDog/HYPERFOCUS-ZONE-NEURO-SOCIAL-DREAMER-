/**
 * 🌟💎⚡ HyperFocus Zone Neuro Social Dreamer - Mobile App Entry Point ⚡💎🌟
 *
 * ADHD-Optimized React Native Application
 * Features: Focus Worlds, Interest Hyperspaces, Neurodivergent-Safe Social Platform
 */

import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { name as appName } from './package.json';
import App from './src/App';

const AppWrapper = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <App />
        </GestureHandlerRootView>
    );
};

AppRegistry.registerComponent(appName, () => AppWrapper);
