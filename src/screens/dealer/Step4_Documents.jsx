import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS } from '@services/index';
import apiClient from '@services/index';

export default function Step4_Documents({ route, navigation }) {
  const { formData } = route.params || { formData: {} };
  
  const [documents, setDocuments] = useState({
    pan: false,
    gst: false,
    bank: false,
    address: false,
  });
  
  const [saving, setSaving] = useState(false);

  const handleUpload = async (docType) => {
    Alert.alert(
      'Upload Document',
      `Choose an upload method for your ${docType.toUpperCase()}`,
      [
        { text: 'Take Photo', onPress: () => pickImage(docType, true) },
        { text: 'Choose from Gallery', onPress: () => pickImage(docType, false) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const pickImage = async (docType, useCamera) => {
    const options = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    };

    try {
      let result;
      if (useCamera) {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setDocuments(prev => ({ ...prev, [docType]: base64Data }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };


  const handleNext = async () => {
    if (!documents.pan || !documents.gst || !documents.bank) {
      Alert.alert('Missing Documents', 'Please upload mandatory documents (PAN, GST, Bank Proof).');
      return;
    }
    
    setSaving(true);
    try {
      await apiClient.patch(`/applications/${formData.applicationId || 'NEW_APP'}/step`, {
        step: 4,
        data: documents
      });
      navigation.navigate('Step5', { formData: { ...formData, documents } });
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to save documents.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerTitle}>Step 4: Documents</Text>
        <Text style={styles.headerSubtitle}>Upload supporting documents for your application</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>⚠️ Ensure all uploaded images are clear and readable. Limit file size to 5MB.</Text>
        </View>

        <View style={styles.docRow}>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>PAN Card Image *</Text>
            <Text style={styles.docSubtitle}>Required for verified PAN: {formData.panNumber || 'Pending'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.uploadBtn, documents.pan && styles.uploadBtnSuccess]} 
            onPress={() => handleUpload('pan')}
          >
            <Text style={styles.uploadBtnText}>{documents.pan ? '✓ Uploaded' : 'Upload'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docRow}>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>GST Certificate *</Text>
            <Text style={styles.docSubtitle}>Required for verified GSTIN</Text>
          </View>
          <TouchableOpacity 
            style={[styles.uploadBtn, documents.gst && styles.uploadBtnSuccess]} 
            onPress={() => handleUpload('gst')}
          >
            <Text style={styles.uploadBtnText}>{documents.gst ? '✓ Uploaded' : 'Upload'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docRow}>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>Cancelled Cheque / Bank Statement *</Text>
            <Text style={styles.docSubtitle}>Must show the registered business name</Text>
          </View>
          <TouchableOpacity 
            style={[styles.uploadBtn, documents.bank && styles.uploadBtnSuccess]} 
            onPress={() => handleUpload('bank')}
          >
            <Text style={styles.uploadBtnText}>{documents.bank ? '✓ Uploaded' : 'Upload'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.docRow}>
          <View style={styles.docInfo}>
            <Text style={styles.docTitle}>Address Proof (Optional)</Text>
            <Text style={styles.docSubtitle}>Electricity Bill or Lease Agreement</Text>
          </View>
          <TouchableOpacity 
            style={[styles.uploadBtn, documents.address && styles.uploadBtnSuccess]} 
            onPress={() => handleUpload('address')}
          >
            <Text style={styles.uploadBtnText}>{documents.address ? '✓ Uploaded' : 'Upload'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextBtn, (!documents.pan || !documents.gst || !documents.bank) && styles.nextBtnDisabled]} 
          onPress={handleNext}
          disabled={!documents.pan || !documents.gst || !documents.bank || saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.bg} size="small" />
          ) : (
            <Text style={styles.nextBtnText}>Next: Declaration</Text>
          )}
        </TouchableOpacity>
      </View>
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
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 14 },
  
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  infoBox: {
    backgroundColor: 'rgba(255, 204, 0, 0.1)', // Subtle supernova
    padding: 16,
    borderRadius: RADIUS.md,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  infoText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface2,
    padding: 16,
    borderRadius: RADIUS.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docInfo: { flex: 1, paddingRight: 16 },
  docTitle: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  docSubtitle: { color: COLORS.textSecondary, fontSize: 13 },
  
  uploadBtn: {
    backgroundColor: COLORS.surface3,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadBtnSuccess: {
    backgroundColor: 'rgba(40, 136, 64, 0.15)',
    borderColor: COLORS.green,
  },
  uploadBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },

  footer: { 
    flexDirection: 'row',
    padding: 24, 
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border 
  },
  backBtn: { padding: 16, marginRight: 16, justifyContent: 'center' },
  backBtnText: { color: COLORS.textSecondary, fontSize: 16 },
  nextBtn: { 
    flex: 1,
    backgroundColor: COLORS.accent, 
    paddingVertical: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center' 
  },
  nextBtnDisabled: { backgroundColor: COLORS.border },
  nextBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' }
});
