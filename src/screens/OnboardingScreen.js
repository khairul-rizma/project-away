// src/screens/OnboardingScreen.js
// A 3-step carousel that explains the app's value before the user signs up.
// Each step has: an illustration panel, headline, body copy, progress dots, and a CTA.

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import LeaveBadge from '../components/LeaveBadge';
import { colors, spacing, radius } from '../theme';

// --- Placeholder data for the illustration panels ---
const TEAM_PREVIEW = [
    { name: 'Marcus Lee', type: 'annual', note: 'Family trip' },
    { name: 'Priya Nair', type: 'sick', note: 'Unwell' },
    { name: 'Jin Park', type: 'ph', note: 'Labour Day' },
];

function leaveColor(type) {
    const map = { annual: colors.annual, sick: colors.sick, ph: colors.publicHoliday, wfh: colors.wfh };
    return map[type] || colors.other;
}

// --- Panel 1: Team schedule preview ---
function Panel1() {
    return (
        <View style={[styles.panel, { backgroundColor: colors.primaryLight }]}>
            <View style={styles.floatingWidget}>
                <View style={styles.widgetHeader}>
                    <Text style={styles.widgetTitle}>Away today</Text>
                    <View style={[styles.widgetBadge, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.widgetBadgeText, { color: colors.primary }]}>3</Text>
                    </View>
                </View>
                {TEAM_PREVIEW.map((p, index) => (
                    <View
                        key={p.name}
                        style={[styles.previewRow, index === TEAM_PREVIEW.length - 1 && { borderBottomWidth: 0 }]}
                    >
                        <Avatar name={p.name} size={32} color={leaveColor(p.type)} />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.previewName}>{p.name}</Text>
                            <Text style={styles.previewNote}>{p.note}</Text>
                        </View>
                        <LeaveBadge type={p.type} />
                    </View>
                ))}
            </View>
        </View>
    );
}

// --- Panel 2: Leave form mini-preview ---
function Panel2() {
    return (
        <View style={[styles.panel, { backgroundColor: colors.publicHolidayLight }]}>
            <View style={styles.floatingWidget}>
                <Text style={styles.widgetTitle}>What kind of leave?</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16, marginTop: 8 }}>
                    {['✈ Annual ✓', '+ Sick', '⌂ WFH'].map((l, i) => (
                        <View
                            key={l}
                            style={[
                                styles.miniChip,
                                i === 0
                                    ? { backgroundColor: colors.primaryLight, borderColor: colors.primary }
                                    : { backgroundColor: '#F8FAF9', borderColor: '#E0E5E9' },
                            ]}
                        >
                            <Text style={{ fontSize: 11, color: i === 0 ? colors.primary : '#A0AAB2', fontWeight: i === 0 ? '700' : '500' }}>
                                {l}
                            </Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.widgetTitle}>When?</Text>
                <View style={[styles.datePill, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
                    <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>
                        Mon 5 May → Fri 9 May
                    </Text>
                </View>

                <View style={[styles.fakeSubmitBtn, { backgroundColor: colors.primary }]}>
                    <Text style={{ fontSize: 13, color: colors.white, fontWeight: '800' }}>Submit leave</Text>
                </View>
            </View>
        </View>
    );
}

// --- Panel 3: Notifications preview ---
function Panel3() {
    const notifs = [
        { icon: '↗', bg: colors.primaryLight, tc: colors.primary, text: 'Marcus Lee logged 5 days Annual leave', time: 'just now', unread: true },
        { icon: '!', bg: colors.sickLight, tc: colors.sick, text: 'Priya Nair is out sick today', time: '2h ago', unread: true },
        { icon: '★', bg: colors.publicHolidayLight, tc: colors.publicHoliday, text: 'Public holiday next Mon', time: '1d ago', unread: false },
    ];
    return (
        <View style={[styles.panel, { backgroundColor: colors.wfhLight }]}>
            <View style={[styles.floatingWidget, { padding: 12 }]}>
                <Text style={[styles.widgetTitle, { fontSize: 10, color: '#A0AAB2', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4 }]}>Notifications</Text>
                {notifs.map((n, i) => (
                    <View key={i} style={[styles.notifRow, n.unread && { borderLeftColor: n.tc }]}>
                        <View style={[styles.notifIcon, { backgroundColor: n.bg }]}>
                            <Text style={{ fontSize: 11, color: n.tc, fontWeight: '800' }}>{n.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notifText}>{n.text}</Text>
                            <Text style={styles.notifTime}>{n.time}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// --- Step definitions ---
const STEPS = [
    {
        Panel: Panel1,
        headline: "Everyone's schedule, one glance away.",
        body: "See your whole team's availability every day — no more surprise out-of-offices.",
        dotColor: colors.primary,
    },
    {
        Panel: Panel2,
        headline: 'Log leave in under 10 seconds.',
        body: 'Pick a type, set the dates, done. Your team is notified the moment you hit submit.',
        dotColor: colors.publicHoliday,
    },
    {
        Panel: Panel3,
        headline: 'Stay ahead of every absence.',
        body: 'Get notified the moment a teammate logs leave. No more morning surprises.',
        dotColor: colors.wfh,
    },
];

export default function OnboardingScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [step, setStep] = useState(0);
    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    function handleNext() {
        if (isLast) {
            navigation.replace('Auth', { mode: 'signup' });
        } else {
            setStep((s) => s + 1);
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            {/* Header / Skip button */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.skipBtn}
                    onPress={() => navigation.replace('Auth', { mode: 'signup' })}
                    activeOpacity={0.6}
                >
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Illustration panel */}
            <View style={styles.panelContainer}>
                <current.Panel />
            </View>

            {/* Copy block */}
            <View style={styles.copyBlock}>
                <Text style={styles.headline}>{current.headline}</Text>
                <Text style={styles.body}>{current.body}</Text>
            </View>

            {/* Progress dots + CTA */}
            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 32 }]}>
                <View style={styles.progressDots}>
                    {STEPS.map((s, i) => (
                        <TouchableOpacity key={i} onPress={() => setStep(i)} activeOpacity={0.8} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <View
                                style={[
                                    styles.progressDot,
                                    {
                                        backgroundColor: i === step ? current.dotColor : '#E0E5E9',
                                        width: i === step ? 24 : 8
                                    },
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.cta,
                        {
                            backgroundColor: current.dotColor,
                            shadowColor: current.dotColor,
                        }
                    ]}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text style={styles.ctaText}>{isLast ? 'Get started →' : 'Next'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },

    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: spacing?.lg || 20,
    },
    skipBtn: { paddingVertical: 8, paddingLeft: 20 },
    skipText: { fontSize: 14, color: '#A0AAB2', fontWeight: '600' },

    panelContainer: { flex: 1.2, justifyContent: 'center' },
    panel: {
        marginHorizontal: spacing?.lg || 20,
        borderRadius: 24,
        padding: 24,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },

    // Floating Widget Shared Styles
    floatingWidget: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    widgetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    widgetTitle: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
    widgetBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    widgetBadgeText: { fontSize: 10, fontWeight: '800' },

    // Panel 1 Specs
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F4F2',
    },
    previewName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    previewNote: { fontSize: 11, color: '#888', fontWeight: '500' },

    // Panel 2 Specs
    miniChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
    datePill: { borderRadius: 12, padding: 12, marginBottom: 16, marginTop: 8, borderWidth: 1.5 },
    fakeSubmitBtn: { borderRadius: 12, padding: 14, alignItems: 'center', opacity: 0.9 },

    // Panel 3 Specs
    notifRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
        backgroundColor: '#F8FAF9',
        padding: 10,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: 'transparent'
    },
    notifIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    notifText: { fontSize: 11, color: '#1A1A1A', fontWeight: '600', lineHeight: 16 },
    notifTime: { fontSize: 10, color: '#A0AAB2', fontWeight: '500', marginTop: 4 },

    // Typography & Bottom Layout
    copyBlock: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
    headline: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', lineHeight: 32, marginBottom: 12, letterSpacing: -0.5 },
    body: { fontSize: 15, color: '#666', lineHeight: 24, fontWeight: '500' },

    footer: { paddingHorizontal: 24, paddingTop: 10 },
    progressDots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 24 },
    progressDot: { height: 6, borderRadius: 3 },

    cta: {
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    ctaText: { fontSize: 16, fontWeight: '800', color: colors.white },
});