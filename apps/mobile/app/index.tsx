import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '../store/auth.store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, activeRole } = useAuthStore();

  // Motion choreography inspired by Framer motion showreels (Gal Shir)
  const bgScale = useSharedValue(1.15);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.4);

  const markScale = useSharedValue(0.2);
  const markOpacity = useSharedValue(0);
  const markRotate = useSharedValue(-25);

  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(28);
  const wordmarkScale = useSharedValue(0.9);

  const starScale = useSharedValue(0);
  const starOpacity = useSharedValue(0);

  const taglineOpacity = useSharedValue(0);
  const taglineWidth = useSharedValue(0);

  useEffect(() => {
    // 1. Ambient cosmic glow pulse
    bgScale.value = withTiming(1.0, { duration: 2400, easing: Easing.out(Easing.cubic) });
    glowOpacity.value = withTiming(0.85, { duration: 1200, easing: Easing.out(Easing.ease) });
    glowScale.value = withTiming(1.2, { duration: 1800, easing: Easing.out(Easing.cubic) });

    // 2. Central 3D Ribbon 'E' Spring & Morph Entrance
    markScale.value = withDelay(
      150,
      withSpring(1, {
        damping: 12,
        stiffness: 110,
        mass: 0.9,
      })
    );
    markOpacity.value = withDelay(150, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
    markRotate.value = withDelay(
      150,
      withSpring(0, {
        damping: 14,
        stiffness: 95,
      })
    );

    // 3. Spark / Star Twinkle pulse
    starOpacity.value = withDelay(700, withTiming(1, { duration: 350 }));
    starScale.value = withDelay(
      700,
      withSpring(1.3, { damping: 9, stiffness: 180 }, (finished) => {
        if (finished) {
          starScale.value = withSequence(
            withTiming(1.0, { duration: 300 }),
            withRepeat(
              withSequence(
                withTiming(1.25, { duration: 700 }),
                withTiming(0.95, { duration: 700 })
              ),
              -1,
              true
            )
          );
        }
      })
    );

    // 4. Wordmark sleek reveal (staggered typography slide & tracking)
    wordmarkOpacity.value = withDelay(850, withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) }));
    wordmarkTranslateY.value = withDelay(
      850,
      withSpring(0, {
        damping: 15,
        stiffness: 110,
      })
    );
    wordmarkScale.value = withDelay(850, withTiming(1, { duration: 650 }));

    // 5. Subtitle line expand
    taglineOpacity.value = withDelay(1100, withTiming(1, { duration: 600 }));
    taglineWidth.value = withDelay(1100, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));

    // Seamless navigation transition to Home or Login
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/welcome');
      } else if (activeRole === 'host') {
        router.replace('/(host)/dashboard');
      } else {
        router.replace('/(driver)/(home)');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, activeRole]);

  // Animated Styles
  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const animatedMarkStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [
      { scale: markScale.value },
      { rotate: `${markRotate.value}deg` },
    ],
  }));

  const animatedStarStyle = useAnimatedStyle(() => ({
    opacity: starOpacity.value,
    transform: [{ scale: starScale.value }],
  }));

  const animatedWordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [
      { translateY: wordmarkTranslateY.value },
      { scale: wordmarkScale.value },
    ],
  }));

  const animatedTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const animatedDividerStyle = useAnimatedStyle(() => ({
    width: `${taglineWidth.value * 60}%`,
    opacity: taglineWidth.value * 0.4,
  }));

  return (
    <View style={styles.container}>
      {/* Dynamic Radial/Nebula Backdrop Glow */}
      <Animated.View style={[styles.glowOrb, animatedGlowStyle]} />
      <Animated.View style={[styles.secondaryGlowOrb, animatedGlowStyle]} />

      <View style={styles.centerStage}>
        {/* Main Logo Container with animated 3D ribbon mark */}
        <Animated.View style={[styles.markContainer, animatedMarkStyle]}>
          <Animated.Image
            source={require('../assets/evnuvora-mark.png')}
            style={styles.logoMark}
            resizeMode="contain"
          />
          {/* Overlay star twinkle on top-right orbit */}
          <Animated.Image
            source={require('../assets/evnuvora-star.png')}
            style={[styles.orbitStar, animatedStarStyle]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Wordmark (EVNUVORA) Reveal */}
        <Animated.View style={[styles.wordmarkContainer, animatedWordmarkStyle]}>
          <Animated.Image
            source={require('../assets/evnuvora-wordmark.png')}
            style={styles.wordmarkImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Futuristic glowing divider & tagline */}
        <Animated.View style={[styles.divider, animatedDividerStyle]} />
        <Animated.View style={[styles.taglineContainer, animatedTaglineStyle]}>
          <Text style={styles.taglineText}>INTELLIGENT EV CHARGING NETWORK</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#3875FA',
    opacity: 0.18,
    top: '30%',
    filter: Platform.OS === 'web' ? 'blur(90px)' : undefined,
  },
  secondaryGlowOrb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#B549F8',
    opacity: 0.16,
    top: '28%',
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  markContainer: {
    width: Math.min(SCREEN_WIDTH * 0.78, 320),
    height: 165,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  logoMark: {
    width: '100%',
    height: '100%',
  },
  orbitStar: {
    position: 'absolute',
    top: 10,
    right: 28,
    width: 28,
    height: 28,
  },
  wordmarkContainer: {
    width: Math.min(SCREEN_WIDTH * 0.75, 290),
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  wordmarkImage: {
    width: '100%',
    height: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: '#6A8DFF',
    marginTop: 20,
    marginBottom: 14,
    borderRadius: 1,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  taglineText: {
    color: '#8A99AD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
  },
});
