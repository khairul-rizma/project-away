// src/screens/LeaveDetailScreen.js
// Shows full details for one person's absence with Manager Approval workflows.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
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

// Placeholder fallback data for teammates
const DETAILS_MAP = {
    'Marcus Lee': {
        role: 'Senior Engineer',
        type: 'annual',
        dates: 'Mon 5 May → Fri 9 May',
        duration: '5 working days',
        returns: 'Monday, 12 May',
        note: '"Family trip to Penang 🌴"',
        status: 'pending',
    },
    'Priya Nair': {
        role: 'Product Designer',
        type: 'sick',
        dates: 'Mon 3 May',
        duration: '1 day',
        returns: 'Tuesday, 4 May',
        note: 'Unwell today',
        status: 'approved',
    },
    'Jin Park': {
        role: 'QA Engineer',
        type: 'ph',
        dates: 'Mon 3 May',
        duration: '1 day',
        returns: 'Tuesday, 4 May',
        note: 'Labour Day',
        status: 'approved',
    },
    'Afra': {
        role: 'Teammate',
        type: 'annual',
        dates: 'Wed 7 May',
        duration: '1 day',
        returns: 'Thursday, 8 May',
        note: 'Running errands',
        status: 'pending',
    },
};

export default function LeaveDetailScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();

    const { person } = route?.params || {};
    const name = person?.name || 'Khairul Rizma';

    // 1. FIXED: Return an empty object instead of Marcus Lee if it's a new teammate
    const fallback = DETAILS_MAP[name] || {};

    // 2. FIXED: Fallback to generic text if no data is found, instead of Marcus's data
    const details = {
        role: person?.role || fallback.role || 'Teammate',
        type: person?.type || fallback.type || 'annual',
        dates: person?.dates || person?.date || fallback.dates || 'Today',
        duration: person?.duration || fallback.duration || '1 day',
        returns: person?.returns || fallback.returns || 'Tomorrow',
        note: person?.note || fallback.note || 'Leave approved',
        status: person?.status || fallback.status || 'approved',
        appliedBambooHR: person?.appliedBambooHR,
    };

    const cfg = leaveTypes[details.type] || leaveTypes.annual;

    const [approvalStatus, setApprovalStatus] = useState(details.status);

    useEffect(() => {
        setApprovalStatus(details.status);
    }, [details.status]);

    function handleApprove() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setApprovalStatus('approved');
    }

    function handleDecline() {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setApprovalStatus('declined');
    }

    function handleCancelLeave() {
        Alert.alert(
            'Cancel Leave',
            'Are you sure you want to cancel this leave request?',
            [
                { text: 'No, keep it', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        // --- NEW: Generate a cancellation notification with REAL DATE and TIME! ---
                        try {
                            const existing = await AsyncStorage.getItem('@away_notifications');
                            const notifs = existing ? JSON.parse(existing) : [];

                            // Get real date and time
                            const now = new Date();
                            const dateStr = now.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });

                            let hours = now.getHours();
                            const minutes = now.getMinutes().toString().padStart(2, '0');
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            hours = hours % 12;
                            hours = hours ? hours : 12;

                            const formattedDateTime = `${dateStr} • ${hours}:${minutes} ${ampm}`; // e.g., "5 May • 4:30 PM"

                            const cancelNotif = {
                                id: Date.now().toString() + '_cancel',
                                name: name,
                                type: details.type,
                                msg: `cancelled their leave request`,
                                time: formattedDateTime, // <-- NOW USES DATE & TIME
                                unread: true,
                            };
                            await AsyncStorage.setItem('@away_notifications', JSON.stringify([cancelNotif, ...notifs]));
                        } catch (e) {
                            console.log("Error saving cancel notif", e);
                        }

                        if (person?.id) {
                            navigation.navigate('MainTabs', {
                                screen: 'Home',
                                params: { cancelledLeaveId: person.id }
                            });
                        } else {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setApprovalStatus('cancelled');
                        }
                    },
                },
            ]
        );
    }

    const detailRows = [
        { key: 'dates', label: 'Dates', value: details.dates },
        { key: 'duration', label: 'Duration', value: details.duration },
        { key: 'returns', label: 'Returns', value: details.returns },
        { key: 'note', label: 'Note', value: details.note },
    ];

    if (details.appliedBambooHR !== undefined) {
        detailRows.push({
            key: 'bamboo',
            label: 'BambooHR',
            value: details.appliedBambooHR ? '✅ Logged' : '⏳ Action Required'
        });
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leave Detail</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {approvalStatus === 'pending' && (
                    <View style={styles.pendingBanner}>
                        <Text style={styles.pendingIcon}>⏳</Text>
                        <Text style={styles.pendingText}>This leave is waiting for approval.</Text>
                    </View>
                )}

                {details.appliedBambooHR === false && approvalStatus !== 'cancelled' && (
                    <View style={[styles.pendingBanner, { backgroundColor: '#FCEBEB', borderColor: '#F5C2C7' }]}>
                        <Text style={styles.pendingIcon}>⚠️</Text>
                        <Text style={[styles.pendingText, { color: '#842029' }]}>Don't forget to submit this to BambooHR.</Text>
                    </View>
                )}

                <View style={styles.card}>
                    <View style={[styles.cardTop, { backgroundColor: cfg.bg }]}>
                        <Avatar name={name} size={64} color={cfg.color} />
                        <Text style={styles.personName}>{name}</Text>
                        <Text style={styles.personRole}>{details.role}</Text>
                        <View style={styles.badgesRow}>
                            <LeaveBadge type={details.type} />
                            {approvalStatus !== 'pending' && (
                                <View style={[
                                    styles.statusBadge,
                                    approvalStatus === 'approved' ? styles.statusApprove :
                                        approvalStatus === 'declined' ? styles.statusDecline :
                                            styles.statusCancel
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        approvalStatus === 'approved' ? styles.statusApproveText :
                                            approvalStatus === 'declined' ? styles.statusDeclineText :
                                                styles.statusCancelText
                                    ]}>
                                        {approvalStatus.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        {detailRows.map(({ key, label, value }, index) => (
                            <View key={key} style={[styles.detailRow, index === detailRows.length - 1 && { borderBottomWidth: 0 }]}>
                                <Text style={styles.detailLabel}>{label}</Text>
                                <Text style={[styles.detailValue, key === 'note' && styles.detailNote, key === 'bamboo' && !details.appliedBambooHR && { color: '#E24B4A' }]}>
                                    {value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {approvalStatus === 'pending' ? (
                    <View style={styles.managerActions}>
                        <TouchableOpacity style={styles.declineBtn} onPress={handleDecline} activeOpacity={0.8}>
                            <Text style={styles.declineText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.approveBtn, { backgroundColor: cfg.color }]} onPress={handleApprove} activeOpacity={0.8}>
                            <Text style={styles.approveText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    approvalStatus !== 'cancelled' && (
                        <TouchableOpacity
                            style={[styles.messageBtn, { backgroundColor: cfg.color, shadowColor: cfg.color }]}
                            onPress={() => Alert.alert('Message', `Opening a message thread with ${name}...`)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.messageBtnText}>Message {name.split(' ')[0]}</Text>
                        </TouchableOpacity>
                    )
                )}

                {(approvalStatus === 'approved' || approvalStatus === 'pending') && (
                    <TouchableOpacity style={styles.cancelLeaveBtn} onPress={handleCancelLeave} activeOpacity={0.6}>
                        <Text style={styles.cancelLeaveText}>Cancel this leave</Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.returnsNote}>
                    {approvalStatus === 'declined' ? 'Leave request was declined.' :
                        approvalStatus === 'cancelled' ? 'This leave was cancelled.' :
                            `${name.split(' ')[0]} will be back ${details.returns}.`}
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },
    header: { backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F2' },
    backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    backIcon: { fontSize: 24, color: '#1A1A1A' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
    scrollContent: { padding: 16, paddingBottom: 60 },
    pendingBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FFE69C' },
    pendingIcon: { fontSize: 16, marginRight: 8 },
    pendingText: { fontSize: 13, fontWeight: '700', color: '#664D03' },
    card: { backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
    cardTop: { padding: 24, alignItems: 'center' },
    personName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginTop: 12 },
    personRole: { fontSize: 12, color: '#666', fontWeight: '500', marginTop: 4 },
    badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
    statusApprove: { backgroundColor: '#E1F5EE', borderColor: '#0D6B4E' },
    statusApproveText: { color: '#0D6B4E', fontSize: 9, fontWeight: '800' },
    statusDecline: { backgroundColor: '#FCEBEB', borderColor: '#E24B4A' },
    statusDeclineText: { color: '#E24B4A', fontSize: 9, fontWeight: '800' },
    statusCancel: { backgroundColor: '#F0F4F2', borderColor: '#A0AAB2' },
    statusCancelText: { color: '#555', fontSize: 9, fontWeight: '800' },
    cardBody: { paddingHorizontal: 20, paddingVertical: 8 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F4F2' },
    detailLabel: { fontSize: 12, color: '#A0AAB2', fontWeight: '600' },
    detailValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '600', textAlign: 'right', maxWidth: '65%' },
    detailNote: { fontWeight: '400', fontStyle: 'italic', color: '#555' },
    managerActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    declineBtn: { flex: 1, backgroundColor: colors.white, borderWidth: 1.5, borderColor: '#E24B4A', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    declineText: { color: '#E24B4A', fontSize: 15, fontWeight: '800' },
    approveBtn: { flex: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
    approveText: { color: colors.white, fontSize: 15, fontWeight: '800' },
    messageBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 16, elevation: 6, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    messageBtnText: { fontSize: 15, fontWeight: '800', color: colors.white },
    cancelLeaveBtn: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: '#E24B4A', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
    cancelLeaveText: { color: '#E24B4A', fontSize: 14, fontWeight: '700' },
    returnsNote: { textAlign: 'center', fontSize: 12, color: '#A0AAB2', fontWeight: '500', marginTop: 8 },
});