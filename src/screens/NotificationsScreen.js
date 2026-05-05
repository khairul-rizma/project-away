// src/screens/NotificationsScreen.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    LayoutAnimation,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import LeaveBadge from '../components/LeaveBadge';
import { colors, leaveTypes } from '../theme';

const INITIAL_NOTIFS = [
    {
        id: '1',
        name: 'Marcus Lee',
        type: 'annual',
        msg: 'logged 5 days Annual leave starting Monday',
        time: '8:42 AM',
        unread: true,
    },
    {
        id: '2',
        name: 'Priya Nair',
        type: 'sick',
        msg: 'is out sick today — logged this morning',
        time: '7:15 AM',
        unread: false,
    },
];

function leaveColor(type) {
    return leaveTypes[type]?.color || colors.primary;
}

export default function NotificationsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [notifs, setNotifs] = useState([]);

    const unreadCount = notifs.filter((n) => n.unread).length;

    // Fetch live notifications when the screen opens
    useFocusEffect(
        useCallback(() => {
            const fetchNotifs = async () => {
                try {
                    const saved = await AsyncStorage.getItem('@away_notifications');
                    if (saved !== null) {
                        setNotifs(JSON.parse(saved));
                    } else {
                        // Seed with initial data if empty
                        setNotifs(INITIAL_NOTIFS);
                        await AsyncStorage.setItem('@away_notifications', JSON.stringify(INITIAL_NOTIFS));
                    }
                } catch (e) {
                    console.error("Failed to load notifications", e);
                }
            };
            fetchNotifs();
        }, [])
    );

    async function saveNotifs(updatedNotifs) {
        setNotifs(updatedNotifs);
        try {
            await AsyncStorage.setItem('@away_notifications', JSON.stringify(updatedNotifs));
        } catch (e) {
            console.error("Failed to save notifications", e);
        }
    }

    function markAllRead() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const updated = notifs.map((n) => ({ ...n, unread: false }));
        saveNotifs(updated);
    }

    function markRead(id) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const updated = notifs.map((n) => (n.id === id ? { ...n, unread: false } : n));
        saveNotifs(updated);
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <View style={styles.titleRow}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount}</Text>
                        </View>
                    )}
                </View>

                {unreadCount > 0 ? (
                    <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn} activeOpacity={0.6}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.markAllSpacer} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionLabel}>LATEST</Text>

                {notifs.map((n) => (
                    <TouchableOpacity
                        key={n.id}
                        style={[
                            styles.notifCard,
                            n.unread ? styles.notifCardUnread : styles.notifCardRead,
                            n.unread && { borderLeftColor: leaveColor(n.type) }
                        ]}
                        onPress={() => markRead(n.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.avatarWrap}>
                            <Avatar name={n.name} size={42} color={leaveColor(n.type)} />
                            {n.unread && <View style={styles.unreadDot} />}
                        </View>

                        <View style={styles.notifBody}>
                            <Text style={styles.notifMsg}>
                                <Text style={styles.notifName}>{n.name}</Text> {n.msg}
                            </Text>
                            <View style={styles.notifMeta}>
                                <Text style={styles.notifTime}>{n.time}</Text>
                                <View style={styles.metaDot} />
                                <LeaveBadge type={n.type} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {unreadCount === 0 && notifs.length > 0 && (
                    <View style={styles.caughtUpContainer}>
                        <View style={styles.caughtUpIconCircle}>
                            <Text style={styles.caughtUpIcon}>🎉</Text>
                        </View>
                        <Text style={styles.caughtUpTitle}>You're all caught up!</Text>
                        <Text style={styles.caughtUpSub}>No unread notifications.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },
    header: { backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F2', zIndex: 10 },
    backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    backIcon: { fontSize: 24, color: '#1A1A1A' },
    titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    unreadBadge: { backgroundColor: '#FF5A5F', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
    unreadText: { fontSize: 11, color: colors.white, fontWeight: '800' },
    markAllBtn: { backgroundColor: '#F5FAF7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    markAllText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
    markAllSpacer: { width: 80 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: '#A0AAB2', letterSpacing: 0.8, marginBottom: 12, paddingHorizontal: 4 },
    notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: 'transparent' },
    notifCardUnread: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    notifCardRead: { backgroundColor: '#FFFFFF', opacity: 0.7, borderWidth: 1, borderColor: '#E0E5E9', borderLeftWidth: 1 },
    avatarWrap: { position: 'relative' },
    unreadDot: { position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF5A5F', borderWidth: 2, borderColor: colors.white },
    notifBody: { flex: 1, paddingTop: 2 },
    notifMsg: { fontSize: 14, color: '#444', lineHeight: 20, fontWeight: '500' },
    notifName: { fontWeight: '800', color: '#1A1A1A' },
    notifMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    notifTime: { fontSize: 11, color: '#A0AAB2', fontWeight: '600' },
    metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#D0D5D9', marginHorizontal: 8 },
    caughtUpContainer: { alignItems: 'center', marginTop: 30, backgroundColor: colors.white, borderRadius: 16, padding: 30, borderWidth: 1, borderColor: '#F0F4F2' },
    caughtUpIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F5FAF7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    caughtUpIcon: { fontSize: 24 },
    caughtUpTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
    caughtUpSub: { fontSize: 13, color: '#A0AAB2', fontWeight: '500' },
});