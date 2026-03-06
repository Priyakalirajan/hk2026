import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';
import { API_BASE } from '../../constants/apiEndpoints';

export default function ERPIntegration({ navigation }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  
  // Mock App Data ready for ERP push
  const appData = {
    id: "OBL-849185",
    dealer: "Metro Ceramics",
    gstin: "07AAAAA0000A1Z5",
    pan: "ABCDE1234F",
    approvedBy: "Finance Head (A. Sharma)",
  };

  const handlePushToERP = async () => {
    setSyncing(true);
    
    try {
      // Mock ERP Push
      // const response = await fetch(`${API_BASE}/erp/sync`, { method: 'POST', body: JSON.stringify(appData) });
      
      setTimeout(() => {
        setSyncing(false);
        setSynced(true);
        Alert.alert('ERP Sync Successful', 'Dealer Code has been generated and Welcome Kit sent.');
      }, 2500);

    } catch (e) {
      setSyncing(false);
      Alert.alert('Sync Failed', 'Could not connect to Microsoft BC 365. Please retry.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>ERP Integration</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtn}>Close</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Microsoft BC 365 Sync Portal</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>The following application has been fully approved and is ready to be pushed to the ERP system to generate a Dealer Code.</Text>
        </View>

        <View style={styles.dataCard}>
          <View style={styles.dataHeader}>
            <Text style={styles.dataTitle}>Approval Finalized</Text>
            <Text style={styles.dataId}>{appData.id}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Dealer Name:</Text>
            <Text style={styles.dataValue}>{appData.dealer}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>GSTIN:</Text>
            <Text style={styles.dataValue}>{appData.gstin}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>PAN:</Text>
            <Text style={styles.dataValue}>{appData.pan}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Final Approver:</Text>
            <Text style={styles.dataValue}>{appData.approvedBy}</Text>
          </View>
        </View>

        {synced ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Successfully Synced</Text>
            <Text style={styles.successText}>Dealer Code: <Text style={{fontWeight: 'bold'}}>DLR-8849</Text></Text>
            <Text style={styles.successText}>Welcome Kit dispatched via Email/SMS.</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.syncBtn} 
            onPress={handlePushToERP}
            disabled={syncing}
            activeOpacity={0.8}
          >
            {syncing ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ActivityIndicator color={COLORS.bg} size="small" style={{marginRight: 12}} />
                <Text style={styles.syncBtnText}>Connecting to BC 365...</Text>
              </View>
            ) : (
              <Text style={styles.syncBtnText}>Push to ERP & Generate Code</Text>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>
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
    borderBottomColor: COLORS.border,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerTitle: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 14 },
  closeBtn: { color: COLORS.textSecondary, fontSize: 16 },

  scrollContent: { padding: 24 },

  infoBox: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    padding: 16,
    borderRadius: RADIUS.md,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  infoText: { color: COLORS.textMuted, fontSize: 14, lineHeight: 22 },

  dataCard: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dataHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dataTitle: { color: COLORS.green, fontSize: 16, fontWeight: 'bold' },
  dataId: { color: COLORS.textMuted, fontSize: 14 },
  
  dataRow: { flexDirection: 'row', marginBottom: 16 },
  dataLabel: { width: 120, color: COLORS.textSecondary, fontSize: 14 },
  dataValue: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '500' },

  syncBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' },

  successCard: {
    backgroundColor: 'rgba(40, 136, 64, 0.1)',
    padding: 24,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { color: COLORS.green, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  successText: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4, textAlign: 'center' },
});
