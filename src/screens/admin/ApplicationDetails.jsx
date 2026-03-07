import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { COLORS, RADIUS } from '@services/index';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@services/index';

export default function ApplicationDetails({ route, navigation }) {
  // Use passed app data as initial state for basic info
  const initialApp = route.params?.app || { id: "OBL-849201", dealer: "Rajesh Kumar", type: "Dealer", status: "FINANCE_REVIEW", date: "Oct 24", flagged: false };
  const [app, setApp] = useState(initialApp);
  const [appDetails, setAppDetails] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        const res = await apiClient.get(`/applications/${app.id}`);
        if (res.data?.success) {
          setAppDetails(res.data.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setFetching(false);
      }
    };
    fetchFullDetails();
  }, [app.id]);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/workflow/${app.id}/approve`);
      if (res.data?.success) {
        Alert.alert('Approved', `Application advanced to ${res.data.data.newStage}`);
        setApp({ ...app, status: res.data.data.newStage });
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to approve application');
    } finally {
      setLoading(false);
    }
  };

  const handlePushERP = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/erp/${app.id}/push`);
      if (res.data?.success) {
        Alert.alert('ERP Integrated', `Dealer Code: ${res.data.data.dealerCode}`);
        setApp({ ...app, status: 'APPROVED' });
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to integrate with ERP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Details</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusBanner}>
          <Ionicons name="time" size={24} color={COLORS.bg} style={{ marginRight: 12 }} />
          <View>
            <Text style={styles.bannerTitle}>{app.status === 'APPROVED' ? 'Approved' : 'Pending ' + app.status?.replace(/_/g, ' ')}</Text>
            <Text style={styles.bannerSub}>{app.status === 'APPROVED' ? 'Integration Complete' : 'Waiting on departmental action'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Application Info</Text>
            <Text style={styles.appId}>{app.id}</Text>
          </View>
          {fetching ? (
            <ActivityIndicator color={COLORS.accent} />
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Applicant Name</Text>
                <Text style={styles.value}>{appDetails?.step1_business?.name || app.dealer}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date of Birth</Text>
                <Text style={styles.value}>{appDetails?.step1_business?.dob || '-'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Address</Text>
                <Text style={[styles.value, { flex: 1, textAlign: 'right', marginLeft: 16 }]} numberOfLines={3}>{appDetails?.step1_business?.address || '-'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Submitted On</Text>
                <Text style={styles.value}>{app.date}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Live KYC Status</Text>
          </View>
          
          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step2_kyc?.aadhaarNumber ? "checkmark-circle" : "close-circle"} size={20} color={appDetails?.step2_kyc?.aadhaarNumber ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>Aadhaar {appDetails?.step2_kyc?.aadhaarNumber ? `Verified (${appDetails.step2_kyc.aadhaarNumber})` : 'Missing'}</Text>
          </View>
          
          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step2_kyc?.panNumber ? "checkmark-circle" : "close-circle"} size={20} color={appDetails?.step2_kyc?.panNumber ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>PAN {appDetails?.step2_kyc?.panNumber ? `Active (${appDetails.step2_kyc.panNumber})` : 'Missing'}</Text>
          </View>

          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step3_bank?.gstin ? "checkmark-circle" : "close-circle"} size={20} color={appDetails?.step3_bank?.gstin ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>GSTIN {appDetails?.step3_bank?.gstin ? 'Verified' : 'Missing'}</Text>
          </View>

          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step3_bank?.bankAccount ? "checkmark-circle" : "close-circle"} size={20} color={appDetails?.step3_bank?.bankAccount ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>Penny Drop Bank Verified</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Documents & Declaration</Text>
          </View>
          
          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step4_docs?.pan ? "document-text" : "document-outline"} size={20} color={appDetails?.step4_docs?.pan ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>PAN Card {appDetails?.step4_docs?.pan ? '(Attached)' : '(Missing)'}</Text>
          </View>
          {appDetails?.step4_docs?.pan && typeof appDetails.step4_docs.pan === 'string' && appDetails.step4_docs.pan.startsWith('data:image') && (
            <Image source={{ uri: appDetails.step4_docs.pan }} style={styles.docImagePreview} resizeMode="cover" />
          )}

          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step4_docs?.gst ? "document-text" : "document-outline"} size={20} color={appDetails?.step4_docs?.gst ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>GST Certificate {appDetails?.step4_docs?.gst ? '(Attached)' : '(Missing)'}</Text>
          </View>
          {appDetails?.step4_docs?.gst && typeof appDetails.step4_docs.gst === 'string' && appDetails.step4_docs.gst.startsWith('data:image') && (
            <Image source={{ uri: appDetails.step4_docs.gst }} style={styles.docImagePreview} resizeMode="cover" />
          )}

          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step4_docs?.bank ? "document-text" : "document-outline"} size={20} color={appDetails?.step4_docs?.bank ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>Bank Statement {appDetails?.step4_docs?.bank ? '(Attached)' : '(Missing)'}</Text>
          </View>
          {appDetails?.step4_docs?.bank && typeof appDetails.step4_docs.bank === 'string' && appDetails.step4_docs.bank.startsWith('data:image') && (
            <Image source={{ uri: appDetails.step4_docs.bank }} style={styles.docImagePreview} resizeMode="cover" />
          )}

          <View style={styles.kycRow}>
            <Ionicons name={appDetails?.step5_terms?.agreed ? "checkmark-circle" : "close-circle"} size={20} color={appDetails?.step5_terms?.agreed ? COLORS.green : COLORS.red} style={styles.kycIcon} />
            <Text style={styles.kycText}>Dealer Agreement {appDetails?.step5_terms?.agreed ? '(Signed)' : '(Pending)'}</Text>
          </View>
        </View>

        <View style={styles.actionBtns}>
          {app.status !== 'APPROVED' && (
            <TouchableOpacity style={[styles.btn, styles.btnReject]} disabled={loading}>
              <Text style={styles.btnTextReject}>Reject</Text>
            </TouchableOpacity>
          )}

          {app.status === 'IT_ERP' ? (
            <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={handlePushERP} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.bg} /> : <Text style={styles.btnTextApprove}>Push to ERP</Text>}
            </TouchableOpacity>
          ) : app.status !== 'APPROVED' ? (
            <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={handleApprove} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.bg} /> : <Text style={styles.btnTextApprove}>Approve & Forward</Text>}
            </TouchableOpacity>
          ) : null}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { padding: 24, paddingTop: 60, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  backBtn: { padding: 4 },
  
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  statusBanner: { flexDirection: 'row', backgroundColor: COLORS.accent, padding: 20, borderRadius: RADIUS.lg, alignItems: 'center', marginBottom: 24 },
  bannerTitle: { color: COLORS.bg, fontSize: 18, fontWeight: 'bold' },
  bannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  
  card: { backgroundColor: COLORS.surface2, padding: 20, borderRadius: RADIUS.md, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  appId: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: COLORS.textSecondary, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  
  kycRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  kycIcon: { marginRight: 12 },
  kycText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },

  actionBtns: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { flex: 1, paddingVertical: 16, borderRadius: RADIUS.md, alignItems: 'center' },
  btnReject: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: COLORS.red, marginRight: 8 },
  btnApprove: { backgroundColor: COLORS.accent, marginLeft: 8 },
  btnTextReject: { color: COLORS.red, fontSize: 16, fontWeight: 'bold' },
  btnTextApprove: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' },
  docImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
  }
});
