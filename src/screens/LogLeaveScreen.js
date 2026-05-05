
// src/screens/LogLeaveScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, leaveTypes } from '../theme';

const TEAMS_DATA = {
    'Teen Titans': ['Zulhakim', 'Azzam', 'Afra'],
    'Metamon': ['Kelsey', 'Josh', 'Ying', 'Dai Rong'],
    'Durian': ['Alex', 'Chanya', 'Kittipit', 'Preeyaphat', 'Gam', 'Giang'],
    'Slytherin': ['Nurul', 'Adilla', 'Aiman', 'Hannah', 'Diyana', 'Hazirah'],
    'Carstensz': ['Adinda', 'Syamira', 'Claudyo', 'Dian', 'Sawsan'],
    'Challengers': ['Khairul', 'Nhan', 'Kai', 'Josh'],
};

const LEAVE_TYPES = [
    { key: 'annual', label: '✈  Annual' },
    { key: 'sick', label: '+  Sick' },
    { key: 'ph', label: '★  Public Holiday' },
    { key: 'wfh', label: '⌂  WFH' },
    { key: 'other', label: '…  Other' },
];

const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function LogLeaveScreen({ navigation }) {
    const insets = useSafeAreaInsets();

    const [selectedTeam, setSelectedTeam] = useState('Teen Titans');
    const [selectedName, setSelectedName] = useState(TEAMS_DATA['Teen Titans'][0]);

    useEffect(() => {
        setSelectedName(TEAMS_DATA[selectedTeam][0]);
    }, [selectedTeam]);

    const [selectedType, setSelectedType] = useState('annual');
    const [note, setNote] = useState('');
    const [visibleToAll, setVisibleToAll] = useState(true);

    const [appliedBambooHR, setAppliedBambooHR] = useState(false);
    const [managerApproved, setManagerApproved] = useState(false);

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(null);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [calendarTarget, setCalendarTarget] = useState('from');

    const typeConfig = leaveTypes[selectedType] || leaveTypes.other;

    let durationText = "1 day selected";
    if (fromDate && toDate) {
        const diffTime = Math.abs(toDate - fromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        durationText = `${diffDays} days selected`;
    }

    function openCalendar(target) {
        setCalendarTarget(target);
        setIsCalendarVisible(true);
    }

    function handleSelectDate(dayNumber) {
        const selectedDate = new Date(2026, 4, dayNumber);
        if (calendarTarget === 'from') {
            setFromDate(selectedDate);
            if (toDate && selectedDate > toDate) setToDate(null);
        } else {
            if (selectedDate < fromDate) {
                Alert.alert('Invalid Date', 'End date cannot be before start date.');
                return;
            }
            setToDate(selectedDate);
        }
        setIsCalendarVisible(false);
    }

    function handleSubmit() {
        if (!fromDate) {
            Alert.alert('No date selected', 'Please choose a start date for your leave.');
            return;
        }

        if (!appliedBambooHR || !managerApproved) {
            Alert.alert(
                'Action Required',
                'You must apply in BambooHR and receive Manager Approval before logging your leave here.'
            );
            return;
        }

        // Calculate the actual return date
        const lastDayOfLeave = new Date(toDate || fromDate);
        const returnDateObj = new Date(lastDayOfLeave);
        returnDateObj.setDate(returnDateObj.getDate() + 1);
        const formattedReturnDate = formatDate(returnDateObj);

        // We must pack ALL of these fields into the object so LeaveDetailScreen can read them!
        const newLeave = {
            id: Date.now().toString(),
            name: selectedName,
            type: selectedType,
            date: toDate ? `${formatDate(fromDate)} – ${formatDate(toDate)}` : formatDate(fromDate),
            dates: toDate ? `${formatDate(fromDate)} – ${formatDate(toDate)}` : formatDate(fromDate),
            duration: durationText,           // <--- Added!
            returns: formattedReturnDate,     // <--- Added!
            appliedBambooHR: appliedBambooHR, // <--- Added!
            note: note || 'Leave approved',
            status: 'approved',
        };

        // --- NEW: Generate a notification with REAL DATE and TIME! ---
        const createNotification = async () => {
            try {
                const existing = await AsyncStorage.getItem('@away_notifications');
                const notifs = existing ? JSON.parse(existing) : [];

                // Get real date and time
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }); // e.g., "5 May"

                let hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;

                const formattedDateTime = `${dateStr} • ${hours}:${minutes} ${ampm}`; // e.g., "5 May • 4:30 PM"

                const newNotification = {
                    id: Date.now().toString() + '_notif',
                    name: selectedName,
                    type: selectedType,
                    msg: `logged ${durationText} of ${typeConfig.label.replace(/[^a-zA-Z\s]/g, '').trim()} leave`,
                    time: formattedDateTime, // <-- NOW USES DATE & TIME
                    unread: true,
                };

                await AsyncStorage.setItem('@away_notifications', JSON.stringify([newNotification, ...notifs]));
            } catch (e) {
                console.log("Error saving notification", e);
            }
        };

        createNotification();

        navigation.replace('Success', {
            newLeave: newLeave,
            leaveType: typeConfig.label.replace(/[^a-zA-Z\s]/g, '').trim(),
            fromDate: formatDate(fromDate),
            duration: durationText,
            team: selectedTeam
        });
    }

    const CustomToggle = ({ label, subLabel, value, onToggle }) => (
        <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.toggleLabel}>{label}</Text>
                <Text style={styles.toggleSub}>{subLabel}</Text>
            </View>
            <TouchableOpacity
                style={[styles.toggle, { backgroundColor: value ? typeConfig.color : '#D0D5D9' }]}
                onPress={onToggle}
                activeOpacity={0.8}
            >
                <View style={[styles.toggleThumb, value ? styles.thumbRight : styles.thumbLeft]} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.6}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Log Leave</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionLabel}>Select Team</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    <View style={styles.horizontalChipsRow}>
                        {Object.keys(TEAMS_DATA).map((team) => {
                            const isSelected = team === selectedTeam;
                            return (
                                <TouchableOpacity
                                    key={team}
                                    style={[styles.chip, isSelected ? { backgroundColor: typeConfig.color, borderColor: typeConfig.color, borderWidth: 1.5 } : styles.chipUnselected]}
                                    onPress={() => setSelectedTeam(team)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.chipText, { color: isSelected ? colors.white : '#888', fontWeight: isSelected ? '700' : '500' }]}>{team}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                <Text style={styles.sectionLabel}>Who is taking leave?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    <View style={styles.horizontalChipsRow}>
                        {TEAMS_DATA[selectedTeam].map((memberName) => {
                            const isSelected = memberName === selectedName;
                            return (
                                <TouchableOpacity
                                    key={memberName}
                                    style={[styles.chip, isSelected ? { backgroundColor: '#E0E5E9', borderColor: '#A0AAB2', borderWidth: 1.5 } : styles.chipUnselected]}
                                    onPress={() => setSelectedName(memberName)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.chipText, { color: isSelected ? '#1A1A1A' : '#888', fontWeight: isSelected ? '800' : '500' }]}>{memberName}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>

                <Text style={styles.sectionLabel}>What kind of leave?</Text>
                <View style={styles.chipsRow}>
                    {LEAVE_TYPES.map((lt) => {
                        const isSelected = lt.key === selectedType;
                        const cfg = leaveTypes[lt.key] || leaveTypes.other;
                        return (
                            <TouchableOpacity
                                key={lt.key}
                                style={[styles.chip, isSelected ? { backgroundColor: cfg.bg, borderColor: cfg.color, borderWidth: 1.5 } : styles.chipUnselected]}
                                onPress={() => setSelectedType(lt.key)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.chipText, { color: isSelected ? cfg.textColor : '#888', fontWeight: isSelected ? '700' : '500' }]}>{lt.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.sectionLabel}>When?</Text>
                <View style={styles.datesRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.dateSubLabel}>From</Text>
                        <TouchableOpacity style={[styles.dateBox, { borderColor: typeConfig.color, backgroundColor: typeConfig.bg, borderWidth: 1.5 }]} onPress={() => openCalendar('from')} activeOpacity={0.7}>
                            <Text style={[styles.dateBoxText, { color: typeConfig.color }]}>{formatDate(fromDate) || 'Start date'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.dateSubLabel}>To</Text>
                        <TouchableOpacity style={[styles.dateBox, toDate && { borderColor: typeConfig.color, borderWidth: 1.5 }]} onPress={() => openCalendar('to')} activeOpacity={0.7}>
                            <Text style={toDate ? [styles.dateBoxText, { color: typeConfig.color }] : styles.dateBoxPlaceholder}>
                                {toDate ? formatDate(toDate) : 'End date'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.durationHint, { backgroundColor: typeConfig.bg }]}>
                    <Text style={[styles.durationText, { color: typeConfig.textColor }]}>
                        <Text style={{ fontWeight: '700' }}>{durationText}</Text> {!toDate && '· Tap "To" to add an end date'}
                    </Text>
                </View>

                <Text style={styles.sectionLabel}>Note <Text style={styles.optional}>(optional)</Text></Text>
                <TextInput style={styles.noteInput} placeholder="Let your team know anything useful..." placeholderTextColor="#A0AAB2" value={note} onChangeText={setNote} multiline textAlignVertical="top" />

                <Text style={[styles.sectionLabel, { marginTop: 4 }]}>HR & Approvals</Text>
                <View style={[styles.toggleGroup, { borderColor: appliedBambooHR && managerApproved ? '#DFF2E8' : '#FCEBEB' }]}>
                    <CustomToggle label="Applied in BambooHR?" subLabel={appliedBambooHR ? "Yes, logged officially" : "Required to submit"} value={appliedBambooHR} onToggle={() => setAppliedBambooHR(!appliedBambooHR)} />
                    <CustomToggle label="Manager Approved?" subLabel={managerApproved ? "Yes, approved" : "Required to submit"} value={managerApproved} onToggle={() => setManagerApproved(!managerApproved)} />
                </View>
                {!appliedBambooHR || !managerApproved ? (
                    <Text style={styles.warningText}>⚠️ Both approvals are required to log leave.</Text>
                ) : null}

                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Visibility</Text>
                <View style={[styles.toggleGroup, { marginBottom: 30 }]}>
                    <CustomToggle label="Visible to" subLabel={visibleToAll ? "Whole team can see this" : "Manager only"} value={visibleToAll} onToggle={() => setVisibleToAll(!visibleToAll)} />
                </View>

            </ScrollView>

            <Modal visible={isCalendarVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsCalendarVisible(false)} />
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <Text style={styles.modalTitle}>Select {calendarTarget === 'from' ? 'Start' : 'End'} Date</Text>
                        <Text style={styles.modalMonth}>May 2026</Text>

                        <View style={styles.calendarGrid}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <Text key={`head-${i}`} style={styles.calHeader}>{d}</Text>
                            ))}
                            {Array.from({ length: 5 }).map((_, i) => <View key={`empty-${i}`} style={styles.calCell} />)}
                            {Array.from({ length: 31 }).map((_, i) => {
                                const dayNum = i + 1;
                                const isSelected = (calendarTarget === 'from' && fromDate?.getDate() === dayNum) ||
                                    (calendarTarget === 'to' && toDate?.getDate() === dayNum);
                                return (
                                    <TouchableOpacity
                                        key={`day-${dayNum}`}
                                        style={[styles.calCell, isSelected && { backgroundColor: typeConfig.color, borderRadius: 20 }]}
                                        onPress={() => handleSelectDate(dayNum)}
                                    >
                                        <Text style={[styles.calDayText, isSelected && { color: colors.white, fontWeight: '800' }]}>{dayNum}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 24 }]}>
                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: appliedBambooHR && managerApproved ? typeConfig.color : '#E0E5E9' }]}
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                >
                    <Text style={[styles.submitText, { color: appliedBambooHR && managerApproved ? colors.white : '#A0AAB2' }]}>Submit leave</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },
    header: { backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F2', zIndex: 10 },
    backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    backIcon: { fontSize: 24, color: '#1A1A1A' },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },

    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 180, paddingTop: 20 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#A0AAB2', marginBottom: 10, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    optional: { fontWeight: '500', color: '#B0B8C0', textTransform: 'none', letterSpacing: 0 },

    horizontalScroll: { marginBottom: 24, marginHorizontal: -16 },
    horizontalChipsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    chipUnselected: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E0E5E9', elevation: 1 },
    chipText: { fontSize: 13 },

    datesRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    dateSubLabel: { fontSize: 10, color: '#A0AAB2', fontWeight: '600', marginBottom: 6 },
    dateBox: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E0E5E9', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, elevation: 1 },
    dateBoxText: { fontSize: 14, fontWeight: '700' },
    dateBoxPlaceholder: { fontSize: 14, color: '#A0AAB2', fontWeight: '500' },
    durationHint: { borderRadius: 10, padding: 12, marginBottom: 24 },
    durationText: { fontSize: 12 },

    noteInput: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E0E5E9', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#1A1A1A', minHeight: 80, marginBottom: 24, elevation: 1 },

    toggleGroup: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E0E5E9', paddingHorizontal: 16, elevation: 1 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F2' },
    toggleLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    toggleSub: { fontSize: 11, color: '#A0AAB2', fontWeight: '500', marginTop: 4 },
    toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 2 },
    toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white },
    thumbRight: { alignSelf: 'flex-end' },
    thumbLeft: { alignSelf: 'flex-start' },

    warningText: { fontSize: 11, fontWeight: '600', color: '#E24B4A', marginTop: 8, paddingHorizontal: 4 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 14, fontWeight: '700', color: '#A0AAB2', textAlign: 'center', marginBottom: 4 },
    modalMonth: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    calHeader: { width: '14%', textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#A0AAB2', marginBottom: 12 },
    calCell: { width: '14%', height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    calDayText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: '#F0F4F2', padding: 16, paddingTop: 16, elevation: 10 },
    submitBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 8, elevation: 4 },
    submitText: { fontSize: 15, fontWeight: '800', color: colors.white },
});