import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

export default function ApplicationTracker({ navigation }) {
  // Mock data for the timeline
  const appId = "OBL-849201";
  
  const timelineSteps = [
    { title: "Application Submitted", date: "Oct 24, 10:00 AM", status: "completed" },
    { title: "Document Verification", date: "Oct 24, 11:30 AM", status: "completed" },
    { title: "Sales Approval", date: "Oct 25, 09:15 AM", status: "completed" },
    { title: "Finance Check", date: "In Progress", status: "active" },
    { title: "Credit Control", date: "-", status: "pending" },
    { title: "Legal Review", date: "-", status: "pending" },
    { title: "ERP Integration", date: "-", status: "pending" },
    { title: "Dealer Code Generated", date: "-", status: "pending" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../../logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Application Tracker</Text>
        <Text style={styles.headerSubtitle}>ID: {appId}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.statusBox}>
          <Text style={styles.statusBoxTitle}>Current Stage</Text>
          <Text style={styles.statusBoxValue}>Finance Check</Text>
          <Text style={styles.statusBoxDesc}>Expected completion: 12 Hours</Text>
        </View>

        <View style={styles.timelineContainer}>
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1;
            
            // Determine styles based on status
            let dotColor = COLORS.border;
            let dotBg = COLORS.surface;
            let lineBg = COLORS.border;
            let titleColor = COLORS.textMuted;

            if (step.status === 'completed') {
              dotColor = COLORS.green;
              dotBg = COLORS.green;
              lineBg = COLORS.green;
              titleColor = COLORS.text;
            } else if (step.status === 'active') {
              dotColor = COLORS.accent;
              dotBg = COLORS.bg;
              titleColor = COLORS.accent;
            }

            return (
              <View key={index} style={styles.timelineRow}>
                {/* Left side: Timeline graphics */}
                <View style={styles.timelineGraphic}>
                  <View style={[styles.dot, { borderColor: dotColor, backgroundColor: dotBg }]} />
                  {!isLast && <View style={[styles.line, { backgroundColor: lineBg }]} />}
                </View>
                
                {/* Right side: Content */}
                <View style={styles.timelineContent}>
                  <Text style={[styles.stepTitle, { color: titleColor }]}>{step.title}</Text>
                  <Text style={styles.stepDate}>{step.date}</Text>
                </View>
              </View>
            );
          })}
        </View>

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
    borderBottomColor: COLORS.border
  },
  headerLogo: { width: 100, height: 35, marginBottom: 16 },
  headerTitle: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 16 },
  
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  statusBox: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    padding: 20,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 204, 0, 0.3)',
    marginBottom: 32,
    alignItems: 'center',
  },
  statusBoxTitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  statusBoxValue: { color: COLORS.accent, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  statusBoxDesc: { color: COLORS.textMuted, fontSize: 13 },

  timelineContainer: {
    paddingLeft: 8,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineGraphic: {
    alignItems: 'center',
    width: 30,
    marginRight: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 2,
  },
  line: {
    width: 2,
    height: 50,
    marginTop: -8, // slight overlap
    marginBottom: -8,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 32, // acts as spacing between items, synced with line height
    marginTop: -2, // align text with dot
  },
  stepTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  stepDate: { color: COLORS.textMuted, fontSize: 13 },
});
