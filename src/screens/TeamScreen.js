// src/screens/TeamScreen.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import LeaveBadge from '../components/LeaveBadge';
import { colors, leaveTypes, spacing } from '../theme';

// Base Team Structure
const BASE_TEAMS_DATA = [
    {
        title: 'Teen Titans',
        data: [
            { id: 'tt1', name: 'Zulhakim', role: 'Teammate' },
            { id: 'tt2', name: 'Azzam', role: 'Teammate' },
            { id: 'tt3', name: 'Afra', role: 'Teammate' },
        ],
    },
    {
        title: 'Metamon',
        data: [
            { id: 'm1', name: 'Kelsey', role: 'Teammate' },
            { id: 'm2', name: 'Josh', role: 'Teammate' },
            { id: 'm3', name: 'Ying', role: 'Teammate' },
            { id: 'm4', name: 'Dai Rong', role: 'Teammate' },
        ],
    },
    {
        title: 'Durian',
        data: [
            { id: 'd1', name: 'Alex', role: 'Teammate' },
            { id: 'd2', name: 'Chanya', role: 'Teammate' },
            { id: 'd3', name: 'Kittipit', role: 'Teammate' },
            { id: 'd4', name: 'Preeyaphat', role: 'Teammate' },
            { id: 'd5', name: 'Gam', role: 'Teammate' },
            { id: 'd6', name: 'Giang', role: 'Teammate' },
        ],
    },
    {
        title: 'Slytherin',
        data: [
            { id: 's1', name: 'Nurul', role: 'Teammate' },
            { id: 's2', name: 'Adilla', role: 'Teammate' },
            { id: 's3', name: 'Aiman', role: 'Teammate' },
            { id: 's4', name: 'Hannah', role: 'Teammate' },
            { id: 's5', name: 'Diyana', role: 'Teammate' },
            { id: 's6', name: 'Hazirah', role: 'Teammate' },
        ],
    },
    {
        title: 'Carstensz',
        data: [
            { id: 'c1', name: 'Adinda', role: 'Teammate' },
            { id: 'c2', name: 'Syamira', role: 'Teammate' },
            { id: 'c3', name: 'Claudyo', role: 'Teammate' },
            { id: 'c4', name: 'Dian', role: 'Teammate' },
            { id: 'c5', name: 'Sawsan', role: 'Teammate' },
        ],
    },
    {
        title: 'Challengers',
        data: [
            { id: 'ch1', name: 'Khairul', role: 'Teammate' },
            { id: 'ch2', name: 'Nhan', role: 'Teammate' },
            { id: 'ch3', name: 'Kai', role: 'Teammate' },
            { id: 'ch4', name: 'Josh', role: 'Teammate' },
        ],
    }
];

// Combine mock "Coming up" data so it appears in history too
const INITIAL_COMING_UP = [
    { id: 'tt1_c', name: 'Zulhakim', date: 'Tue 6 May', type: 'wfh', note: 'WFH day', duration: '1 day' },
    { id: 'd1_c', name: 'Alex', date: 'Wed–Thu 7–8 May', type: 'annual', note: 'Conference', duration: '2 days' },
];

function leaveColor(type) {
    return leaveTypes[type]?.color || colors.primary;
}

export default function TeamScreen({ navigation }) {
    const insets = useSafeAreaInsets();

    const [activeLeaves, setActiveLeaves] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const [summaryUser, setSummaryUser] = useState(null);

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
                    console.error("Failed to load leaves for TeamScreen", e);
                }
            };
            fetchLeaves();
        }, [])
    );

    const dynamicTeamsData = useMemo(() => {
        return BASE_TEAMS_DATA.map(team => {
            const updatedMembers = team.data.map(member => {
                const leaveRecord = activeLeaves.find(l => l.name === member.name);
                if (leaveRecord) {
                    return { ...member, status: 'out', type: leaveRecord.type };
                }
                return { ...member, status: 'in', type: null };
            });
            return { ...team, data: updatedMembers };
        });
    }, [activeLeaves]);

    const { totalMembers, outToday } = useMemo(() => {
        let total = 0;
        let out = 0;
        dynamicTeamsData.forEach(team => {
            total += team.data.length;
            team.data.forEach(member => {
                if (member.status === 'out') out++;
            });
        });
        return { totalMembers: total, outToday: out };
    }, [dynamicTeamsData]);

    const filteredTeams = useMemo(() => {
        let processedTeams = dynamicTeamsData.map(team => {
            const filteredMembers = team.data.filter(m => {
                const matchesSearch =
                    m.name.toLowerCase().includes(search.toLowerCase()) ||
                    m.role.toLowerCase().includes(search.toLowerCase());

                const matchesStatus =
                    statusFilter === 'all' || m.status === statusFilter;

                const matchesType =
                    !typeFilter || m.type === typeFilter;

                return matchesSearch && matchesStatus && matchesType;
            });

            return { ...team, data: filteredMembers };
        }).filter(team => team.data.length > 0);

        processedTeams.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });

        return processedTeams;
    }, [dynamicTeamsData, search, statusFilter, typeFilter, sortOrder]);

    const userHistory = useMemo(() => {
        if (!summaryUser) return [];

        const allKnownLeaves = [...activeLeaves, ...INITIAL_COMING_UP];
        return allKnownLeaves.filter(l => l.name === summaryUser.name && l.status !== 'cancelled' && l.status !== 'declined');
    }, [summaryUser, activeLeaves]);

    const annualLeavesTaken = useMemo(() => {
        return userHistory
            .filter(l => l.type === 'annual')
            .reduce((total, l) => {
                const daysMatch = String(l.duration || '1 day').match(/(\d+)/);
                const days = daysMatch ? parseInt(daysMatch[1], 10) : 1;
                return total + days;
            }, 0);
    }, [userHistory]);

    const remainingAnnual = Math.max(0, 20 - annualLeavesTaken);
    const balancePercentage = (remainingAnnual / 20) * 100;

    function renderMember({ item }) {
        const isOut = item.status === 'out';

        return (
            <TouchableOpacity
                style={styles.memberRow}
                onPress={() => setSummaryUser(item)} // ALWAYS opens the summary modal now
                activeOpacity={0.6}
            >
                <Avatar name={item.name} size={46} color={isOut ? leaveColor(item.type) : '#DDF0E9'} />

                <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberRole}>{item.role}</Text>
                </View>

                {isOut ? (
                    <LeaveBadge type={item.type} />
                ) : (
                    <View style={styles.inBadge}>
                        <Text style={styles.inBadgeText}>In</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    function renderSectionHeader({ section: { title } }) {
        return (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
                <View style={styles.sectionHeaderLine} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Text style={styles.headerTitle}>Teams</Text>

                <View style={styles.headerSubRow}>
                    <View style={styles.outPill}>
                        <Text style={styles.outPillText}>{outToday} out today</Text>
                    </View>
                    <Text style={styles.totalMembersText}>{totalMembers} members</Text>
                </View>
            </View>

            <View style={styles.searchWrap}>
                <View style={styles.searchInner}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search teammates…"
                        placeholderTextColor="#A0AAB2"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    <TouchableOpacity
                        style={styles.sortChip}
                        onPress={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.sortChipText}>
                            Sort: {sortOrder === 'asc' ? 'A-Z ↓' : 'Z-A ↑'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    {['all', 'in', 'out'].map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterChip,
                                statusFilter === status ? styles.filterChipActive : styles.filterChipInactive
                            ]}
                            onPress={() => setStatusFilter(status)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.filterText,
                                statusFilter === status ? styles.filterTextActive : styles.filterTextInactive
                            ]}>
                                {status.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.divider} />

                    {Object.keys(leaveTypes).map(type => {
                        const isActive = typeFilter === type;
                        const typeConfig = leaveTypes[type];
                        return (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.filterChip,
                                    isActive ? { backgroundColor: leaveColor(type), borderColor: leaveColor(type) } : styles.filterChipInactive
                                ]}
                                onPress={() => setTypeFilter(prev => prev === type ? null : type)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.filterText,
                                    isActive ? { color: '#fff' } : styles.filterTextInactive
                                ]}>
                                    {typeConfig.label.replace(/[^a-zA-Z\s]/g, '').trim().toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <SectionList
                sections={filteredTeams}
                keyExtractor={(item) => item.id}
                renderItem={renderMember}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <Text style={styles.emptyIcon}>🔍</Text>
                        </View>
                        <Text style={styles.emptyTitle}>No matches found</Text>
                        <Text style={styles.emptyText}>
                            Try adjusting your filters or search term.
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity style={[styles.inviteBtn, { bottom: insets.bottom > 0 ? insets.bottom + 10 : 24 }]} activeOpacity={0.85}>
                <Text style={styles.inviteBtnText}>+ Invite a teammate</Text>
            </TouchableOpacity>

            <Modal visible={!!summaryUser} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setSummaryUser(null)} />

                    <View style={[styles.modalContent, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }]}>
                        {summaryUser && (
                            <>
                                <View style={styles.modalHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                                        <Avatar name={summaryUser.name} size={54} color={colors.primary} />
                                        <View>
                                            <Text style={styles.modalName}>{summaryUser.name}</Text>
                                            <Text style={styles.modalRole}>{summaryUser.role}</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSummaryUser(null)}>
                                        <Text style={styles.closeIcon}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* NEW: Quick shortcut to active leave details if they are currently Out */}
                                {summaryUser.status === 'out' && (
                                    <TouchableOpacity
                                        style={[styles.activeLeaveBtn, { borderColor: leaveColor(summaryUser.type), backgroundColor: `${leaveColor(summaryUser.type)}15` }]}
                                        onPress={() => {
                                            const currentLeaveData = activeLeaves.find(l => l.name === summaryUser.name) || summaryUser;
                                            setSummaryUser(null);
                                            navigation.navigate('LeaveDetail', { person: currentLeaveData });
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.activeLeaveBtnText, { color: leaveColor(summaryUser.type) }]}>
                                            View Active Leave Details →
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <View style={styles.balanceCard}>
                                    <Text style={styles.balanceLabel}>Annual Leave Balance</Text>
                                    <View style={styles.balanceRow}>
                                        <Text style={styles.balanceValue}>{remainingAnnual}</Text>
                                        <Text style={styles.balanceTotal}>/ 20 days remaining</Text>
                                    </View>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${balancePercentage}%` }]} />
                                    </View>
                                </View>

                                <Text style={styles.historyTitle}>Recent History</Text>

                                {userHistory.length === 0 ? (
                                    <Text style={styles.emptyHistory}>No recent leave history.</Text>
                                ) : (
                                    <View style={styles.historyBox}>
                                        {userHistory.map((leave, index) => {
                                            const typeConfig = leaveTypes[leave.type] || leaveTypes.other;
                                            const typeName = typeConfig.label.replace(/[^a-zA-Z\s]/g, '').trim();
                                            const dateText = leave.dates || leave.date || 'Today';
                                            const durationText = leave.duration || '1 day';

                                            return (
                                                <View key={leave.id || index} style={[styles.historyRow, index === userHistory.length - 1 && { borderBottomWidth: 0 }]}>
                                                    <View style={[styles.historyDot, { backgroundColor: typeConfig.color }]} />
                                                    <View style={styles.historyInfo}>
                                                        <Text style={styles.historyType}>{typeName}</Text>
                                                        <Text style={styles.historyDate}>{dateText} • {durationText}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },

    header: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing?.lg || 20,
        paddingBottom: 35,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
    headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    outPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    outPillText: { fontSize: 11, color: '#fff', fontWeight: '800' },
    totalMembersText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

    searchWrap: { paddingHorizontal: 16, marginTop: -24, marginBottom: 16, zIndex: 2 },
    searchInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    searchIcon: { fontSize: 16, marginRight: 10 },
    searchInput: { flex: 1, paddingVertical: 16, fontSize: 15, color: '#1A1A1A', fontWeight: '500' },

    filterContainer: { marginBottom: 12 },
    filterScrollContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    divider: { width: 1, height: 20, backgroundColor: '#D0D5D9', marginHorizontal: 4 },

    sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E5E9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    sortChipText: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },

    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    filterChipInactive: { backgroundColor: '#fff', borderColor: '#E0E5E9' },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { fontSize: 12, fontWeight: '700' },
    filterTextInactive: { color: '#A0AAB2' },
    filterTextActive: { color: '#fff' },

    listContent: { paddingHorizontal: 16, paddingBottom: 120 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 24, paddingBottom: 12, gap: 12 },
    sectionHeaderText: { fontSize: 13, fontWeight: '800', color: '#A0AAB2', textTransform: 'uppercase', letterSpacing: 1.2 },
    sectionHeaderLine: { flex: 1, height: 1, backgroundColor: '#E0E5E9' },

    memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    memberInfo: { flex: 1, justifyContent: 'center' },
    memberName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
    memberRole: { fontSize: 12, color: '#888', fontWeight: '500' },
    separator: { height: 12 },

    inBadge: { backgroundColor: '#F5FAF7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#DDF0E9' },
    inBadgeText: { fontSize: 11, fontWeight: '800', color: colors.primaryMid },

    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    emptyIcon: { fontSize: 28 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
    emptyText: { color: '#A0AAB2', fontSize: 14, fontWeight: '500' },

    inviteBtn: { position: 'absolute', alignSelf: 'center', backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
    inviteBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#F8FAF9', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 30 },

    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    modalName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
    modalRole: { fontSize: 13, color: '#888', fontWeight: '500' },
    closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E5E9', alignItems: 'center', justifyContent: 'center' },
    closeIcon: { fontSize: 14, color: '#555', fontWeight: '800' },

    activeLeaveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20, borderWidth: 1 },
    activeLeaveBtnText: { fontSize: 13, fontWeight: '800' },

    balanceCard: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    balanceLabel: { fontSize: 12, fontWeight: '700', color: '#A0AAB2', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    balanceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
    balanceValue: { fontSize: 32, fontWeight: '800', color: colors.primary, marginRight: 6 },
    balanceTotal: { fontSize: 14, fontWeight: '600', color: '#888' },
    progressBarBg: { height: 8, backgroundColor: '#F0F4F2', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },

    historyTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 },
    emptyHistory: { fontSize: 14, color: '#A0AAB2', fontStyle: 'italic', marginTop: 4 },
    historyBox: { backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
    historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F2', gap: 12 },
    historyDot: { width: 12, height: 12, borderRadius: 6 },
    historyInfo: { flex: 1 },
    historyType: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    historyDate: { fontSize: 12, color: '#888', fontWeight: '500' },
});