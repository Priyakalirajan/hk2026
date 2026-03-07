import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '@services/index';
import { LogOut, RefreshCcw } from 'lucide-react-native';
import { API_BASE } from '@services/index';

export default function AdminProfileScreen({ navigation }) {
  const [syncing, setSyncing] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => navigation.replace('Login') }
    ]);
  };

  const handleSyncERP = () => {
    setSyncing(true);
    // Simulate syncing all approved queues to ERP
    setTimeout(() => {
      setSyncing(false);
      Alert.alert('ERP Sync Completed', 'All newly approved KYC applications have been synced to Microsoft BC 365.');
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance Head Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AH</Text>
          </View>
          <Text style={styles.name}>Admin Head</Text>
          <Text style={styles.role}>Finance & Approvals</Text>
        </View>
        
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>System Actions</Text>
          <TouchableOpacity style={styles.syncBtn} onPress={handleSyncERP} disabled={syncing}>
            {syncing ? (
              <ActivityIndicator color={COLORS.bg} size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RefreshCcw color={COLORS.bg} size={18} style={{ marginRight: 8 }} />
                <Text style={styles.syncBtnText}>Force ERP Sync</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut color="#ef4444" size={18} style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 24, paddingTop: 60, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.accent },
  content: { padding: 24, alignItems: 'center' },
  
  card: { backgroundColor: COLORS.surface2, padding: 32, borderRadius: RADIUS.lg, width: '100%', alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: COLORS.bg },
  name: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  role: { fontSize: 14, color: COLORS.textSecondary },
  
  actionSection: { width: '100%', marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  syncBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, width: '100%', borderRadius: RADIUS.md, alignItems: 'center' },
  syncBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, width: '100%', borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  logoutBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});
