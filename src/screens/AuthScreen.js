// src/screens/AuthScreen.js
// Handles both Sign Up and Log In.
// The mode ('signup' | 'login') is passed via navigation params.
// Toggle between modes using the footer link.

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme';

// An upgraded interactive field with focus states and password toggle
function Field({ label, placeholder, value, onChangeText, isPassword = false, hint = '' }) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#A0AAB2"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    autoCapitalize="none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {isPassword && (
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                )}
            </View>
            {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
        </View>
    );
}

export default function AuthScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();

    // Start in signup or login mode based on where the user came from
    const initialMode = route?.params?.mode || 'signup';
    const [mode, setMode] = useState(initialMode);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [teamCode, setTeamCode] = useState('');
    const [agreed, setAgreed] = useState(false);

    const isSignup = mode === 'signup';

    function handleSubmit() {
        if (!email || !password) {
            Alert.alert('Missing fields', 'Please fill in your email and password.');
            return;
        }
        if (isSignup && !name) {
            Alert.alert('Missing name', 'Please enter your full name.');
            return;
        }
        if (isSignup && !agreed) {
            Alert.alert('Terms required', 'Please agree to the Terms of Service to continue.');
            return;
        }
        navigation.replace('MainTabs');
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.white }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* App logo */}
                <Text style={styles.logo}>away</Text>

                {/* Heading */}
                <Text style={styles.heading}>{isSignup ? 'Create your account' : 'Welcome back.'}</Text>
                <Text style={styles.subheading}>
                    {isSignup ? 'Free for teams up to 20 people.' : "Sign in to see your team's schedule."}
                </Text>

                {/* Signup-only: name field */}
                {isSignup && (
                    <Field
                        label="Full name"
                        placeholder="e.g. Sofía Morales"
                        value={name}
                        onChangeText={setName}
                    />
                )}

                <Field
                    label="Work email"
                    placeholder="you@company.com"
                    value={email}
                    onChangeText={setEmail}
                />

                <Field
                    label="Password"
                    placeholder={isSignup ? 'Min. 8 characters' : '••••••••'}
                    value={password}
                    onChangeText={setPassword}
                    isPassword={true}
                />

                {/* Signup-only: team invite code */}
                {isSignup && (
                    <Field
                        label="Team invite code (optional)"
                        placeholder="e.g. TEAM-4821"
                        value={teamCode}
                        onChangeText={setTeamCode}
                        hint="Ask your manager for this 8-digit code"
                    />
                )}

                {/* Login-only: forgot password */}
                {!isSignup && (
                    <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.6}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                )}

                {/* Signup-only: T&C checkbox */}
                {isSignup && (
                    <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
                        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                            {agreed && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>
                        <Text style={styles.checkLabel}>
                            I agree to the{' '}
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text>
                            {' '}and{' '}
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Primary CTA */}
                <TouchableOpacity style={styles.cta} onPress={handleSubmit} activeOpacity={0.85}>
                    <Text style={styles.ctaText}>{isSignup ? 'Create account' : 'Sign in'}</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <View style={styles.dividerPill}>
                        <Text style={styles.dividerText}>or</Text>
                    </View>
                    <View style={styles.dividerLine} />
                </View>

                {/* Biometric / Face ID */}
                <TouchableOpacity style={styles.biometricBtn} activeOpacity={0.7}>
                    <Text style={styles.biometricText}>⬡  Sign in with Face ID</Text>
                </TouchableOpacity>

                {/* Switch mode */}
                <TouchableOpacity
                    style={styles.switchRow}
                    onPress={() => setMode(isSignup ? 'login' : 'signup')}
                    activeOpacity={0.6}
                >
                    <Text style={styles.switchText}>
                        {isSignup ? 'Already have an account? ' : 'New here? '}
                        <Text style={styles.switchTextHighlight}>
                            {isSignup ? 'Sign in' : 'Create an account →'}
                        </Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: { paddingHorizontal: spacing?.lg || 24 },

    logo: { fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: spacing.md, letterSpacing: -0.5 },
    heading: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
    subheading: { fontSize: 13, color: '#888', fontWeight: '500', marginBottom: 32 },

    // Interactive Field Styles
    fieldWrapper: { marginBottom: 20 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 6 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAF9',
        borderWidth: 1.5,
        borderColor: '#E0E5E9',
        borderRadius: radius?.lg || 14,
        overflow: 'hidden',
    },
    inputFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    eyeBtn: { paddingHorizontal: 16, justifyContent: 'center' },
    eyeIcon: { fontSize: 16 },
    fieldHint: { fontSize: 11, color: '#A0AAB2', fontWeight: '500', marginTop: 6 },

    forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
    forgotText: { fontSize: 12, color: colors.primary, fontWeight: '700' },

    // Checkbox Styles
    checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 24, paddingRight: 10 },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 6,
        backgroundColor: '#F8FAF9',
        borderWidth: 1.5,
        borderColor: '#C0C8D0',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
    },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkboxTick: { fontSize: 12, color: colors.white, fontWeight: '800' },
    checkLabel: { flex: 1, fontSize: 12, color: '#777', lineHeight: 18, fontWeight: '500' },

    // Buttons
    cta: {
        backgroundColor: colors.primary,
        borderRadius: radius?.lg || 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    ctaText: { fontSize: 15, fontWeight: '800', color: colors.white },

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#F0F4F2' },
    dividerPill: { paddingHorizontal: 12 },
    dividerText: { fontSize: 12, color: '#A0AAB2', fontWeight: '600' },

    biometricBtn: {
        backgroundColor: '#F8FAF9',
        borderWidth: 1.5,
        borderColor: '#E0E5E9',
        borderRadius: radius?.lg || 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 32,
    },
    biometricText: { fontSize: 14, fontWeight: '600', color: '#555' },

    switchRow: { alignItems: 'center', paddingBottom: 20 },
    switchText: { fontSize: 13, color: '#888', fontWeight: '500' },
    switchTextHighlight: { color: colors.primary, fontWeight: '700' },
});