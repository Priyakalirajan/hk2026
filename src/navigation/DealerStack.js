import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/dealer/HomeScreen';
import ApplicationTracker from '../screens/dealer/ApplicationTracker';
import Step1_BusinessInfo from '../screens/dealer/Step1_BusinessInfo';
import Step2_KYCVerify from '../screens/dealer/Step2_KYCVerify';
import Step3_BankDetails from '../screens/dealer/Step3_BankDetails';
import Step4_Documents from '../screens/dealer/Step4_Documents';
import Step5_Declaration from '../screens/dealer/Step5_Declaration';
import SubmitSuccess from '../screens/dealer/SubmitSuccess';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function OnboardingStack() {
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

export default function DealerStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused, color }) => {
          const icons = { Home: '🏠', Apply: '📋', Track: '📍' };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Apply" component={OnboardingStack} options={{ title: 'Apply' }} />
      <Tab.Screen name="Track" component={ApplicationTracker} options={{ title: 'Track' }} />
    </Tab.Navigator>
  );
}
