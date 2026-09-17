import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getProject } from '../api/client';
import { STATUS_LABELS } from '../config';

// Keeps Verified (government inspections) and Reported (community
// submissions) as two visually separate sections, per the platform's rule
// that community reports never get folded into the official status.
export default function ProjectDetailScreen({ route, navigation }) {
const { projectId } = route.params;
const [project, setProject] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const load = useCallback(async () => {
try {
setError(null);
const data = await getProject(projectId);
setProject(data);
} catch (err) {
setError(err.message);
} finally {
setLoading(false);
}
}, [projectId]);

useEffect(() => {
load();
}, [load]);

if (loading) {
return (
<View style={styles.center}>
<ActivityIndicator size="large" color="#2e7d32" />
</View>
);
}

if (error || !project) {
return (
<View style={styles.center}>
<Text style={styles.errorText}>Couldn't load this project: {error || 'not found'}</Text>
</View>
);
}

const status = STATUS_LABELS[project.status] || STATUS_LABELS.NOT_RECENTLY_VERIFIED;

return (
<ScrollView contentContainerStyle={styles.container}>
<Text style={styles.title}>{project.name}</Text>
<View style={[styles.badge, { backgroundColor: status.color }]}>
<Text style={styles.badgeText}>{status.label}</Text>
</View>

<View style={styles.metaBlock}>
<Text style={styles.metaLine}>Location: {project.location}</Text>
{project.contractor?.name ? (
<Text style={styles.metaLine}>Contractor: {project.contractor.name}</Text>
) : null}
{project.expectedCompletion ? (
<Text style={styles.metaLine}>
Expected completion: {new Date(project.expectedCompletion).toLocaleDateString()}
</Text>
) : null}
</View>

<Text style={styles.sectionHeading}>Verified — government inspections</Text>
{project.inspections?.length ? (
project.inspections.map((inspection) => (
<View key={inspection.id} style={styles.verifiedCard}>
<Text style={styles.cardLine}>{inspection.percentComplete}% complete</Text>
<Text style={styles.cardMeta}>
{new Date(inspection.inspectionDate).toLocaleDateString()} · {inspection.officerName}
</Text>
{inspection.delays ? <Text style={styles.cardMeta}>Delays: {inspection.delays}</Text> : null}
</View>
))
) : (
<Text style={styles.emptyText}>No inspections recorded yet.</Text>
)}

<Text style={styles.sectionHeading}>Reported — from the community</Text>
{project.communityReports?.length ? (
project.communityReports.map((report) => (
<View key={report.id} style={styles.reportedCard}>
<Text style={styles.cardLine}>{report.category.replace(/_/g, ' ')}</Text>
<Text style={styles.cardMeta}>{new Date(report.submittedAt).toLocaleDateString()}</Text>
</View>
))
) : (
<Text style={styles.emptyText}>No community reports yet.</Text>
)}

<TouchableOpacity
style={styles.reportButton}
onPress={() => navigation.navigate('ReportProblem', { projectId: project.id, projectName: project.name })}
>
<Text style={styles.reportButtonText}>Report a problem here</Text>
</TouchableOpacity>
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { padding: 20 },
center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
errorText: { color: '#c62828', textAlign: 'center' },
title: { fontSize: 22, fontWeight: '700' },
badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
badgeText: { color: '#fff', fontWeight: '600', fontSize: 12 },
metaBlock: { marginTop: 16 },
metaLine: { fontSize: 14, color: '#444', marginTop: 2 },
sectionHeading: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 8 },
verifiedCard: { backgroundColor: '#e8f5e9', borderRadius: 10, padding: 12, marginBottom: 8 },
reportedCard: { backgroundColor: '#fff3e0', borderRadius: 10, padding: 12, marginBottom: 8 },
cardLine: { fontSize: 14, fontWeight: '600' },
cardMeta: { fontSize: 12, color: '#666', marginTop: 2 },
emptyText: { color: '#888', fontStyle: 'italic' },
reportButton: {
marginTop: 28,
backgroundColor: '#c62828',
paddingVertical: 14,
borderRadius: 10,
alignItems: 'center',
},
reportButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
