import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../../constants/theme';
import { API_BASE } from '../../constants/apiEndpoints';

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState('Dealer'); // 'Dealer' | 'Internal'
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setLoading(true);
    try {
      // Demo logic for judges
      if (phone === '9999999999') {
         setTimeout(() => {
           setLoading(false);
           navigation.navigate('OTPVerify', { phone, role, demo: true });
         }, 800);
         return;
      }
      
      // Actual API call
      // const response = await fetch(`${API_BASE}/auth/send-otp`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone, role })
      // });
      // const data = await response.json();
      
      // Mocking for now since we don't have the real auth backend built yet
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('OTPVerify', { phone, role });
      }, 1200);

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../../logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your mobile number to securely login</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'Dealer' && styles.roleBtnActive]} 
            onPress={() => setRole('Dealer')}>
            <Text style={[styles.roleText, role === 'Dealer' && styles.roleTextActive]}>Dealer/Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'Internal' && styles.roleBtnActive]} 
            onPress={() => setRole('Internal')}>
            <Text style={[styles.roleText, role === 'Internal' && styles.roleTextActive]}>Internal Team</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSendOTP} disabled={loading}>
          <Text style={styles.submitBtnText}>{loading ? 'Sending OTP...' : 'Get OTP'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.demoBtn} onPress={() => setPhone('9999999999')}>
          <Text style={styles.demoText}>Use Demo Number (9999999999)</Text>
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
