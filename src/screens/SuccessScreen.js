// // src/screens/SuccessScreen.js
// // Shown after a leave submission succeeds.
// // Auto-navigates to Home after 5 seconds, or the user can tap a button.

// import React, { useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
// import { colors, spacing, radius } from '../theme';

// export default function SuccessScreen({ navigation, route }) {
//     const { leaveType = 'Annual leave', fromDate = 'Mon, 5 May', duration = '1 day' } =
//         route?.params || {};

//     // Auto-dismiss after 5 seconds
//     useEffect(() => {
//         const timer = setTimeout(() => navigation.replace('MainTabs'), 5000);
//         return () => clearTimeout(timer);
//     }, [navigation]);

//     const SUMMARY_ROWS = [
//         { label: 'Type', value: leaveType },
//         { label: 'From', value: fromDate },
//         { label: 'Duration', value: duration },
//         { label: 'Notified', value: '8 teammates' },
//     ];

//     return (
//         <View style={styles.container}>
//             <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

//             {/* Big checkmark */}
//             <View style={styles.iconCircle}>
//                 <Text style={styles.checkmark}>✓</Text>
//             </View>

//             <Text style={styles.title}>Leave logged!</Text>
//             <Text style={styles.subtitle}>Your team has been notified.</Text>

//             {/* Leave summary card */}
//             <View style={styles.summaryCard}>
//                 <Text style={styles.summaryLabel}>LEAVE SUMMARY</Text>
//                 {SUMMARY_ROWS.map(({ label, value }) => (
//                     <View key={label} style={styles.summaryRow}>
//                         <Text style={styles.summaryKey}>{label}</Text>
//                         <Text style={styles.summaryValue}>{value}</Text>
//                     </View>
//                 ))}
//             </View>

//             {/* CTAs */}
//             <TouchableOpacity
//                 style={styles.primaryBtn}
//                 onPress={() => navigation.replace('MainTabs')}
//                 activeOpacity={0.85}
//             >
//                 <Text style={styles.primaryBtnText}>Back to home</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//                 style={styles.secondaryBtn}
//                 onPress={() => navigation.replace('MainTabs', { screen: 'Profile' })}
//             >
//                 <Text style={styles.secondaryBtnText}>View my leaves</Text>
//             </TouchableOpacity>

//             <Text style={styles.autodismiss}>Auto-returning to home in 5 seconds…</Text>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: colors.white,
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: spacing.xl,
//     },
//     iconCircle: {
//         width: 72,
//         height: 72,
//         borderRadius: 36,
//         backgroundColor: colors.primaryLight,
//         borderWidth: 2.5,
//         borderColor: colors.primary,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 16,
//     },
//     checkmark: { fontSize: 28, color: colors.primary, fontWeight: '700' },
//     title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 5 },
//     subtitle: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },

//     summaryCard: {
//         backgroundColor: colors.primaryLight,
//         borderRadius: radius.lg,
//         padding: 14,
//         width: '100%',
//         marginBottom: 22,
//         borderWidth: 0.5,
//         borderColor: 'rgba(13,107,78,0.25)',
//     },
//     summaryLabel: {
//         fontSize: 9,
//         fontWeight: '600',
//         color: '#AAA',
//         letterSpacing: 0.8,
//         marginBottom: 10,
//     },
//     summaryRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: 6,
//         borderBottomWidth: 0.5,
//         borderBottomColor: 'rgba(13,107,78,0.12)',
//     },
//     summaryKey: { fontSize: 10, color: '#AAA' },
//     summaryValue: { fontSize: 10, fontWeight: '600', color: colors.primary },

//     primaryBtn: {
//         backgroundColor: colors.primary,
//         borderRadius: radius.md,
//         paddingVertical: 14,
//         alignItems: 'center',
//         width: '100%',
//         marginBottom: 10,
//     },
//     primaryBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },

//     secondaryBtn: {
//         borderWidth: 1,
//         borderColor: '#DDD',
//         borderRadius: radius.md,
//         paddingVertical: 13,
//         alignItems: 'center',
//         width: '100%',
//         marginBottom: 16,
//     },
//     secondaryBtnText: { fontSize: 12, fontWeight: '500', color: '#666' },

//     autodismiss: { fontSize: 10, color: '#CCC' },
// });



// src/screens/SuccessScreen.js
// Shown after a leave submission succeeds.
// Auto-navigates to Home after 5 seconds, bringing the new data with it.

import { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../theme';

export default function SuccessScreen({ navigation, route }) {
    // Extract the newLeave object and formatting data passed from LogLeaveScreen
    const {
        newLeave,
        leaveType = 'Annual leave',
        fromDate = 'Mon, 5 May',
        duration = '1 day',
        team = 'Team'
    } = route?.params || {};

    function returnHome() {
        // Navigate to the Tab Navigator, specifically the Home tab, passing our newLeave object!
        navigation.navigate('MainTabs', {
            screen: 'Home',
            params: { newLeave: newLeave }
        });
    }

    // Auto-dismiss after 5 seconds and trigger returnHome
    useEffect(() => {
        const timer = setTimeout(() => returnHome(), 5000);
        return () => clearTimeout(timer);
    }, [navigation, newLeave]);

    const SUMMARY_ROWS = [
        { label: 'Type', value: leaveType },
        { label: 'From', value: fromDate },
        { label: 'Duration', value: duration },
        { label: 'Notified', value: `${team} squad` },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Big premium checkmark */}
            <View style={styles.iconCircle}>
                <Text style={styles.checkmark}>✓</Text>
            </View>

            <Text style={styles.title}>Leave logged!</Text>
            <Text style={styles.subtitle}>Your team has been notified.</Text>

            {/* Elevated leave summary card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>LEAVE SUMMARY</Text>
                {SUMMARY_ROWS.map(({ label, value }, index) => (
                    <View key={label} style={[styles.summaryRow, index === SUMMARY_ROWS.length - 1 && { borderBottomWidth: 0 }]}>
                        <Text style={styles.summaryKey}>{label}</Text>
                        <Text style={styles.summaryValue}>{value}</Text>
                    </View>
                ))}
            </View>

            {/* CTAs */}
            <TouchableOpacity
                style={styles.primaryBtn}
                onPress={returnHome}
                activeOpacity={0.85}
            >
                <Text style={styles.primaryBtnText}>Back to home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
                activeOpacity={0.6}
            >
                <Text style={styles.secondaryBtnText}>View my leaves</Text>
            </TouchableOpacity>

            <Text style={styles.autodismiss}>Auto-returning to home in 5 seconds…</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E1F5EE', // primaryLight
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    checkmark: { fontSize: 36, color: colors.primary, fontWeight: '800' },
    title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 6, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: '#A0AAB2', fontWeight: '500', textAlign: 'center', marginBottom: 30 },

    summaryCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        width: '100%',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#A0AAB2',
        letterSpacing: 0.8,
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F2',
    },
    summaryKey: { fontSize: 13, color: '#888', fontWeight: '500' },
    summaryValue: { fontSize: 13, fontWeight: '700', color: '#1A1A1A' },

    primaryBtn: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        width: '100%',
        marginBottom: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryBtnText: { fontSize: 15, fontWeight: '800', color: colors.white },

    secondaryBtn: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E0E5E9',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    secondaryBtnText: { fontSize: 14, fontWeight: '700', color: '#555' },

    autodismiss: { fontSize: 12, color: '#A0AAB2', fontWeight: '500' },
});