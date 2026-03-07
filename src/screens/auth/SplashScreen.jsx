import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { COLORS, FONTS } from '@services/index';

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        navigation.replace('Login');
      }, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image 
          source={require('@assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.branding}>SwiftOnboard</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#050505' // Dark color requested by user
  },
  content: {
    alignItems: 'center'
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  branding: { 
    color: COLORS.accent, 
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
