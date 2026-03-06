import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import AdminDashboard from '../screens/admin/AdminDashboard';
import ApplicationList from '../screens/admin/ApplicationList';
import ERPIntegration from '../screens/admin/ERPIntegration';

const Tab = createBottomTabNavigator();

export default function AdminStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'podium' : 'podium-outline';
          } else if (route.name === 'AppList') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'ERP') {
            iconName = focused ? 'sync-circle' : 'sync-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} options={{ tabBarLabel: 'Overview' }} />
      <Tab.Screen name="AppList" component={ApplicationList} options={{ tabBarLabel: 'Queue' }} />
      <Tab.Screen name="ERP" component={ERPIntegration} options={{ tabBarLabel: 'Sync' }} />
    </Tab.Navigator>
  );
}
