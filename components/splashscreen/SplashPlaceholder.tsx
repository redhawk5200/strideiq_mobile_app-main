import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function SplashPlaceholder() {
  return (
    <LinearGradient
      colors={['#023FB7', '#B550B2']}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Image
        source={require('../../assets/splashlogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 200,
    height: 200
  }
});