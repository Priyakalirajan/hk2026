import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, FONTS, RADIUS } from '@services/index';
import { API_BASE } from '@services/index';

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState('Dealer'); // 'Dealer' | 'Internal'
  const [aadhaar, setAadhaar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (aadhaar.length !== 12) {
      Alert.alert('Invalid', 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    
    setLoading(true);
    try {
      // Direct Hackathon Bypass mapping to local backend
      const response = await fetch(`${API_BASE}/kyc/aadhaar/send-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock'
        },
        body: JSON.stringify({ aadhaarNumber: aadhaar, applicationId: 'LOGIN-AUTH' })
      });
      const data = await response.json();
      
      if (data.success) {
        setLoading(false);
        navigation.navigate('OTPVerify', { aadhaar, txnId: data.data.txnId, role });
      } else {
        setLoading(false);
        Alert.alert('Error', data.error || 'Failed to send OTP.');
      }
    } catch (error) {
      setLoading(false);
      // Fallback local mock if backend is down
      const txnId = 'MOCK-TXN-' + Math.floor(Math.random() * 1000);
      navigation.navigate('OTPVerify', { aadhaar, txnId, role });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Image source={require('@assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Partner Login</Text>
        <Text style={styles.subtitle}>Enter your Aadhaar number to fetch Live KYC OTP via Sandbox.co.in</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'Dealer' && styles.roleBtnActive]} 
            onPress={() => { setRole('Dealer'); setAadhaar('222222222222'); }}>
            <Text style={[styles.roleText, role === 'Dealer' && styles.roleTextActive]}>Dealer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'Internal' && styles.roleBtnActive]} 
            onPress={() => { setRole('Internal'); setAadhaar('111111111111'); }}>
            <Text style={[styles.roleText, role === 'Internal' && styles.roleTextActive]}>Internal Team</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>UID</Text>
          <TextInput
            style={styles.input}
            placeholder="12-digit Aadhaar Number"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            maxLength={12}
            value={aadhaar}
            onChangeText={setAadhaar}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSendOTP} disabled={loading}>
          <Text style={styles.submitBtnText}>{loading ? 'Generating OTP via Sandbox...' : 'Get OTP'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.demoBtn} onPress={() => setAadhaar(role === 'Dealer' ? '222222222222' : '111111111111')}>
          <Text style={styles.demoText}>Use Demo Aadhaar ({role === 'Dealer' ? 'Dealer: 2222' : 'Internal: 1111'})</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { width: 140, height: 50, marginBottom: 40, alignSelf: 'center' },
  title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 32, textAlign: 'center' },
  
  roleContainer: { flexDirection: 'row', backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, p: 4, marginBottom: 32 },
  roleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.md },
  roleBtnActive: { backgroundColor: COLORS.surface3, borderBottomWidth: 2, borderBottomColor: COLORS.accent },
  roleText: { color: COLORS.textMuted, fontWeight: '600' },
  roleTextActive: { color: COLORS.accent },

  inputContainer: { flexDirection: 'row', backgroundColor: COLORS.surface2, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  prefix: { color: COLORS.text, paddingHorizontal: 16, fontSize: 16, borderRightWidth: 1, borderRightColor: COLORS.border },
  input: { flex: 1, color: COLORS.text, padding: 16, fontSize: 16 },

  submitBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' },
  
  demoBtn: { marginTop: 24, alignItems: 'center' },
  demoText: { color: COLORS.green, textDecorationLine: 'underline' }
});
