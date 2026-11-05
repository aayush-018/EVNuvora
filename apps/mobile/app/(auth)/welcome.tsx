import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui';
import { colors, spacing, typography } from '../../theme';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/evnuvora-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>India's Smart EV Network</Text>
        <Text style={styles.description}>
          Discover verified charging stations, reserve slots at verified private & commercial hosts, and charge hassle-free across India.
        </Text>
      </View>

      <View style={styles.buttonGroup}>
        <Button
          title="Login"
          variant="primary"
          onPress={() => router.push('/(auth)/login')}
          style={styles.btn}
        />
        <Button
          title="Create New Account"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
          style={styles.btn}
        />
        <Button
          title="Continue as Guest"
          variant="ghost"
          onPress={() => router.replace('/(driver)/(home)')}
          style={styles.guestBtn}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 280,
    height: 120,
    marginBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
  btn: {
    width: '100%',
  },
  guestBtn: {
    marginTop: spacing.xs,
  },
});