// src/screens/CalendarScreen.js
// Monthly view with coloured dots showing live team absences per day.
// Data is synced directly from AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, leaveTypes, radius, spacing } from '../theme';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const LEGEND = [
    { key: 'annual', label: 'Annual' },
    { key: 'sick', label: 'Sick' },
    { key: 'ph', label: 'Public Holiday' },
    { key: 'wfh', label: 'WFH' },
];

// Helper to parse the custom date string "Mon, 5 May" or "Mon, 5 May – Wed, 7 May" back into usable JS dates
function parseLeaveDates(dateString, currentYear) {
    if (!dateString) return [];

    // Split "Mon, 5 May – Wed, 7 May"
    const parts = dateString.split('–').map(s => s.trim());

    const getMonthIndex = (monthStr) => MONTHS.findIndex(m => m.startsWith(monthStr));

    // Parse a single "Mon, 5 May" string
    const parseSingle = (str) => {
        const [, dayMonth] = str.split(', ');
        if (!dayMonth) return null;
        const [day, month] = dayMonth.split(' ');
        return new Date(currentYear, getMonthIndex(month), parseInt(day, 10));
    };

    const start = parseSingle(parts[0]);
    if (!start) return [];

    const end = parts.length > 1 ? parseSingle(parts[1]) : start;

    // Generate array of all dates between start and end
    const dates = [];
    let curr = new Date(start);
    while (curr <= end) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
    }
    return dates;
}

export default function CalendarScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const now = new Date();

    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth()); // 0-indexed
    const [activeLeaves, setActiveLeaves] = useState([]);

    // 1. Fetch live leave data every time the calendar tab is opened
    useFocusEffect(
        useCallback(() => {
            const fetchLeaves = async () => {
                try {
                    const saved = await AsyncStorage.getItem('@away_today_leaves');
                    if (saved !== null) {
                        setActiveLeaves(JSON.parse(saved));
                    } else {
                        setActiveLeaves([]);
                    }
                } catch (e) {
                    console.error("Failed to load leaves for Calendar", e);
                }
            };
            fetchLeaves();
        }, [])
    );

    // 2. Map live leaves to the current calendar view
    // ABSENCES format: { [day]: [color1, color2] }
    // DETAILS format: { [day]: [{name, type}] }
    const mappedAbsences = {};
    const mappedDetails = {};

    activeLeaves.forEach(leave => {
        // Only show approved leaves on the calendar
        if (leave.status === 'declined' || leave.status === 'cancelled') return;

        // Parse the dates they took off
        const leaveDates = parseLeaveDates(leave.dates || leave.date, year);

        leaveDates.forEach(d => {
            // Only plot dots for the current month we are looking at
            if (d.getMonth() === month && d.getFullYear() === year) {
                const day = d.getDate();
                const color = leaveTypes[leave.type]?.color || colors.other;

                // Add color dot
                if (!mappedAbsences[day]) mappedAbsences[day] = [];
                mappedAbsences[day].push(color);

                // Add details for the popup
                if (!mappedDetails[day]) mappedDetails[day] = [];
                mappedDetails[day].push({ name: leave.name, type: leave.type });
            }
        });
    });

    // First day of month (0=Sun) and total days in month
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build a 35-cell grid (5 weeks)
    const cells = [];
    for (let i = 0; i < 35; i++) {
        const day = i - firstDow + 1;
        cells.push(day >= 1 && day <= daysInMonth ? day : null);
    }

    function prevMonth() {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    }

    function nextMonth() {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    }

    function onDayPress(day) {
        const people = mappedDetails[day];
        if (!people || people.length === 0) {
            Alert.alert(`${day} ${MONTHS[month]}`, 'No absences on this day.');
        } else {
            const names = people.map(p => `• ${p.name} (${leaveTypes[p.type]?.label.replace(/[^a-zA-Z\s]/g, '').trim() || p.type})`).join('\n');
            Alert.alert(`Away on ${day} ${MONTHS[month]}`, names);
        }
    }

    const absenceCount = Object.values(mappedAbsences).flat().length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                    <Text style={styles.navIcon}>‹</Text>
                </TouchableOpacity>

                <View style={styles.monthInfo}>
                    <Text style={styles.monthTitle}>
                        {MONTHS[month]} <Text style={styles.yearTitle}>{year}</Text>
                    </Text>
                    <View style={styles.absencePill}>
                        <Text style={styles.absenceCount}>{absenceCount} absences this month</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                    <Text style={styles.navIcon}>›</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.calendarCard}>
                    <View style={styles.dayHeaders}>
                        {DAYS.map((d, i) => (
                            <View key={i} style={styles.dayHeaderCell}>
                                <Text style={styles.dayHeaderText}>{d}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.grid}>
                        {cells.map((day, i) => {
                            const dots = day ? (mappedAbsences[day] || []) : [];
                            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.cell}
                                    onPress={() => day && onDayPress(day)}
                                    activeOpacity={day ? 0.6 : 1}
                                >
                                    <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                                        <Text style={[styles.dayText, !day && styles.dayEmpty, isToday && styles.todayText]}>
                                            {day || ''}
                                        </Text>
                                    </View>
                                    <View style={styles.dotsRow}>
                                        {dots.slice(0, 3).map((c, di) => (
                                            <View key={di} style={[styles.dot, { backgroundColor: c }]} />
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.legendCard}>
                    {LEGEND.map((item) => (
                        <View key={item.key} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: leaveTypes[item.key]?.color || colors.other }]} />
                            <Text style={styles.legendLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.tip}>Tap a date to see who's out</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },

    header: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing?.lg || 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    navBtn: {
        padding: spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    navIcon: { fontSize: 24, color: colors.white, marginTop: -4 },
    monthInfo: { flex: 1, alignItems: 'center' },
    monthTitle: { fontSize: 22, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
    yearTitle: { fontWeight: '400', opacity: 0.8 },
    absencePill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 6,
    },
    absenceCount: { fontSize: 11, color: colors.white, fontWeight: '600' },

    scrollContent: { paddingHorizontal: spacing?.md || 16, paddingBottom: 40, paddingTop: 15 },

    calendarCard: {
        backgroundColor: colors.white,
        borderRadius: radius?.lg || 16,
        padding: spacing?.md || 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },

    dayHeaders: { flexDirection: 'row', marginBottom: 10 },
    dayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
    dayHeaderText: { fontSize: 11, fontWeight: '700', color: '#A0AAB2' },

    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: '14.28%', alignItems: 'center', paddingVertical: 6 },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayCircle: { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
    dayText: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
    todayText: { color: colors.white, fontWeight: '800' },
    dayEmpty: { color: '#E0E5E9' },
    dotsRow: { flexDirection: 'row', gap: 3, marginTop: 4, height: 6 },
    dot: { width: 5, height: 5, borderRadius: 2.5 },

    legendCard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 14,
        backgroundColor: colors.white,
        borderRadius: radius?.lg || 16,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
        marginBottom: 20,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { fontSize: 11, color: '#555', fontWeight: '500' },

    tip: { textAlign: 'center', fontSize: 12, color: '#B0B8C0', fontWeight: '500' },
});