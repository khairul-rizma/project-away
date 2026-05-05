// src/screens/SplashScreen.js
// First screen the user sees. Shows the brand for 2 seconds then moves to Onboarding.
// To change the delay: update the number in setTimeout (milliseconds).

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { colors } from '../theme';

export default function SplashScreen({ navigation }) {
    useEffect(() => {
        let mounted = true;
        const timer = setTimeout(() => {
            if (mounted) navigation.replace('Onboarding');  // guarded
        }, 3000);
        return () => {
            mounted = false;   // disarms the callback
            clearTimeout(timer);
        };
    }, []);  // ← empty: runs exactly once on the real mount

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            {/* Logo icon */}
            <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>↗</Text>
            </View>
            {/* App name */}
            <Text style={styles.appName}>away</Text>
            <Text style={styles.tagline}>Your team's leave, at a glance.</Text>
            {/* Loading dots */}
            <View style={styles.dots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
    },
    logoBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoIcon: {
        fontSize: 30,
        color: colors.white,
    },
    appName: {
        fontSize: 34,
        fontWeight: '700',
        color: colors.white,
        letterSpacing: -1.5,
    },
    tagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.65)',
    },
    dots: {
        flexDirection: 'row',
        gap: 5,
        marginTop: 20,
    },
    dot: {
        width: 6,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.35)',
    },
    dotActive: {
        width: 18,
        backgroundColor: colors.white,
    },
});