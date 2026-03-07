import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS } from '@services/index';
import { LogOut } from 'lucide-react-native';
import apiClient from '@services/index';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({ name: 'Loading...', role: 'Dealer' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.success) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => navigation.replace('Login') }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Settings</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name ? user.name.substring(0,2).toUpperCase() : 'UU'}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.role}>{user.role === 'dealer' ? 'Dealer / Partner' : user.role}</Text>
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
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 16, width: '100%', borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  logoutBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});
