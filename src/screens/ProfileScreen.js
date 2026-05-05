// src/screens/ProfileScreen.js
// Shows the user's profile, leave balance, and app settings.
// Sign out navigates back to the Welcome/Auth screen.

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    StatusBar,
    Switch,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { colors, spacing, radius } from '../theme';

const LEAVE_STATS = [
    { value: '20', color: colors.primary, label: 'Total' },
    { value: '5', color: colors.publicHoliday, label: 'Used' },
    { value: '15', color: colors.primaryMid, label: 'Left' },
];

export default function ProfileScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    function handleSignOut() {
        Alert.alert(
            'Sign out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign out',
                    style: 'destructive',
                    onPress: () => navigation.replace('Auth', { mode: 'login' }),
                },
            ]
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            {/* Upgraded Teal profile header */}
            <View style={[styles.profileHeader, { paddingTop: insets.top + 10 }]}>
                <View style={styles.profileRow}>
                    <Avatar name="Sofía Morales" size={54} color="rgba(255,255,255,0.2)" />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.profileName}>Khairul Rizma</Text>
                        <Text style={styles.profileRole}>Sr Technical Support Engineer· InsiderOne</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => Alert.alert('Edit profile', 'Opens inline edit for name and role.')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Leave balance card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.sectionLabel}>LEAVE BALANCE 2026</Text>
                    <View style={styles.statsRow}>
                        {LEAVE_STATS.map((s) => (
                            <View key={s.label} style={styles.statBox}>
                                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                            </View>
                        ))}
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: '25%' }]} />
                    </View>
                    <Text style={styles.progressNote}>5 of 20 annual days used</Text>
                </View>

                {/* Settings: Notifications */}
                <Text style={styles.groupLabel}>NOTIFICATIONS</Text>
                <View style={styles.settingsGroup}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingIcon}>🔔</Text>
                        <Text style={styles.settingLabel}>Push notifications</Text>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: '#E0E5E9', true: colors.primary }}
                            thumbColor={colors.white}
                        />
                    </View>
                    <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.settingIcon}>📧</Text>
                        <Text style={styles.settingLabel}>Email digest</Text>
                        <Text style={styles.settingRight}>Daily</Text>
                    </View>
                </View>

                {/* Settings: Team */}
                <Text style={styles.groupLabel}>TEAM</Text>
                <View style={styles.settingsGroup}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => Alert.alert('Manage team', 'Opens team management screen.')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.settingIcon}>◉</Text>
                        <Text style={styles.settingLabel}>Manage team</Text>
                        <Text style={styles.settingRight}>8 members →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.settingRow, { borderBottomWidth: 0 }]}
                        onPress={() => Alert.alert('Invite', 'Opens invite teammate flow.')}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.settingIcon}>⊕</Text>
                        <Text style={styles.settingLabel}>Invite teammates</Text>
                        <Text style={styles.settingRight}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Settings: Account */}
                <Text style={styles.groupLabel}>ACCOUNT</Text>
                <View style={styles.settingsGroup}>
                    <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
                        <Text style={styles.settingIcon}>⚙</Text>
                        <Text style={styles.settingLabel}>Preferences</Text>
                        <Text style={styles.settingRight}>→</Text>
                    </TouchableOpacity>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingIcon}>◐</Text>
                        <Text style={styles.settingLabel}>Dark mode</Text>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: '#E0E5E9', true: colors.primary }}
                            thumbColor={colors.white}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.settingRow, { borderBottomWidth: 0 }]}
                        onPress={handleSignOut}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.settingIcon}>⊖</Text>
                        <Text style={[styles.settingLabel, { color: colors.error, fontWeight: '600' }]}>Sign out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },

    profileHeader: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing?.lg || 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    profileRow: { flexDirection: 'row', alignItems: 'center' },
    profileName: { fontSize: 22, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
    profileRole: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 4 },
    editBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    editBtnText: { fontSize: 11, fontWeight: '700', color: colors.white },

    scrollContent: { paddingHorizontal: spacing?.md || 16, paddingBottom: 40, paddingTop: 15 },

    // Balance card
    balanceCard: {
        backgroundColor: colors.white,
        borderRadius: radius?.lg || 16,
        padding: spacing?.md || 16,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#A0AAB2',
        letterSpacing: 0.8,
        marginBottom: 12,
    },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    statBox: {
        flex: 1,
        backgroundColor: '#F5FAF7',
        borderRadius: radius.md,
        paddingVertical: 12,
        alignItems: 'center',
    },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 10, color: '#888', fontWeight: '500', marginTop: 2 },
    progressBg: {
        height: 6,
        backgroundColor: '#E0E5E9',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
    progressNote: { fontSize: 11, color: '#888', fontWeight: '500' },

    // Settings groups
    groupLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#A0AAB2',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 6,
        paddingHorizontal: 4,
    },
    settingsGroup: {
        backgroundColor: colors.white,
        borderRadius: radius?.lg || 16,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F2',
        gap: 12,
    },
    settingIcon: { fontSize: 16, width: 24, textAlign: 'center' },
    settingLabel: { flex: 1, fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
    settingRight: { fontSize: 12, color: '#A0AAB2', fontWeight: '500' },
});