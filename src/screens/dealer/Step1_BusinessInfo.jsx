import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '@services/index';
import apiClient from '@services/index';

export default function Step1_BusinessInfo({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!formData.name || !formData.dob || !formData.address) {
      Alert.alert('Missing Fields', 'Please fill in all mandatory fields before proceeding.');
      return;
    }

    setLoading(true);
    try {
      // Create new application
      const createRes = await apiClient.post('/applications');
      if (createRes.data?.success) {
        const appId = createRes.data.data.applicationId;
        
        // Save Step 1 data
        await apiClient.patch(`/applications/${appId}/step`, {
          step: 1,
          data: formData
        });

        navigation.navigate('Step2', { formData: { ...formData, applicationId: appId } });
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to start application. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Step 1: Business Profile</Text>
        <Text style={styles.headerSubtitle}>Tell us about your organization</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="As per Aadhaar/PAN"
            placeholderTextColor={COLORS.textMuted}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={COLORS.textMuted}
            value={formData.dob}
            onChangeText={(text) => setFormData({ ...formData, dob: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Address *</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Enter complete address"
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 Have your PAN and Aadhaar details ready for the next step.</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.bg} size="small" />
          ) : (
            <Text style={styles.nextBtnText}>Next: KYC Details</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { 
    padding: 24, 
    paddingTop: 60, 
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerTitle: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 14 },
  
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  inputGroup: { marginBottom: 20 },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    padding: 16,
    fontSize: 16,
  },

  infoBox: {
    backgroundColor: COLORS.surface3,
    padding: 16,
    borderRadius: RADIUS.md,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  infoText: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },

  footer: { 
    padding: 24, 
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border 
  },
  nextBtn: { 
    backgroundColor: COLORS.accent, 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center' 
  },
  nextBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' }
});
