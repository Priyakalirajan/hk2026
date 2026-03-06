import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export default function Step1_BusinessInfo({ navigation }) {
  const [formData, setFormData] = useState({
    legalName: '',
    tradeName: '',
    entityType: '',
    contactName: '',
    email: '',
  });

  const handleNext = () => {
    if (!formData.legalName || !formData.tradeName || !formData.contactName) {
      Alert.alert('Missing Fields', 'Please fill in all mandatory fields before proceeding.');
      return;
    }
    navigation.navigate('Step2', { formData });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Step 1: Business Profile</Text>
        <Text style={styles.headerSubtitle}>Tell us about your organization</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Legal Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="As per PAN card"
            placeholderTextColor={COLORS.textMuted}
            value={formData.legalName}
            onChangeText={(text) => setFormData({ ...formData, legalName: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Trade / Brand Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Acme Enterprises"
            placeholderTextColor={COLORS.textMuted}
            value={formData.tradeName}
            onChangeText={(text) => setFormData({ ...formData, tradeName: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Primary Contact Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={COLORS.textMuted}
            value={formData.contactName}
            onChangeText={(text) => setFormData({ ...formData, contactName: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="contact@company.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>💡 Have your PAN and Aadhaar details ready for the next step.</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Next: KYC Details</Text>
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
