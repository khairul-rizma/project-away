// src/components/Avatar.js
// Displays initials inside a coloured circle.
// Props:
//   name   – full name string, e.g. "Marcus Lee"
//   size   – diameter in pixels (default 36)
//   color  – background colour (default primary teal)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Avatar({ name = '', size = 36, color = colors.primary }) {
    // Build initials: take the first letter of each word, up to 2 letters
    const initials = name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const fontSize = Math.round(size * 0.34);

    return (
        <View
            style={[
                styles.circle,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                },
            ]}
        >
            <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: colors.white,
        fontWeight: '600',
    },
});