import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Simple branded splash while we don't yet need any real bootstrapping
// (auth, cached data, etc.). Moves to Home automatically after a beat.
export default function SplashScreen({ navigation }) {
useEffect(() => {
const timer = setTimeout(() => {
navigation.replace('Home');
}, 1200);
return () => clearTimeout(timer);
}, [navigation]);

return (
<View style={styles.container}>
<Text style={styles.title}>BigPush Watchdog</Text>
<Text style={styles.subtitle}>Ghana Road Accountability Platform</Text>
<ActivityIndicator style={styles.spinner} size="large" color="#2e7d32" />
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
alignItems: 'center',
justifyContent: 'center',
backgroundColor: '#ffffff',
padding: 24,
},
title: { fontSize: 26, fontWeight: '700', color: '#1b1b1b' },
subtitle: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
spinner: { marginTop: 32 },
});
