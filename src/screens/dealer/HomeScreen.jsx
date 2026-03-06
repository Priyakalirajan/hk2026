import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export default function HomeScreen({ navigation }) {
  // Mock data for MVP dashboard
  const user = { name: "Rajesh Kumar", role: "Dealer" };
  const apps = [
    { id: "OBL-849201", status: "Under Review", date: "Oct 24, 2025", step: "Finance Approval" }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <Image source={require('../../../logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Quick Actions / Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Active App</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
          <View style={[styles.statCard, {backgroundColor: 'rgba(40, 136, 64, 0.1)'}]}>
            <Text style={[styles.statValue, {color: COLORS.green}]}>0</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        {/* Active Application Card */}
        <Text style={styles.sectionTitle}>Recent Applications</Text>
        
        {apps.map((app, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.appCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Track')}
          >
            <View style={styles.appCardHeader}>
              <Text style={styles.appId}>{app.id}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{app.status}</Text>
              </View>
            </View>
            
            <View style={styles.appCardBody}>
              <View style={styles.appDetail}>
                <Text style={styles.detailLabel}>Submitted</Text>
                <Text style={styles.detailValue}>{app.date}</Text>
              </View>
              <View style={styles.appDetail}>
                <Text style={styles.detailLabel}>Current Stage</Text>
                <Text style={styles.detailValue}>{app.step}</Text>
              </View>
            </View>
            
            <View style={styles.appCardFooter}>
              <Text style={styles.footerText}>Tap to view full timeline →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Notifications / Alerts */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.notificationCard}>
          <View style={styles.dot} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Application Received</Text>
            <Text style={styles.notificationText}>Your application {apps[0].id} has been received and is currently under review by the Sales Team.</Text>
            <Text style={styles.notificationTime}>2 hours ago</Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button to start new application if needed, though they only have 1 usually */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Apply')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    borderBottomColor: COLORS.border
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 4 },
  userName: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  logo: { width: 100, height: 35 },
  
  scrollContent: { padding: 24, paddingBottom: 100 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface2,
    padding: 16,
    borderRadius: RADIUS.md,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: COLORS.textSecondary, fontSize: 12 },

  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  
  appCard: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
    overflow: 'hidden',
  },
  appCardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  appId: { color: COLORS.accent, fontSize: 16, fontWeight: 'bold' },
  statusBadge: { 
    backgroundColor: 'rgba(255, 204, 0, 0.15)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  statusText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  
  appCardBody: { flexDirection: 'row', padding: 16 },
  appDetail: { flex: 1 },
  detailLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 4 },
  detailValue: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  
  appCardFooter: { 
    backgroundColor: COLORS.surface3, 
    padding: 12, 
    alignItems: 'center' 
  },
  footerText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '500' },

  notificationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface2,
    padding: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent, marginTop: 6, marginRight: 12 },
  notificationContent: { flex: 1 },
  notificationTitle: { color: COLORS.text, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  notificationText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  notificationTime: { color: COLORS.textMuted, fontSize: 11 },

  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { color: COLORS.bg, fontSize: 32, fontWeight: '300', marginTop: -4 },
});
