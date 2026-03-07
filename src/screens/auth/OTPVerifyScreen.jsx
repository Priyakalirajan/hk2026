import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, FONTS, RADIUS } from '@services/index';
import { API_BASE } from '@services/index';

export default function OTPVerifyScreen({ route, navigation }) {
  const { aadhaar, txnId, role, demo } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  const inputRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // If using the demo Aadhaars, instantly fill the mock OTP 123456
    if (aadhaar === '111111111111' || aadhaar === '222222222222') {
      setTimeout(() => setOtp(['1', '2', '3', '4', '5', '6']), 600);
    }
  }, [aadhaar]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    // We remove the strict 6-digit length check so users can force an error 
    // or type any OTP if needed.
    if (!otpValue) {
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      // Let all OTPs (even the demo one) hit the backend to show the real Sandbox integration.
      // We'll rely on the backend (or our mock there) to accept '123456'.

      const response = await fetch(`${API_BASE}/kyc/aadhaar/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock' 
        },
        body: JSON.stringify({ txnId, otp: otpValue, applicationId: 'LOGIN-AUTH' })
      });
      const data = await response.json();
      
      if (data.success && data.data?.verified) {
         setLoading(false);
         // Simulate logging in after KYC auth
         navigation.replace(role === 'Dealer' ? 'DealerApp' : 'AdminApp');
      } else {
        setLoading(false);
        triggerShake();
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
        Alert.alert('Verification Failed', data.error || 'Invalid OTP');
      }

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to verify OTP with Backend.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Verify Aadhaar OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to Aadhaar linked mobile number for UID {aadhaar?.slice(-4) || 'XXXX'}</Text>

        <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={[styles.otpInput, digit && styles.otpInputActive]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
            />
          ))}
        </Animated.View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleVerify} disabled={loading}>
          <Text style={styles.submitBtnText}>{loading ? 'Verifying...' : 'Verify & Login'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resendBtn}>
          <Text style={styles.resendText}>Didn't receive code? Resend URL</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 24, paddingTop: 60 },
  backBtn: { padding: 8 },
  backText: { color: COLORS.textSecondary, fontSize: 16 },
  content: { flex: 1, padding: 24, paddingTop: 40 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 40 },
  
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  otpInputActive: { borderColor: COLORS.accent },

  submitBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  submitBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' },
  
  resendBtn: { marginTop: 24, alignItems: 'center' },
  resendText: { color: COLORS.textSecondary, textDecorationLine: 'underline' }
});
