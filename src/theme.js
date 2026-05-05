// src/theme.js
// Central design tokens for the Away app.
// Edit colours, fonts, or spacing here and every screen updates automatically.

export const colors = {
    // Brand – Teal
    primary: '#0D6B4E',
    primaryLight: '#E1F5EE',
    primaryMid: '#1D9E75',

    // Leave type accents
    annual: '#0D6B4E',
    annualLight: '#E1F5EE',
    sick: '#D85A30',
    sickLight: '#FAECE7',
    publicHoliday: '#BA7517',
    publicHolidayLight: '#FAEEDA',
    wfh: '#185FA5',
    wfhLight: '#E6F1FB',
    other: '#555555',
    otherLight: '#F1EFE8',

    // UI
    background: '#F5FAF7',
    white: '#FFFFFF',
    error: '#E24B4A',
    errorLight: '#FCEBEB',

    // Text
    textPrimary: '#1A1A1A',
    textSecondary: '#888888',
    textMuted: '#AAAAAA',
    textDisabled: '#CCCCCC',

    // Borders & dividers
    border: '#EEEEEE',
    borderLight: '#F5F5F5',
};

export const leaveTypes = {
    annual: { label: 'Annual', color: colors.annual, bg: colors.annualLight, textColor: '#085041' },
    sick: { label: 'Sick', color: colors.sick, bg: colors.sickLight, textColor: '#712B13' },
    ph: { label: 'Public Holiday', color: colors.publicHoliday, bg: colors.publicHolidayLight, textColor: '#633806' },
    wfh: { label: 'WFH', color: colors.wfh, bg: colors.wfhLight, textColor: '#0C447C' },
    other: { label: 'Other', color: colors.other, bg: colors.otherLight, textColor: '#444441' },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
};

export const radius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 999,
};

export const typography = {
    appName: { fontSize: 30, fontWeight: '700', letterSpacing: -1.5 },
    h1: { fontSize: 24, fontWeight: '700' },
    h2: { fontSize: 20, fontWeight: '700' },
    h3: { fontSize: 16, fontWeight: '700' },
    h4: { fontSize: 14, fontWeight: '700' },
    body: { fontSize: 13, fontWeight: '400' },
    bodySmall: { fontSize: 11, fontWeight: '400' },
    caption: { fontSize: 10, fontWeight: '400' },
    micro: { fontSize: 9, fontWeight: '400' },
    label: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
};