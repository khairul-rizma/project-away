// src/screens/ErrorScreen.js
// Shown when a network request fails.
// Reassures the user their data is safe and gives clear recovery options.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { colors, spacing, radius } from '../theme';

export default function ErrorScreen({ navigation, route }) {
    // The retry function is passed in from wherever the error occurred.
    // If none is provided, the button just goes back.
    const { onRetry } = route?.params || {};

    function handleRetry() {
        if (onRetry) {
            onRetry();
        } else {
            navigation.goBack();
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* Error icon */}
            <View style={styles.iconCircle}>
                <Text style={styles.iconText}>!</Text>
            </View>

            <Text style={styles.title}>Couldn't connect.</Text>
            <Text style={styles.body}>Check your internet connection and try again.</Text>

            {/* Data safety reassurance — the most important line on this screen */}
            <Text style={styles.reassurance}>
                We haven't lost your leave — it'll be here when you're back.
            </Text>

            {/* Primary retry CTA */}
            <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.85}>
                <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>

            {/* Secondary: go back */}
            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backBtnText}>Go back</Text>
            </TouchableOpacity>

            {/* Report link */}
            <TouchableOpacity style={styles.reportRow}>
                <Text style={styles.reportText}>
                    Something else wrong?{' '}
                    <Text style={{ color: colors.primary, fontWeight: '500' }}>Report a problem →</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconCircle: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: colors.errorLight,
        borderWidth: 2,
        borderColor: colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconText: { fontSize: 26, fontWeight: '700', color: colors.error },

    title: {
        fontSize: 21,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 6,
        textAlign: 'center',
    },
    body: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 220,
        marginBottom: 8,
    },
    reassurance: {
        fontSize: 11,
        color: colors.primary,
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: 220,
        lineHeight: 16,
        marginBottom: 28,
    },

    retryBtn: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 10,
    },
    retryBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },

    backBtn: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: radius.md,
        paddingVertical: 13,
        alignItems: 'center',
        marginBottom: 18,
    },
    backBtnText: { fontSize: 12, fontWeight: '500', color: '#555' },

    reportRow: { alignItems: 'center' },
    reportText: { fontSize: 10, color: '#CCC' },
});