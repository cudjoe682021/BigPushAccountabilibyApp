import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Placeholder until Phase 5 (threshold-based alerts) exists server-side.
// Once alerts are real, this screen lists notices for projects the user
// has reported on or is following.
export default function NotificationsScreen() {
return (
<View style={styles.container}>
<Text style={styles.title}>Notifications</Text>
<Text style={styles.body}>
Nothing yet. Alerts will appear here once the platform's alert job
(Phase 5) is running.
</Text>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
title: { fontSize: 20, fontWeight: '700' },
body: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12 },
});
