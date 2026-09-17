import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { submitCommunityReport } from '../api/client';
import { REPORT_CATEGORIES } from '../config';

// The core community-reporting form: category buttons, auto-captured GPS,
// optional name/phone. Photo/video attachment is stubbed for now — wiring
// expo-image-picker to Cloudinary is the next piece of Phase 2.
export default function ReportProblemScreen({ route, navigation }) {
  const { projectId, projectName } = route.params;
  const [category, setCategory] = useState(null);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!category) {
      Alert.alert('Pick a category', 'Choose what you observed before submitting.');
      return;
      }

    setSubmitting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location needed',
          'BigPush Watchdog needs your location to attach it to the report.'
          );
        setSubmitting(false);
        return;
        }

      const position = await Location.getCurrentPositionAsync({});

      const { threadCount } = await submitCommunityReport({
        projectId,
        category,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        reporterName: reporterName.trim() || undefined,
        reporterPhone: reporterPhone.trim() || undefined,
        });

      navigation.replace('Confirmation', { projectName, threadCount });
      } catch (err) {
      Alert.alert('Couldn\'t submit', err.message);
      } finally {
      setSubmitting(false);
      }
    }

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Report a problem</Text>
    <Text style={styles.subtitle}>{projectName}</Text>

    <Text style={styles.label}>What did you see?</Text>
    {REPORT_CATEGORIES.map((option) => (
      <TouchableOpacity
      key={option.value}
      style={[styles.categoryButton, category === option.value && styles.categoryButtonSelected]}
      onPress={() => setCategory(option.value)}
      >
      <Text
      style={[styles.categoryButtonText, category === option.value && styles.categoryButtonTextSelected]}
      >
      {option.label}
      </Text>
      </TouchableOpacity>
      ))}

    <Text style={styles.label}>Your name (optional)</Text>
    <TextInput style={styles.input} value={reporterName} onChangeText={setReporterName} placeholder="Optional" />

    <Text style={styles.label}>Your phone (optional)</Text>
    <TextInput
    style={styles.input}
    value={reporterPhone}
    onChangeText={setReporterPhone}
    placeholder="Optional"
    keyboardType="phone-pad"
    />

    <Text style={styles.helperText}>
    Your location is captured automatically when you submit.
    </Text>

    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit report</Text>}
    </TouchableOpacity>
    </View>
    );
  }

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginTop: 16, marginBottom: 8 },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    },
  categoryButtonSelected: { backgroundColor: '#c62828', borderColor: '#c62828' },
  categoryButtonText: { fontSize: 14, color: '#333' },
  categoryButtonTextSelected: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    },
  helperText: { fontSize: 12, color: '#888', marginTop: 16 },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  });
