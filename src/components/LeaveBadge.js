// src/components/LeaveBadge.js
// A small coloured pill showing the leave type label.
// Props:
//   type – one of: 'annual' | 'sick' | 'ph' | 'wfh' | 'other'

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { leaveTypes } from '../theme';

export default function LeaveBadge({ type = 'other' }) {
    const config = leaveTypes[type] || leaveTypes.other;

    return (
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 5,
    },
    label: {
        fontSize: 9,
        fontWeight: '600',
    },
});