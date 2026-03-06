import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export default function ApplicationList({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = ['All', 'Sales', 'Finance', 'Legal', 'IT'];

  const apps = [
    { id: "OBL-849201", dealer: "Rajesh Kumar", type: "Dealer", status: "Finance Approval", date: "Oct 24", flagged: false },
    { id: "OBL-849190", dealer: "Singh Traders", type: "Corporate", status: "Legal Review", date: "Oct 24", flagged: true },
    { id: "OBL-849188", dealer: "Sri Tiles", type: "Dealer", status: "Sales Draft", date: "Oct 23", flagged: false },
    { id: "OBL-849185", dealer: "Metro Ceramics", type: "Dealer", status: "ERP Integration", date: "Oct 22", flagged: false },
  ];

  const filteredApps = apps.filter(app => {
    if (activeTab !== 'All' && !app.status.includes(activeTab)) return false;
    if (searchQuery && !app.id.includes(searchQuery) && !app.dealer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Applications</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtn}>Close</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or Dealer Name..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.resultsText}>Showing {filteredApps.length} results</Text>

        {filteredApps.map((app, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.appCard, app.flagged && styles.appCardFlagged]}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.idBox}>
                <Text style={styles.appId}>{app.id}</Text>
                {app.flagged && <Text style={styles.flagIcon}>🚩</Text>}
              </View>
              <Text style={styles.dateText}>{app.date}</Text>
            </View>
            
            <View style={styles.cardBody}>
              <Text style={styles.dealerName}>{app.dealer}</Text>
              <Text style={styles.dealerType}>{app.type}</Text>
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, { backgroundColor: app.status.includes('Draft') ? COLORS.textMuted : COLORS.accent }]} />
                <Text style={styles.statusText}>{app.status}</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>Review →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredApps.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No applications found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters.</Text>
          </View>
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
    paddingBottom: 0,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold' },
  closeBtn: { color: COLORS.textSecondary, fontSize: 16 },
  
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, paddingVertical: 12, fontSize: 15 },

  tabsContainer: { flexDirection: 'row', marginBottom: 16 },
  tabBtn: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 8,
    backgroundColor: COLORS.surface3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: 'rgba(255, 204, 0, 0.15)', borderColor: COLORS.accent },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: COLORS.accent, fontWeight: 'bold' },

  scrollContent: { padding: 24, paddingBottom: 60 },
  
  resultsText: { color: COLORS.textMuted, fontSize: 13, marginBottom: 16 },

  appCard: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appCardFlagged: { borderColor: COLORS.red, borderLeftWidth: 4 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  idBox: { flexDirection: 'row', alignItems: 'center' },
  appId: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  flagIcon: { marginLeft: 8, fontSize: 14 },
  dateText: { color: COLORS.textMuted, fontSize: 12 },
  
  cardBody: { marginBottom: 16 },
  dealerName: { color: COLORS.text, fontSize: 18, fontWeight: '600', marginBottom: 4 },
  dealerType: { color: COLORS.textSecondary, fontSize: 13 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface3, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  actionBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
