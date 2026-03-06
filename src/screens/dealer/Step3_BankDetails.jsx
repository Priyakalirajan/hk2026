import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export default function Step3_BankDetails({ route, navigation }) {
  const { formData } = route.params || { formData: {} };
  
  const [gstin, setGstin] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  
  const [bankVerified, setBankVerified] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  
  const handleVerifyBank = async () => {
    if (bankAccount.length < 9 || ifsc.length !== 11) {
      Alert.alert('Invalid Details', 'Please enter a valid Bank Account and 11-digit IFSC code.');
      return;
    }
    
    setBankLoading(true);
    try {
      // Mock Penny Drop API call
      setTimeout(() => {
        setBankLoading(false);
        setBankVerified(true);
      }, 2000);
    } catch (e) {
      setBankLoading(false);
      Alert.alert('Verification Failed', 'Bank account could not be verified.');
    }
  };

  const handleNext = () => {
    if (!gstin || !bankVerified) {
      Alert.alert('Incomplete', 'Please provide GSTIN and verify your bank account.');
      return;
    }
    navigation.navigate('Step4', { formData: { ...formData, gstin, bankAccount, ifsc } });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../../logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Step 3: Business & Bank</Text>
        <Text style={styles.headerSubtitle}>GST Registration and Bank Account Verification</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* GST Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>GST Details *</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>GSTIN</Text>
            <TextInput
              style={styles.input}
              placeholder="15-digit GSTIN"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              maxLength={15}
              value={gstin}
              onChangeText={(txt) => setGstin(txt.toUpperCase())}
            />
          </View>
        </View>

        {/* Bank Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bank Details (Penny Drop) *</Text>
          <Text style={styles.cardSubtitle}>We will deposit ₹1 to verify your account.</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={[styles.input, bankVerified && styles.inputSuccess]}
              placeholder="e.g. 000000123456"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={bankAccount}
              onChangeText={setBankAccount}
              editable={!bankVerified}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              style={[styles.input, bankVerified && styles.inputSuccess]}
              placeholder="e.g. HDFC0001234"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              maxLength={11}
              value={ifsc}
              onChangeText={(txt) => setIfsc(txt.toUpperCase())}
              editable={!bankVerified}
            />
          </View>

          {bankVerified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.badgeText}>✓ Bank Account Verified</Text>
              <Text style={styles.successText}>Name: {formData.legalName || 'MATCHED'}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.actionBtn} onPress={handleVerifyBank} disabled={bankLoading}>
              {bankLoading ? (
                <ActivityIndicator color={COLORS.bg} size="small" />
              ) : (
                <Text style={styles.actionBtnText}>Verify Bank Account</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.nextBtn, (!gstin || !bankVerified) && styles.nextBtnDisabled]} onPress={handleNext} disabled={!gstin || !bankVerified}>
          <Text style={styles.nextBtnText}>Next: Documents</Text>
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
  headerLogo: { width: 100, height: 35, marginBottom: 16 },
  headerTitle: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 14 },
  
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  card: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 16 },
  
  inputGroup: { marginBottom: 16 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    padding: 16,
    fontSize: 16,
  },
  inputSuccess: { borderColor: COLORS.green, color: COLORS.green },
  
  actionBtn: { 
    backgroundColor: COLORS.accent, 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center',
    marginTop: 8
  },
  actionBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' },
  
  verifiedBadge: { 
    backgroundColor: 'rgba(40, 136, 64, 0.15)', 
    padding: 16, 
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.green,
    marginTop: 8
  },
  badgeText: { color: COLORS.green, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  successText: { color: COLORS.textMuted, fontSize: 13 },

  footer: { 
    flexDirection: 'row',
    padding: 24, 
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border 
  },
  backBtn: { padding: 16, marginRight: 16, justifyContent: 'center' },
  backBtnText: { color: COLORS.textSecondary, fontSize: 16 },
  nextBtn: { 
    flex: 1,
    backgroundColor: COLORS.accent, 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center' 
  },
  nextBtnDisabled: { backgroundColor: COLORS.border },
  nextBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' }
});
