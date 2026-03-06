import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { API_BASE } from '../../constants/apiEndpoints';

export default function OTPVerifyScreen({ route, navigation }) {
  const { phone, role, demo } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  const inputRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (demo) {
      setTimeout(() => setOtp(['1', '2', '3', '4', '5', '6']), 500);
    }
  }, [demo]);

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
    if (otpValue.length !== 6) {
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      // Demo login
      if (demo && otpValue === '123456') {
        setTimeout(() => {
          setLoading(false);
          navigation.replace(role === 'Dealer' ? 'DealerApp' : 'AdminApp');
        }, 800);
        return;
      }

      // Actual expected API call
      // const response = await fetch(`${API_BASE}/auth/verify-otp`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone, otp: otpValue })
      // });
      // const data = await response.json();
      
      if (otpValue === '123456') {
        setTimeout(() => {
           setLoading(false);
           navigation.replace(role === 'Dealer' ? 'DealerApp' : 'AdminApp');
        }, 1200);
      } else {
        setLoading(false);
        triggerShake();
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      }

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to verify OTP.');
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
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to +91 {phone}</Text>

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
