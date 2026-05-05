// App.js
import { registerRootComponent } from 'expo';
import React from 'react';
import { StatusBar, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- Import all screens ---
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';

// Tab screens
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import TeamScreen from './src/screens/TeamScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Stack-only screens (no tab bar)
import LogLeaveScreen from './src/screens/LogLeaveScreen';
import LeaveDetailScreen from './src/screens/LeaveDetailScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import ErrorScreen from './src/screens/ErrorScreen';

import { colors } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Tab icons (emoji, no extra library needed) ---
const TAB_ICONS = {
    Home: '⌂',
    Calendar: '▦',
    Team: '◉',
    Profile: '◎',
};

// --- Bottom Tab Navigator (the main 4-tab shell) ---
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 0.5,
                    borderTopColor: '#E8E8E8',
                    // Adjust height and padding dynamically based on the device platform
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: '#AAAAAA',
                tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 4 },
                tabBarIcon: ({ color }) => {
                    // Properly render the emoji as the icon
                    const iconSymbol = TAB_ICONS[route.name];
                    return <Text style={{ color: color, fontSize: 20 }}>{iconSymbol}</Text>;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{ tabBarLabel: 'Calendar' }}
            />
            <Tab.Screen
                name="Team"
                component={TeamScreen}
                options={{ tabBarLabel: 'Team' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

// --- Root Stack Navigator ---
export default function App() {
    return (
        <NavigationContainer>
            <StatusBar barStyle="dark-content" />
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false, animation: 'fade' }}
            >
                {/* Onboarding flow */}
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Auth" component={AuthScreen} />

                {/* Main app — tab shell */}
                <Stack.Screen name="MainTabs" component={MainTabs} />

                {/* Screens that slide over the tab bar */}
                <Stack.Screen
                    name="LogLeave"
                    component={LogLeaveScreen}
                    options={{ animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                    name="LeaveDetail"
                    component={LeaveDetailScreen}
                    options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ animation: 'slide_from_right' }}
                />

                {/* State screens */}
                <Stack.Screen
                    name="Success"
                    component={SuccessScreen}
                    options={{ animation: 'fade', gestureEnabled: false }}
                />
                <Stack.Screen
                    name="Error"
                    component={ErrorScreen}
                    options={{ animation: 'fade' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

registerRootComponent(App);