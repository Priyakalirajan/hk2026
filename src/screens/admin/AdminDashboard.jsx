import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '@services/index';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@services/index';

export default function AdminDashboard({ navigation }) {
  const user = { name: "Admin Setup", role: "Management" };
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await apiClient.get('/applications');
        if (res.data?.success) {
          setApps(res.data.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    const unsubscribe = navigation.addListener('focus', fetchApps);
    fetchApps();
    return unsubscribe;
  }, [navigation]);

  const pendingCount = apps.filter(a => !['APPROVED', 'REJECTED', 'DRAFT'].includes(a.status)).length;
  const approvedCount = apps.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = apps.filter(a => a.status === 'REJECTED').length;

  const metrics = [
    { label: "Pending Verification", value: pendingCount.toString(), color: COLORS.accent },
    { label: "Total Approved", value: approvedCount.toString(), color: COLORS.green },
    { label: "Total Rejected", value: rejectedCount.toString(), color: COLORS.red },
    { label: "Avg TAT", value: "24h", color: COLORS.blue },
  ];

  const recentApps = apps.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image source={require('@assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, {user.name.split(' ')[0]} 👋</Text>
          <Text style={styles.greetingSub}>Here's what's happening today.</Text>
        </View>
        
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
        
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.accent} style={{marginVertical: 20}} />
        ) : recentApps.length === 0 ? (
          <Text style={{color: COLORS.textMuted, fontSize: 13, marginBottom: 20}}>No applications found.</Text>
        ) : recentApps.map((app, index) => {
          const formattedDate = new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          return (
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
                  <Text style={styles.appTime}>{formattedDate}</Text>
                  <View style={[
                    styles.statusBadge, 
                    app.status === 'APPROVED' ? styles.statusBadgeSuccess : styles.statusBadgeWarning
                  ]}>
                    <Text style={[
                      styles.statusText,
                      app.status === 'APPROVED' ? styles.statusTextSuccess : styles.statusTextWarning
                    ]}>{app.status?.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* System Alerts */}
        <Text style={styles.sectionTitle}>System Alerts</Text>
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={24} color={COLORS.red} style={{ marginRight: 12 }} />
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
  logo: { width: 120, height: 35 },
  notificationBtn: { padding: 8, backgroundColor: COLORS.surface2, borderRadius: 20 },
  notificationDot: { position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.red },
  
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  greetingSection: { marginBottom: 24 },
  greetingTitle: { color: COLORS.text, fontSize: 26, fontWeight: 'bold' },
  greetingSub: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  
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
