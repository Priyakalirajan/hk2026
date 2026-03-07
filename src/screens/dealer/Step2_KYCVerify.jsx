import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '@services/index';
import { API_BASE, KYC_ENDPOINTS } from '@services/index';
import apiClient from '@services/index';

export default function Step2_KYCVerify({ route, navigation }) {
  const { formData } = route.params;
  
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  
  const [panVerified, setPanVerified] = useState(false);
  const [panData, setPanData] = useState(null);
  const [panLoading, setPanLoading] = useState(false);

  // Aadhaar State
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [aadhaarOTP, setAadhaarOTP] = useState('');
  const [txnId, setTxnId] = useState('');
  
  const [saving, setSaving] = useState(false);

  const handleVerifyPAN = async () => {
    if (panNumber.length !== 10) {
      Alert.alert('Invalid PAN', 'PAN must be exactly 10 characters.');
      return;
    }
    
    setPanLoading(true);
    try {
      // Real API call to our PG Backend -> Sandbox.co.in
      const res = await apiClient.post('/kyc/pan', {
        panNumber,
        applicationId: formData.applicationId || 'NEW_APP'
      });
      
      if (res.data?.success) {
        setPanData(res.data.data);
        setPanVerified(true);
      } else {
        Alert.alert('Verification Failed', res.data?.error || 'Could not verify PAN.');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Network error or backend issue.');
    } finally {
      setPanLoading(false);
    }
  };

  const handleSendAadhaarOTP = async () => {
    if (aadhaarNumber.length !== 12) {
      Alert.alert('Invalid', 'Aadhaar must be exactly 12 digits.');
      return;
    }
    setAadhaarLoading(true);
    try {
      const res = await apiClient.post('/kyc/aadhaar/send-otp', {
        aadhaarNumber,
        applicationId: formData.applicationId || 'NEW_APP'
      });
      if (res.data?.success) {
        setTxnId(res.data.data.txnId);
        setShowOTPInput(true);
        Alert.alert('OTP Sent', 'An OTP has been sent to your Aadhaar-linked mobile number.');
      } else {
        Alert.alert('Failed', res.data?.error || 'Could not send OTP.');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Network error.');
    } finally {
      setAadhaarLoading(false);
    }
  };

  const handleVerifyAadhaarOTP = async () => {
    if (aadhaarOTP.length < 4) {
      Alert.alert('Invalid', 'Please enter a valid OTP.');
      return;
    }
    setAadhaarLoading(true);
    try {
      const res = await apiClient.post('/kyc/aadhaar/verify-otp', {
        otp: aadhaarOTP,
        txnId,
        applicationId: formData.applicationId || 'NEW_APP'
      });
      if (res.data?.success && res.data.data?.verified) {
        setAadhaarVerified(true);
        setShowOTPInput(false);
        Alert.alert('Verified', 'Aadhaar verified successfully!');
      } else {
        Alert.alert('Failed', res.data?.error || 'Invalid OTP.');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Network error.');
    } finally {
      setAadhaarLoading(false);
    }
  };

  const handleNext = async () => {
    if (!panVerified || !aadhaarVerified) {
      Alert.alert('KYC Pending', 'Please verify both PAN and Aadhaar to proceed.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch(`/applications/${formData.applicationId || 'NEW_APP'}/step`, {
        step: 2,
        data: { panNumber, aadhaarNumber, panData }
      });
      navigation.navigate('Step3', { formData: { ...formData, panNumber, aadhaarNumber } });
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to save KYC details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Step 2: Identity Verification</Text>
        <Text style={styles.headerSubtitle}>We need to verify your PAN and Aadhaar (Optional)</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* PAN Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PAN Verification *</Text>
          <Text style={styles.cardSubtitle}>Enter your 10-digit Permanent Account Number.</Text>
          
          <View style={styles.verifyRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 12 }, panVerified && styles.inputSuccess]}
              placeholder="e.g. ABCDE1234F"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              maxLength={10}
              value={panNumber}
              onChangeText={(txt) => setPanNumber(txt.toUpperCase())}
              editable={!panVerified}
            />
            {panVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.badgeText}>✓ Verified</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.actionBtn} onPress={handleVerifyPAN} disabled={panLoading}>
                {panLoading ? (
                  <ActivityIndicator color={COLORS.bg} size="small" />
                ) : (
                  <Text style={styles.actionBtnText}>Verify</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {panVerified && panData && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Name on PAN: <Text style={{fontWeight: 'bold', color: COLORS.text}}>{panData.legalName}</Text></Text>
              <Text style={styles.successText}>Status: <Text style={{color: COLORS.green}}>{panData.status}</Text></Text>
              <Text style={styles.successText}>Type: <Text style={{color: COLORS.textSecondary}}>{panData.entityCategory}</Text></Text>
            </View>
          )}
        </View>

        {/* Aadhaar Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aadhaar Verification *</Text>
          <Text style={styles.cardSubtitle}>Enter your 12-digit Aadhaar Number.</Text>
          
          <View style={styles.verifyRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 12 }, aadhaarVerified && styles.inputSuccess]}
              placeholder="e.g. 123456789012"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={12}
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
              editable={!aadhaarVerified && !showOTPInput}
            />
            {aadhaarVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.badgeText}>✓ Verified</Text>
              </View>
            ) : showOTPInput ? null : (
              <TouchableOpacity style={styles.actionBtn} onPress={handleSendAadhaarOTP} disabled={aadhaarLoading}>
                {aadhaarLoading ? (
                  <ActivityIndicator color={COLORS.bg} size="small" />
                ) : (
                  <Text style={styles.actionBtnText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {showOTPInput && !aadhaarVerified && (
            <View style={[styles.verifyRow, { marginTop: 16 }]}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 12 }]}
                placeholder="Enter OTP"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={aadhaarOTP}
                onChangeText={setAadhaarOTP}
              />
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.green }]} onPress={handleVerifyAadhaarOTP} disabled={aadhaarLoading}>
                {aadhaarLoading ? (
                  <ActivityIndicator color={COLORS.bg} size="small" />
                ) : (
                  <Text style={styles.actionBtnText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.nextBtn, (!panVerified || !aadhaarVerified) && styles.nextBtnDisabled]} onPress={handleNext} disabled={!panVerified || !aadhaarVerified || saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.bg} size="small" />
          ) : (
            <Text style={styles.nextBtnText}>Next: GST & Bank Details</Text>
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
  
  verifyRow: { flexDirection: 'row', alignItems: 'center' },
  
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
    paddingHorizontal: 20, 
    borderRadius: RADIUS.md, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  actionBtnText: { color: COLORS.bg, fontSize: 15, fontWeight: 'bold' },
  
  verifiedBadge: { 
    backgroundColor: 'rgba(40, 136, 64, 0.15)', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  badgeText: { color: COLORS.green, fontWeight: 'bold' },
  
  successBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(40, 136, 64, 0.05)',
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.green,
  },
  successText: { color: COLORS.textMuted, fontSize: 13, marginBottom: 4 },

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
