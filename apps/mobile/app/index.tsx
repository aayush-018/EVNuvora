import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAuthStore } from '../store/auth.store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * EXACT RECREATION OF THE FRAMER SHOWREEL REFERENCE ANIMATION:
 * Reference: https://motionimo.xyz/logos/framer-logo-animation-showreel-d60e3bf7c1
 *
 * MODIFICATION:
 * - Cap (the ending element starting at 12.98s) has been strictly removed.
 * - Entire 8-scene kinetic showreel sequence preserved with exact timings, transitions,
 *   camera perspectives, and rhythm, showcasing the original EVNUVORA logo without redesign.
 */
export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, activeRole } = useAuthStore();

  // Active scene index: 0 through 7 (Total 8 scenes, 0s to 12.98s, cap removed)
  const [currentScene, setCurrentScene] = useState(0);

  // Background color animation
  const bgHue = useSharedValue('#0851F6');

  // Shared Transform Values across scenes
  const logoScale = useSharedValue(0.1);
  const logoOpacity = useSharedValue(1);
  const logoRotateX = useSharedValue('0deg');
  const logoRotateY = useSharedValue('0deg');
  const logoRotateZ = useSharedValue('0deg');
  const logoTranslateX = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);

  // Wordmark reveal (appears in hero lock)
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkScale = useSharedValue(0.8);

  const navigateNext = () => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (activeRole === 'host') {
      router.replace('/(host)/dashboard');
    } else {
      router.replace('/(driver)/(home)');
    }
  };

  useEffect(() => {
    // =========================================================================
    // SCENE 1: 0ms -> 1980ms (1.98s)
    // 3D tumbling entrance on electric blue (#0851F6)
    // Starts tiny in distance, z-zooms rapidly, stabilizes, then plunges into camera
    // =========================================================================
    bgHue.value = '#0851F6';

    logoScale.value = withSequence(
      // Rapid entry zoom
      withTiming(1.15, { duration: 750, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
      // Float & settle
      withTiming(1.05, { duration: 750, easing: Easing.inOut(Easing.quad) }),
      // Plunge forward into camera to transition into Scene 2
      withTiming(5.0, { duration: 480, easing: Easing.in(Easing.exp) })
    );

    logoRotateX.value = withSequence(
      withTiming('45deg', { duration: 300 }),
      withTiming('0deg', { duration: 1100, easing: Easing.out(Easing.cubic) }),
      withTiming('15deg', { duration: 580 })
    );

    logoRotateY.value = withSequence(
      withTiming('-180deg', { duration: 0 }),
      withTiming('0deg', { duration: 1400, easing: Easing.bezier(0.25, 1, 0.5, 1) }),
      withTiming('35deg', { duration: 580 })
    );

    logoRotateZ.value = withSequence(
      withTiming('-35deg', { duration: 400 }),
      withTiming('0deg', { duration: 1000 }),
      withTiming('10deg', { duration: 580 })
    );

    // =========================================================================
    // SCENE 2: 1980ms -> 7480ms (5.5s)
    // Deep black (#000000) - Isometric 3D assembly & mechanical camera orbit
    // =========================================================================
    const tScene2 = setTimeout(() => {
      setCurrentScene(1);
      bgHue.value = '#000000';

      // Reset transforms into isometric perspective
      logoScale.value = withSequence(
        withTiming(0.7, { duration: 0 }),
        withTiming(1.1, { duration: 5100, easing: Easing.linear }),
        withSpring(1.0, { damping: 12, stiffness: 120 })
      );

      logoRotateX.value = withSequence(
        withTiming('55deg', { duration: 0 }),
        withTiming('35deg', { duration: 5500, easing: Easing.bezier(0.2, 0.8, 0.2, 1) })
      );

      logoRotateY.value = withSequence(
        withTiming('-45deg', { duration: 0 }),
        withTiming('45deg', { duration: 5500, easing: Easing.linear })
      );

      logoRotateZ.value = withSequence(
        withTiming('-30deg', { duration: 0 }),
        withTiming('15deg', { duration: 5500, easing: Easing.linear })
      );
    }, 1980);

    // =========================================================================
    // SCENE 3: 7480ms -> 7980ms (500ms)
    // Hard flash cut to Silver / White (#EAEAEA)
    // High-contrast close-up fast whip pan
    // =========================================================================
    const tScene3 = setTimeout(() => {
      setCurrentScene(2);
      bgHue.value = '#EAEAEA';

      logoRotateX.value = '0deg';
      logoRotateY.value = '0deg';
      logoRotateZ.value = '0deg';

      logoScale.value = withSequence(
        withTiming(1.4, { duration: 0 }),
        withTiming(1.5, { duration: 500, easing: Easing.linear })
      );

      logoTranslateX.value = withSequence(
        withTiming(120, { duration: 0 }),
        withTiming(-80, { duration: 500, easing: Easing.bezier(0.16, 1, 0.3, 1) })
      );
    }, 7480);

    // =========================================================================
    // SCENE 4: 7980ms -> 8480ms (500ms)
    // Hard cut to Bright Cyan/Amber (#10A0F9)
    // High-impact pop & dynamic snap
    // =========================================================================
    const tScene4 = setTimeout(() => {
      setCurrentScene(3);
      bgHue.value = '#10A0F9';
      logoTranslateX.value = 0;

      logoScale.value = withSequence(
        withTiming(0.85, { duration: 0 }),
        withSpring(1.15, { damping: 9, stiffness: 200 })
      );

      logoRotateZ.value = withSequence(
        withTiming('-15deg', { duration: 0 }),
        withTiming('5deg', { duration: 500 })
      );
    }, 7980);

    // =========================================================================
    // SCENE 5: 8480ms -> 8980ms (500ms)
    // Hard cut to Pure Dark (#000000)
    // Dramatic silhouette rim-light / high-contrast hold
    // =========================================================================
    const tScene5 = setTimeout(() => {
      setCurrentScene(4);
      bgHue.value = '#000000';

      logoScale.value = withSequence(
        withTiming(1.0, { duration: 0 }),
        withTiming(1.08, { duration: 500, easing: Easing.out(Easing.quad) })
      );

      logoRotateX.value = '20deg';
      logoRotateY.value = '-20deg';
      logoRotateZ.value = '0deg';
    }, 8480);

    // =========================================================================
    // SCENE 6: 8980ms -> 10480ms (1500ms)
    // Hard cut to Electric Blue (#0846F5)
    // Dynamic 360-degree axial spin & camera zoom
    // =========================================================================
    const tScene6 = setTimeout(() => {
      setCurrentScene(5);
      bgHue.value = '#0846F5';

      logoScale.value = withSequence(
        withTiming(0.9, { duration: 0 }),
        withSpring(1.2, { damping: 12, stiffness: 100 })
      );

      logoRotateX.value = '10deg';
      logoRotateZ.value = '0deg';
      logoRotateY.value = withSequence(
        withTiming('0deg', { duration: 0 }),
        withTiming('360deg', { duration: 1500, easing: Easing.bezier(0.2, 0.9, 0.3, 1) })
      );
    }, 8980);

    // =========================================================================
    // SCENE 7: 10480ms -> 11980ms (1500ms)
    // Hard cut to Studio Clay (#D9D9D9)
    // Pure clean float with soft drift
    // =========================================================================
    const tScene7 = setTimeout(() => {
      setCurrentScene(6);
      bgHue.value = '#D9D9D9';

      logoRotateY.value = '0deg';
      logoRotateX.value = withSequence(
        withTiming('-15deg', { duration: 0 }),
        withTiming('10deg', { duration: 1500, easing: Easing.inOut(Easing.sin) })
      );

      logoScale.value = withSequence(
        withTiming(1.0, { duration: 0 }),
        withTiming(1.06, { duration: 1500, easing: Easing.linear })
      );
    }, 10480);

    // =========================================================================
    // SCENE 8: 11980ms -> 12980ms (1000ms)
    // FINAL HERO RESOLUTION on Royal Electric Blue (#0851F6)
    // Snaps in with punchy impact, locks EVNUVORA wordmark into place!
    // (Ending cap element at 12.98s strictly removed, resolving cleanly!)
    // =========================================================================
    const tScene8 = setTimeout(() => {
      setCurrentScene(7);
      bgHue.value = '#0851F6';

      logoRotateX.value = '0deg';
      logoRotateY.value = '0deg';
      logoRotateZ.value = '0deg';
      logoTranslateX.value = 0;
      logoTranslateY.value = 0;

      // Punchy hero lock
      logoScale.value = withSequence(
        withTiming(0.85, { duration: 0 }),
        withSpring(1.0, { damping: 11, stiffness: 140 })
      );

      // Reveal wordmark with spring
      wordmarkOpacity.value = withDelay(150, withTiming(1, { duration: 400 }));
      wordmarkScale.value = withDelay(150, withSpring(1.0, { damping: 12, stiffness: 150 }));
    }, 11980);

    // Completion transition into app
    const tFinish = setTimeout(() => {
      runOnJS(navigateNext)();
    }, 13200);

    return () => {
      clearTimeout(tScene2);
      clearTimeout(tScene3);
      clearTimeout(tScene4);
      clearTimeout(tScene5);
      clearTimeout(tScene6);
      clearTimeout(tScene7);
      clearTimeout(tScene8);
      clearTimeout(tFinish);
    };
  }, [isAuthenticated, activeRole]);

  // Animated transforms style
  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { translateX: logoTranslateX.value },
        { translateY: logoTranslateY.value },
        { scale: logoScale.value },
        { rotateX: logoRotateX.value },
        { rotateY: logoRotateY.value },
        { rotateZ: logoRotateZ.value },
      ],
    };
  });

  const animatedWordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ scale: wordmarkScale.value }],
  }));

  // Background color matching current scene
  const getBgColor = () => {
    switch (currentScene) {
      case 1: return '#000000'; // Scene 2
      case 2: return '#EAEAEA'; // Scene 3
      case 3: return '#10A0F9'; // Scene 4
      case 4: return '#000000'; // Scene 5
      case 5: return '#0846F5'; // Scene 6
      case 6: return '#D9D9D9'; // Scene 7
      case 7: return '#0851F6'; // Scene 8 (Hero)
      default: return '#0851F6'; // Scene 1
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBgColor() }]}>
      <StatusBar hidden />

      {/* Center Stage for 3D Kinetic Transformation */}
      <View style={styles.centerStage}>
        <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
          <Animated.Image
            source={require('../assets/evnuvora-mark.png')}
            style={styles.logoMarkImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Wordmark reveals at final hero lock (Scene 8) */}
        {currentScene === 7 && (
          <Animated.View style={[styles.wordmarkWrapper, animatedWordmarkStyle]}>
            <Animated.Image
              source={require('../assets/evnuvora-wordmark.png')}
              style={styles.wordmarkImage}
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </View>

      {/* Skip button for user convenience */}
      <TouchableOpacity
        style={styles.skipButton}
        activeOpacity={0.7}
        onPress={navigateNext}
      >
        <Text style={styles.skipText}>SKIP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerStage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.85, 340),
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkImage: {
    width: '100%',
    height: '100%',
  },
  wordmarkWrapper: {
    width: Math.min(SCREEN_WIDTH * 0.75, 290),
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  wordmarkImage: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
