import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export default function AdminDashboard({ navigation }) {
  // Mock data for Admin MVP dashboard
  const user = { name: "Aditi Sharma", role: "Finance Head" };
  
  const metrics = [
    { label: "Pending Verification", value: "12", color: COLORS.accent },
    { label: "Approved Today", value: "8", color: COLORS.green },
    { label: "Rejected", value: "1", color: COLORS.red },
    { label: "Avg TAT", value: "4h", color: COLORS.blue },
  ];

  const recentApps = [
    { id: "OBL-849201", dealer: "Rajesh Kumar", status: "Pending Finance", time: "2h ago" },
    { id: "OBL-849190", dealer: "Singh Traders", status: "Pending Legal", time: "5h ago" },
    { id: "OBL-849185", dealer: "Metro Ceramics", status: "Approved", time: "1d ago" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Admin Portal</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
          <Image source={require('../../../logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* KPI Metrics */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((item, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Action Queue */}
        <View style={styles.queueHeader}>
          <Text style={styles.sectionTitle}>Action Queue</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AppList')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        
        {recentApps.map((app, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.appCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AppList')}
          >
            <View style={styles.appCardRow}>
              <View style={styles.appInfo}>
                <Text style={styles.appId}>{app.id}</Text>
                <Text style={styles.appDealer}>{app.dealer}</Text>
              </View>
              <View style={styles.appStatusBox}>
                <Text style={styles.appTime}>{app.time}</Text>
                <View style={[
                  styles.statusBadge, 
                  app.status === 'Approved' ? styles.statusBadgeSuccess : styles.statusBadgeWarning
                ]}>
                  <Text style={[
                    styles.statusText,
                    app.status === 'Approved' ? styles.statusTextSuccess : styles.statusTextWarning
                  ]}>{app.status}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* System Alerts */}
        <Text style={styles.sectionTitle}>System Alerts</Text>
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>TAT Breach Warning</Text>
            <Text style={styles.alertText}>3 applications in Legal Queue have breached the 24-hour SLA.</Text>
          </View>
        </View>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  
  header: { 
    padding: 24, 
    paddingTop: 60, 
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: COLORS.accent, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  userName: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  userRole: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  logo: { width: 100, height: 35 },
  
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16, marginTop: 8 },
  
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surface2,
    padding: 16,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  metricLabel: { color: COLORS.textSecondary, fontSize: 12 },

  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { color: COLORS.accent, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  
  appCard: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appInfo: { flex: 1 },
  appId: { color: COLORS.text, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  appDealer: { color: COLORS.textSecondary, fontSize: 13 },
  appStatusBox: { alignItems: 'flex-end' },
  appTime: { color: COLORS.textMuted, fontSize: 11, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeWarning: { backgroundColor: 'rgba(255, 204, 0, 0.15)' },
  statusBadgeSuccess: { backgroundColor: 'rgba(40, 136, 64, 0.15)' },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  statusTextWarning: { color: COLORS.accent },
  statusTextSuccess: { color: COLORS.green },

  alertCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(235, 87, 87, 0.1)', // Light red
    padding: 16,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.red,
    alignItems: 'center',
  },
  alertIcon: { fontSize: 24, marginRight: 12 },
  alertContent: { flex: 1 },
  alertTitle: { color: COLORS.red, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  alertText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
});
