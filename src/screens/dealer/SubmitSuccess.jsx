import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export default function SubmitSuccess({ navigation }) {
  // Mock application ID for MVP
  const appId = "OBL-" + Math.floor(100000 + Math.random() * 900000);

  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🎉</Text>
        </View>
        
        <Text style={styles.title}>Application Submitted!</Text>
        <Text style={styles.subtitle}>
          Your dealer onboarding application has been successfully submitted to Orientbell Limited.
        </Text>

        <View style={styles.idBox}>
          <Text style={styles.idLabel}>Application ID</Text>
          <Text style={styles.idValue}>{appId}</Text>
        </View>

        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>What happens next?</Text>
          <Text style={styles.stepItem}>1. Our team will verify your documents.</Text>
          <Text style={styles.stepItem}>2. Application routes through Sales & Finance.</Text>
          <Text style={styles.stepItem}>3. You receive your final Dealer Code & Welcome Kit.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => navigation.navigate('Track')}
        >
          <Text style={styles.actionBtnText}>Track Application Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeBtn} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(40, 136, 64, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.green,
  },
  iconText: { fontSize: 40 },
  
  title: { color: COLORS.green, fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  
  idBox: {
    backgroundColor: COLORS.surface2,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  idLabel: { color: COLORS.textMuted, fontSize: 13, marginBottom: 4 },
  idValue: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },

  stepsBox: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADIUS.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepsTitle: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  stepItem: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8, lineHeight: 20 },

  footer: { 
    padding: 24, 
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border 
  },
  actionBtn: { 
    backgroundColor: COLORS.accent, 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' },
  homeBtn: { 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  homeBtnText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
});
