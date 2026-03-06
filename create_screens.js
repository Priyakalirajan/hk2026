const fs = require('fs');
const path = require('path');

const screens = [
  { path: 'src/screens/auth/SplashScreen.jsx', name: 'SplashScreen' },
  { path: 'src/screens/auth/LoginScreen.jsx', name: 'LoginScreen' },
  { path: 'src/screens/auth/OTPVerifyScreen.jsx', name: 'OTPVerifyScreen' },
  { path: 'src/navigation/AdminStack.jsx', name: 'AdminStack' },
  { path: 'src/screens/dealer/HomeScreen.jsx', name: 'HomeScreen' },
  { path: 'src/screens/dealer/ApplicationTracker.jsx', name: 'ApplicationTracker' },
  { path: 'src/screens/dealer/Step1_BusinessInfo.jsx', name: 'Step1_BusinessInfo' },
  { path: 'src/screens/dealer/Step2_KYCVerify.jsx', name: 'Step2_KYCVerify' },
  { path: 'src/screens/dealer/Step3_BankDetails.jsx', name: 'Step3_BankDetails' },
  { path: 'src/screens/dealer/Step4_Documents.jsx', name: 'Step4_Documents' },
  { path: 'src/screens/dealer/Step5_Declaration.jsx', name: 'Step5_Declaration' },
  { path: 'src/screens/dealer/SubmitSuccess.jsx', name: 'SubmitSuccess' },
];

const template = (name) => `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ${name}() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>${name} Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0d14' },
  text: { color: '#e8eaf2', fontSize: 20 },
});
`;

screens.forEach(screen => {
  const fullPath = path.join(__dirname, screen.path);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, template(screen.name));
    console.log('Created: ' + fullPath);
  }
});
