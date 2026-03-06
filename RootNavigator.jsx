import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import DealerStack from './DealerStack';
import AdminStack from './AdminStack';

const Stack = createStackNavigator();

export default function RootNavigator() {
  // In production: read from SecureStore / auth context
  // For demo: start at Splash, then route based on login
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="DealerApp" component={DealerStack} />
      <Stack.Screen name="AdminApp" component={AdminStack} />
    </Stack.Navigator>
  );
}
