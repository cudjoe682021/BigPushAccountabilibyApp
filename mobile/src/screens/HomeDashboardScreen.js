import React, { useCallback, useEffect, useState } from 'react';
import {
View,
Text,
FlatList,
TouchableOpacity,
StyleSheet,
ActivityIndicator,
RefreshControl,
} from 'react-native';
import { listProjects } from '../api/client';
import { STATUS_LABELS } from '../config';

// Lists projects the same way the public site will: newest-updated first,
// with a status badge. This is the entry point residents use to find the
// project near them before filing a report.
export default function HomeDashboardScreen({ navigation }) {
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState(null);

const load = useCallback(async () => {
try {
setError(null);
const data = await listProjects();
setProjects(data);
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
setRefreshing(false);
}
}, []);

useEffect(() => {
load();
}, [load]);

const onRefresh = () => {
setRefreshing(true);
load();
};

if (loading) {
return (
<View style={styles.center}>
<ActivityIndicator size="large" color="#2e7d32" />
</View>
);
}

if (error) {
return (
<View style={styles.center}>
<Text style={styles.errorText}>Couldn't load projects: {error}</Text>
<TouchableOpacity onPress={load} style={styles.retryButton}>
<Text style={styles.retryText}>Try again</Text>
</TouchableOpacity>
</View>
);
}

return (
<FlatList
data={projects}
keyExtractor={(item) => item.id}
contentContainerStyle={styles.list}
refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
ListEmptyComponent={
<View style={styles.center}>
<Text>No projects yet.</Text>
</View>
}
renderItem={({ item }) => {
const status = STATUS_LABELS[item.status] || STATUS_LABELS.NOT_RECENTLY_VERIFIED;
return (
<TouchableOpacity
style={styles.card}
onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
>
<View style={styles.cardHeader}>
<Text style={styles.cardTitle}>{item.name}</Text>
<View style={[styles.badge, { backgroundColor: status.color }]}>
<Text style={styles.badgeText}>{status.label}</Text>
</View>
</View>
<Text style={styles.cardSubtitle}>{item.location}</Text>
{item.contractor?.name ? (
<Text style={styles.cardMeta}>Contractor: {item.contractor.name}</Text>
) : null}
</TouchableOpacity>
);
}}
/>
);
}

const styles = StyleSheet.create({
list: { padding: 16 },
center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
errorText: { color: '#c62828', textAlign: 'center', marginBottom: 12 },
retryButton: { backgroundColor: '#2e7d32', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
retryText: { color: '#fff', fontWeight: '600' },
card: {
backgroundColor: '#f7f7f7',
borderRadius: 12,
padding: 16,
marginBottom: 12,
},
cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
cardSubtitle: { fontSize: 13, color: '#555', marginTop: 4 },
cardMeta: { fontSize: 12, color: '#888', marginTop: 2 },
badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
