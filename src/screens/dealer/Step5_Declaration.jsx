import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { API_BASE } from '../../constants/apiEndpoints';

export default function Step5_Declaration({ route, navigation }) {
  const { formData } = route.params || {};
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      Alert.alert('Agreement Required', 'You must agree to the terms and conditions to submit.');
      return;
    }

    setSubmitting(true);
    try {
      // Mock API Submission to the backend we just built
      // const response = await fetch(`${API_BASE}/application/submit`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      setTimeout(() => {
        setSubmitting(false);
        navigation.replace('Success');
      }, 2000);
      
    } catch (error) {
      setSubmitting(false);
      Alert.alert('Submission Failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../../logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Step 5: Review & Submit</Text>
        <Text style={styles.headerSubtitle}>Please review your application details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Business Profile</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Legal Name</Text>
            <Text style={styles.value}>{formData?.legalName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trade Name</Text>
            <Text style={styles.value}>{formData?.tradeName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>{formData?.contactName || '-'}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>KYC & Identity</Text>
          <View style={styles.row}>
            <Text style={styles.label}>PAN Status</Text>
            <Text style={[styles.value, {color: COLORS.green}]}>Verified ({formData?.panNumber || 'ABCDE1234F'})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aadhaar</Text>
            <Text style={styles.value}>{formData?.aadhaarNumber ? 'Provided' : 'Not Provided'}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Bank & Tax Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>GSTIN</Text>
            <Text style={styles.value}>{formData?.gstin || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Account</Text>
            <Text style={[styles.value, {color: COLORS.green}]}>Verified (Penny Drop)</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={[styles.value, {color: COLORS.green, marginTop: 4}]}>✓ All mandatory documents uploaded</Text>
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I/We hereby declare that all the information provided is true, correct and complete to the best of my/our knowledge. I/We agree to the Orientbell Limited Dealership Terms and Conditions.
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={submitting}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitBtn, !agreed && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={!agreed || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.bg} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  headerLogo: { width: 100, height: 35, marginBottom: 16 },
  headerTitle: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 14 },
  
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  summaryCard: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: COLORS.textSecondary, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '500' },

  checkboxContainer: { flexDirection: 'row', marginTop: 16, marginBottom: 32, paddingRight: 16 },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  checkmark: { color: COLORS.bg, fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, flex: 1 },

  footer: { 
    flexDirection: 'row',
    padding: 24, 
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border 
  },
  backBtn: { padding: 16, marginRight: 16, justifyContent: 'center' },
  backBtnText: { color: COLORS.textSecondary, fontSize: 16 },
  submitBtn: { 
    flex: 1,
    backgroundColor: COLORS.accent, 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtnDisabled: { backgroundColor: COLORS.border },
  submitBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' }
});
