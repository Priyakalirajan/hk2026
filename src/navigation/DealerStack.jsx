import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@services/index';
import { Home, FileText, User, Plus } from 'lucide-react-native';

import HomeScreen from '../screens/dealer/HomeScreen';
import ApplicationTracker from '../screens/dealer/ApplicationTracker';
import Step1_BusinessInfo from '../screens/dealer/Step1_BusinessInfo';
import Step2_KYCVerify from '../screens/dealer/Step2_KYCVerify';
import Step3_BankDetails from '../screens/dealer/Step3_BankDetails';
import Step4_Documents from '../screens/dealer/Step4_Documents';
import Step5_Declaration from '../screens/dealer/Step5_Declaration';
import SubmitSuccess from '../screens/dealer/SubmitSuccess';
import ProfileScreen from '../screens/dealer/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Step1" component={Step1_BusinessInfo} />
      <Stack.Screen name="Step2" component={Step2_KYCVerify} />
      <Stack.Screen name="Step3" component={Step3_BankDetails} />
      <Stack.Screen name="Step4" component={Step4_Documents} />
      <Stack.Screen name="Step5" component={Step5_Declaration} />
      <Stack.Screen name="Success" component={SubmitSuccess} />
    </Stack.Navigator>
  );
}

// Custom Apply Button mapping
const ApplyButton = ({ children, onPress, navigation }) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    }}
    onPress={() => navigation.navigate('ApplyStack')}
  >
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: COLORS.accent,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: COLORS.surface,
    }}>
      <Plus color={COLORS.bg} size={32} />
    </View>
  </TouchableOpacity>
);

export default function DealerStack({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') return <Home color={color} size={size} />;
          if (route.name === 'Track') return <FileText color={color} size={size} />;
          if (route.name === 'Profile') return <User color={color} size={size} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Track" component={ApplicationTracker} options={{ tabBarLabel: 'Track' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
