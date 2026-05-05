// src/screens/HomeScreen.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
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
import { colors, leaveTypes, radius, spacing } from '../theme';

const INITIAL_AWAY_TODAY = [
    { id: 'tt3', name: 'Afra', type: 'annual', note: 'Leave · Returns tomorrow' },
    { id: 'm4', name: 'Dai Rong', type: 'wfh', note: 'Working from home' },
    { id: 'd4', name: 'Preeyaphat', type: 'sick', note: 'Unwell today' },
    { id: 's3', name: 'Aiman', type: 'ph', note: 'Holiday' },
    { id: 'c5', name: 'Sawsan', type: 'annual', note: 'Leave · Returns 12 May' },
];

const INITIAL_COMING_UP = [
    { id: 'tt1', name: 'Zulhakim', date: 'Tue 6 May', type: 'wfh', note: 'WFH day' },
    { id: 'd1', name: 'Alex', date: 'Wed–Thu 7–8 May', type: 'annual', note: 'Conference' },
];

function leaveColor(type) {
    return leaveTypes?.[type]?.color || colors?.other || '#DDD';
}

function PersonRow({ person, onPress, showDate = false }) {
    return (
        <TouchableOpacity style={styles.personRow} onPress={onPress} activeOpacity={0.6}>
            <Avatar name={person.name} size={38} color={leaveColor(person.type)} />
            <View style={styles.personInfo}>
                <Text style={styles.personName}>{person.name}</Text>
                {/* Added safety check: only format with date if person.date actually exists */}
                <Text style={styles.personNote} numberOfLines={1}>
                    {showDate && person.date ? `${person.date} · ${person.note}` : person.note}
                </Text>
            </View>
            <View style={styles.badgeContainer}>
                <LeaveBadge type={person.type} />
            </View>
        </TouchableOpacity>
    );
}

export default function HomeScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();

    const [awayToday, setAwayToday] = useState([]);
    const [comingUp, setComingUp] = useState(INITIAL_COMING_UP);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. LOAD DATA ON APP START
    useEffect(() => {
        const loadSavedData = async () => {
            try {
                const savedLeaves = await AsyncStorage.getItem('@away_today_leaves');
                if (savedLeaves !== null) {
                    setAwayToday(JSON.parse(savedLeaves));
                } else {
                    setAwayToday(INITIAL_AWAY_TODAY);
                }
            } catch (e) {
                console.error("Failed to load data", e);
                setAwayToday(INITIAL_AWAY_TODAY);
            } finally {
                setIsLoaded(true);
            }
        };
        loadSavedData();
    }, []);

    // 2. LISTEN FOR NEW LEAVES *AND* CANCELLED LEAVES
    useEffect(() => {
        const handleRouteParams = async () => {
            if (!isLoaded) return;

            let updatedLeaves = [...awayToday];
            let hasChanges = false;

            // Handle Adding a New Leave
            if (route.params?.newLeave) {
                const newLeave = route.params.newLeave;
                const isAlreadyAdded = updatedLeaves.some(l => l.id === newLeave.id) || comingUp.some(l => l.id === newLeave.id);
                if (!isAlreadyAdded) {
                    updatedLeaves = [newLeave, ...updatedLeaves];
                    hasChanges = true;
                }
            }

            // Handle Cancelling a Leave
            if (route.params?.cancelledLeaveId) {
                const idToRemove = route.params.cancelledLeaveId;
                const prevLength = updatedLeaves.length;

                updatedLeaves = updatedLeaves.filter(l => l.id !== idToRemove);

                if (updatedLeaves.length !== prevLength) {
                    hasChanges = true;
                }
            }

            // Apply changes to UI and save to AsyncStorage
            if (hasChanges) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setAwayToday(updatedLeaves);

                try {
                    await AsyncStorage.setItem('@away_today_leaves', JSON.stringify(updatedLeaves));
                } catch (e) {
                    console.error("Failed to save data", e);
                }

                // Clear the params so they don't trigger again randomly
                navigation.setParams({ newLeave: undefined, cancelledLeaveId: undefined });
            }
        };

        handleRouteParams();
    }, [route.params?.newLeave, route.params?.cancelledLeaveId, isLoaded]);

    // --- NEW: SORTING LOGIC ---
    // Sorts the awayToday array chronologically before rendering
    const sortedAwayToday = [...awayToday].sort((a, b) => {
        const getTimestamp = (item) => {
            const dateStr = item.date || item.dates;

            // Fallback: If no date (like the mock data), assume it's "Today"
            if (!dateStr) return new Date().getTime();

            try {
                // Isolate the start date (e.g. "Mon, 5 May" from "Mon, 5 May – Wed, 7 May")
                const startDateStr = dateStr.split('–')[0].trim();
                const dayMonthStr = startDateStr.split(', ')[1]; // Extracts "5 May"

                if (!dayMonthStr) return new Date().getTime();

                const [day, month] = dayMonthStr.split(' ');
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIndex = months.findIndex(m => month.startsWith(m));

                return new Date(new Date().getFullYear(), monthIndex, parseInt(day, 10)).getTime();
            } catch (e) {
                return new Date().getTime();
            }
        };

        return getTimestamp(a) - getTimestamp(b);
    });

    const today = new Date();
    const dayName = today.toLocaleDateString('en-MY', { weekday: 'long' });
    const fullDate = today.toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!isLoaded) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Good morning,</Text>
                        <Text style={styles.userName}>Khairul Rizma 👋</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.bellBtn}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Text style={styles.bellIcon}>🔔</Text>
                        <View style={styles.unreadDot} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerBottom}>
                    <View>
                        <Text style={styles.dayText}>{dayName}</Text>
                        <Text style={styles.dateText}>{fullDate}</Text>
                    </View>
                    <View style={styles.balancePill}>
                        <Text style={styles.balanceText}>Be humble. Keep Building 💪🏻</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle}>Away today</Text>
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{sortedAwayToday.length}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
                            <Text style={styles.seeAll}>See all →</Text>
                        </TouchableOpacity>
                    </View>

                    {sortedAwayToday.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Text style={styles.emptyIcon}>🏢</Text>
                            </View>
                            <Text style={styles.emptyTitle}>Everyone's in today!</Text>
                            <Text style={styles.emptyBody}>Your whole team is available. Enjoy the full house.</Text>
                            <TouchableOpacity style={styles.emptyAction} onPress={() => navigation.navigate('LogLeave')}>
                                <Text style={styles.emptyActionText}>Going somewhere? Log your leave →</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Render using the newly sorted array!
                        sortedAwayToday.map((p, i) => (
                            <View key={p.id} style={[styles.rowWrapper, i < sortedAwayToday.length - 1 && styles.rowBorder]}>
                                <PersonRow person={p} showDate onPress={() => navigation.navigate('LeaveDetail', { person: p })} />
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Coming up this week</Text>
                    <View style={{ marginTop: 10 }}>
                        {comingUp.map((p, i) => (
                            <View key={p.id} style={[styles.rowWrapper, i < comingUp.length - 1 && styles.rowBorder]}>
                                <PersonRow person={p} showDate onPress={() => navigation.navigate('LeaveDetail', { person: p })} />
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.viewCalendarBtn} onPress={() => navigation.navigate('Calendar')}>
                        <Text style={styles.viewCalendar}>View full calendar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('LogLeave')} activeOpacity={0.85}>
                <Text style={styles.fabText}>+ Log leave</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },

    header: { backgroundColor: colors.primary, paddingHorizontal: spacing?.lg || 20, paddingBottom: 25, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
    userName: { fontSize: 22, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
    bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    bellIcon: { fontSize: 18 },
    unreadDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF5A5F', borderWidth: 1.5, borderColor: colors.primary },
    headerBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    dayText: { fontSize: 18, fontWeight: '700', color: colors.white, marginBottom: 2 },
    dateText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
    balancePill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    balanceText: { fontSize: 11, color: colors.white, fontWeight: '700' },

    scroll: { flex: 1, marginTop: -15 },
    scrollContent: { paddingHorizontal: spacing?.md || 16, paddingBottom: 100, paddingTop: 10 },

    card: { backgroundColor: colors.white, borderRadius: radius?.lg || 16, padding: spacing?.md || 16, marginBottom: spacing?.md || 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
    countBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    countText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
    seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

    rowWrapper: { paddingVertical: 2 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F4F2' },
    personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    personInfo: { flex: 1, justifyContent: 'center' },
    personName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    personNote: { fontSize: 12, color: '#888', fontWeight: '400' },
    badgeContainer: { justifyContent: 'center', alignItems: 'flex-end' },

    viewCalendarBtn: { marginTop: 15, backgroundColor: '#F5FAF7', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    viewCalendar: { fontSize: 13, color: colors.primary, fontWeight: '700' },

    emptyState: { alignItems: 'center', paddingVertical: 30 },
    emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F5FAF7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyIcon: { fontSize: 28 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
    emptyBody: { fontSize: 14, color: '#777', textAlign: 'center', maxWidth: 220, lineHeight: 20, marginBottom: 24 },
    emptyAction: { borderWidth: 2, borderColor: colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
    emptyActionText: { fontSize: 14, color: colors.primary, fontWeight: '700' },

    fab: { position: 'absolute', bottom: 24, right: 20, backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14, elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
    fabText: { fontSize: 15, fontWeight: '800', color: colors.white },
});