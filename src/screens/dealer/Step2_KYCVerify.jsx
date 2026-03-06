import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { API_BASE } from '../../constants/apiEndpoints';

export default function Step2_KYCVerify({ route, navigation }) {
  const { formData } = route.params;
  
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  
  const [panVerified, setPanVerified] = useState(false);
  const [panLoading, setPanLoading] = useState(false);
  
  const handleVerifyPAN = async () => {
    if (panNumber.length !== 10) {
      Alert.alert('Invalid PAN', 'PAN must be exactly 10 characters.');
      return;
    }
    
    setPanLoading(true);
    try {
      // Mock API call for Hackathon MVP
      setTimeout(() => {
        setPanLoading(false);
        setPanVerified(true);
      }, 1500);
    } catch (e) {
      setPanLoading(false);
      Alert.alert('Verification Failed', 'Could not verify PAN. Please try again.');
    }
  };

  const handleNext = () => {
    if (!panVerified) {
      Alert.alert('KYC Pending', 'Please verify your PAN to proceed.');
      return;
    }
    navigation.navigate('Step3', { formData: { ...formData, panNumber, aadhaarNumber } });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../../logo.png')} style={styles.headerLogo} resizeMode="contain" />
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
          
          {panVerified && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Name on PAN: <Text style={{fontWeight: 'bold'}}>MATCHED</Text></Text>
              <Text style={styles.successText}>Status: <Text style={{color: COLORS.green}}>ACTIVE</Text></Text>
            </View>
          )}
        </View>

        {/* Aadhaar Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aadhaar Number (Optional)</Text>
          <Text style={styles.cardSubtitle}>Faster processing if Aadhaar is linked to phone.</Text>
          
          <View style={styles.verifyRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="12-digit Aadhaar Number"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={12}
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
            />
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.nextBtn, !panVerified && styles.nextBtnDisabled]} onPress={handleNext} disabled={!panVerified}>
          <Text style={styles.nextBtnText}>Next: Bank & GST</Text>
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
