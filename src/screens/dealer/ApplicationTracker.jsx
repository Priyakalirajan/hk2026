import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { COLORS, RADIUS } from '@services/index';
import apiClient from '@services/index';
import { Search } from 'lucide-react-native';

export default function ApplicationTracker({ route, navigation }) {
  const initialAppId = route?.params?.appId || '';
  const [searchId, setSearchId] = useState(initialAppId);
  const [appId, setAppId] = useState(initialAppId);
  
  const [loading, setLoading] = useState(false);
  const [trackData, setTrackData] = useState(null);

  useEffect(() => {
    if (appId) {
      fetchTracking(appId);
    }
  }, [appId]);

  // If opened via bottom bar again with a different param
  useEffect(() => {
    if (route?.params?.appId && route.params.appId !== appId) {
      setSearchId(route.params.appId);
      setAppId(route.params.appId);
    }
  }, [route?.params?.appId]);

  const fetchTracking = async (idToFetch) => {
    if (!idToFetch) return;
    setLoading(true);
    try {
      // Backend route is /api/applications/:id/track
      const res = await apiClient.get(`/applications/${idToFetch}/track`);
      if (res.data?.success) {
        setTrackData(res.data.data);
      } else {
        setTrackData(null);
        Alert.alert('Error', res.data?.error || 'Could not find tracking data');
      }
    } catch (err) {
      console.log("Tracking Error:", err);
      setTrackData(null);
      Alert.alert('Not Found', 'Invalid application ID or network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchId) return;
    setAppId(searchId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Application Tracker</Text>
        
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Enter Application ID (e.g. OBL-XXX)"
            placeholderTextColor={COLORS.textMuted}
            value={searchId}
            onChangeText={setSearchId}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Search color={COLORS.bg} size={20} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {loading && <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />}
        
        {!loading && !trackData && !appId && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Enter your Application ID above to track its current progress.</Text>
          </View>
        )}

        {!loading && trackData && (
          <>
            <View style={styles.statusBox}>
              <Text style={styles.statusBoxTitle}>Current Stage</Text>
              <Text style={styles.statusBoxValue}>{trackData.currentStage?.replace(/_/g, ' ')}</Text>
              <Text style={styles.statusBoxDesc}>{trackData.completion}% Complete</Text>
            </View>

            <View style={styles.timelineContainer}>
              {trackData.timeline?.map((step, index) => {
                const isLast = index === trackData.timeline.length - 1;
                
                // Determine styles based on status
                let dotColor = COLORS.border;
                let dotBg = COLORS.surface;
                let lineBg = COLORS.border;
                let titleColor = COLORS.textMuted;
                let dateDisplay = '-';

                if (step.status === 'COMPLETED') {
                  dotColor = COLORS.green;
                  dotBg = COLORS.green;
                  lineBg = COLORS.green;
                  titleColor = COLORS.text;
                  if (step.completedAt) {
                    const d = new Date(step.completedAt);
                    dateDisplay = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                  } else {
                    dateDisplay = 'Completed';
                  }
                } else if (step.status === 'IN_PROGRESS') {
                  dotColor = COLORS.accent;
                  dotBg = COLORS.bg;
                  titleColor = COLORS.accent;
                  dateDisplay = 'In Progress';
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
                      <Text style={[styles.stepTitle, { color: titleColor }]}>{step.label}</Text>
                      <Text style={styles.stepDate}>{dateDisplay}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
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
  
  searchContainer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    height: 48,
    color: COLORS.text,
    fontSize: 16,
    marginRight: 12,
  },
  searchBtn: {
    backgroundColor: COLORS.accent,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 16, textAlign: 'center', lineHeight: 24 }
});
