import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.topHalf}>
                <Text style={styles.logoText}>away</Text>
                <Text style={styles.statText}>Your team's leave, at a glance.</Text>
            </View>
            <View style={styles.bottomHalf}>
                <Text style={styles.title}>Know who's away before you hit send.</Text>
                <Text style={styles.subtitle}>Away keeps your team in sync — no more surprise out-of-offices.</Text>

                <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Auth', { isLogin: false })}>
                    <Text style={styles.primaryBtnText}>Create account</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Auth', { isLogin: true })}>
                    <Text style={styles.secondaryBtnText}>I already have an account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    topHalf: { flex: 1, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
    logoText: { fontSize: 40, fontWeight: 'bold', color: colors.primary },
    statText: { marginTop: 10, fontSize: 12, color: colors.primary, fontWeight: '600' },
    bottomHalf: { flex: 1, padding: 20, justifyContent: 'flex-end', paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.textMain, marginBottom: 10 },
    subtitle: { fontSize: 14, color: colors.textSub, marginBottom: 30, lineHeight: 20 },
    primaryBtn: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
    primaryBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
    secondaryBtn: { borderWidth: 1.5, borderColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    secondaryBtnText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
});