import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ConfirmationScreen({ route, navigation }) {
const { projectName, threadCount } = route.params;

return (
<View style={styles.container}>
<Text style={styles.checkmark}>✓</Text>
<Text style={styles.title}>Report submitted</Text>
<Text style={styles.body}>
Thanks for reporting on {projectName}. Officials review reports like
yours to decide what to inspect next.
</Text>
{threadCount > 1 ? (
<Text style={styles.threadNote}>
{threadCount} people have reported this project in the last 30 days.
</Text>
) : null}
<TouchableOpacity style={styles.button} onPress={() => navigation.popToTop()}>
<Text style={styles.buttonText}>Back to projects</Text>
</TouchableOpacity>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
checkmark: { fontSize: 56, color: '#2e7d32' },
title: { fontSize: 20, fontWeight: '700', marginTop: 16 },
body: { fontSize: 14, color: '#555', textAlign: 'center', marginTop: 12 },
threadNote: { fontSize: 13, color: '#c62828', textAlign: 'center', marginTop: 12, fontWeight: '600' },
button: {
marginTop: 32,
backgroundColor: '#2e7d32',
paddingVertical: 12,
paddingHorizontal: 24,
borderRadius: 10,
},
buttonText: { color: '#fff', fontWeight: '700' },
});
