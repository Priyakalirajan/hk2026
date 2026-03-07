import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, List, User } from 'lucide-react-native';
import { COLORS } from '@services/index';

import AdminDashboard from '../screens/admin/AdminDashboard';
import ApplicationList from '../screens/admin/ApplicationList';
import AdminProfileScreen from '../screens/admin/ProfileScreen';
import ApplicationDetails from '../screens/admin/ApplicationDetails';

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
          if (route.name === 'Dashboard') return <LayoutDashboard color={color} size={size} />;
          if (route.name === 'AppList') return <List color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} options={{ tabBarLabel: 'Overview' }} />
      <Tab.Screen name="AppList" component={ApplicationList} options={{ tabBarLabel: 'Queue' }} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="AppDetails" component={ApplicationDetails} options={{ tabBarButton: () => null, tabBarVisible: false }} />
    </Tab.Navigator>
  );
}
