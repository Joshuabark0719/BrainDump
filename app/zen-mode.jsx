import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

export default function ZenMode() {
  const router = useRouter();
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold-in, exhale, hold-out
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);

  // Animation values
  const circleScale = useRef(new Animated.Value(1)).current;
  const centerDotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSessionCount();
    startBreathingCycle();
  }, []);

  const loadSessionCount = async () => {
    try {
      const count = await AsyncStorage.getItem('zenSessionsCompleted');
      if (count) {
        setTotalSessions(parseInt(count));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const startBreathingCycle = () => {
    runBreathingSequence();
  };

  const runBreathingSequence = () => {
    // Inhale - 4 seconds (expand)
    setBreathingPhase('inhale');
    Animated.parallel([
      Animated.timing(circleScale, {
        toValue: 1.4,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(centerDotOpacity, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(centerDotOpacity, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Hold - 2 seconds (stay expanded)
      setBreathingPhase('hold-in');
      setTimeout(() => {
        // Exhale - 4 seconds (contract)
        setBreathingPhase('exhale');
        Animated.parallel([
          Animated.timing(circleScale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(centerDotOpacity, {
              toValue: 0.4,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(centerDotOpacity, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Hold - 2 seconds (stay contracted)
          setBreathingPhase('hold-out');
          setTimeout(() => {
            setCyclesCompleted((prev) => prev + 1);
            runBreathingSequence(); // Loop forever
          }, 2000);
        });
      }, 2000);
    });
  };

  const exitSession = async () => {
    // Only count as completed if they did at least 3 cycles (36 seconds)
    if (cyclesCompleted >= 3) {
      const newTotal = totalSessions + 1;
      await AsyncStorage.setItem('zenSessionsCompleted', newTotal.toString());
      setTotalSessions(newTotal);
      setShowCompletion(true);
    } else {
      router.back();
    }
  };

  const finishCompletion = () => {
    setShowCompletion(false);
    router.back();
  };

  const getBreathingText = () => {
    switch (breathingPhase) {
      case 'inhale':
        return { main: 'BREATHE IN...', sub: 'FILLING YOUR LUNGS SLOWLY' };
      case 'hold-in':
        return { main: 'HOLD...', sub: 'KEEPING IT IN' };
      case 'exhale':
        return { main: 'BREATHE OUT...', sub: 'RELEASING SLOWLY' };
      case 'hold-out':
        return { main: 'HOLD...', sub: 'EMPTY YOUR LUNGS' };
      default:
        return { main: 'BREATHE', sub: '' };
    }
  };

  const breathingText = getBreathingText();

  if (showCompletion) {
    return (
      <LinearGradient
        colors={['#F8E6CF', '#BFDCDC']}
        locations={[0, 0.9]}
        style={styles.container}
      >
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>✨</Text>
          <Text style={styles.completionTitle}>Session Complete</Text>
          <Text style={styles.completionSubtitle}>
            You completed {cyclesCompleted} breathing cycles
          </Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.statsLabel}>Total Sessions</Text>
            <Text style={styles.statsNumber}>{totalSessions}</Text>
          </View>

          <TouchableOpacity
            onPress={finishCompletion}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#F8E6CF', '#BFDCDC']}
      locations={[0, 0.9]}
      style={styles.container}
    >
      {/* Exit Button */}
      <TouchableOpacity onPress={exitSession} style={styles.exitButton}>
        <Text style={styles.exitText}>✕</Text>
      </TouchableOpacity>

      {/* Cycles Counter (top right) */}
      <View style={styles.cyclesContainer}>
        <Text style={styles.cyclesText}>🧘 {cyclesCompleted}</Text>
      </View>

      {/* Breathing Circle */}
      <View style={styles.circleContainer}>
        <Svg height="400" width="400" style={styles.svg}>
          <Defs>
            <RadialGradient id="circleGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#D4B598" stopOpacity="1" />
              <Stop offset="100%" stopColor="#C9A581" stopOpacity="1" />
            </RadialGradient>
            <RadialGradient id="glowGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor="#E8B4A0" stopOpacity="0" />
              <Stop offset="50%" stopColor="#E8B4A0" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#E8B4A0" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Outer glow ring 1 */}
          <Circle
            cx="200"
            cy="200"
            r="180"
            fill="url(#glowGradient)"
            opacity="0.4"
          />

          {/* Outer glow ring 2 */}
          <Circle
            cx="200"
            cy="200"
            r="160"
            fill="url(#glowGradient)"
            opacity="0.6"
          />

          {/* Main breathing circle */}
          <AnimatedCircle
            cx="200"
            cy="200"
            r="120"
            fill="url(#circleGradient)"
            scale={circleScale}
          />
        </Svg>

        {/* Center pulsing dot */}
        <Animated.View
          style={[
            styles.centerDot,
            {
              opacity: centerDotOpacity,
            },
          ]}
        />
      </View>

      {/* Breathing Text */}
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>{breathingText.main}</Text>
        <Text style={styles.subText}>{breathingText.sub}</Text>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>BREATHING CYCLES</Text>
        <Text style={styles.progressNumber}>{cyclesCompleted}</Text>
      </View>
    </LinearGradient>
  );
}

// Animated Circle component
const AnimatedCircle = ({ cx, cy, r, fill, scale }) => {
  const AnimatedCircleComponent = Animated.createAnimatedComponent(Circle);
  
  return (
    <AnimatedCircleComponent
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      transform={[
        { translateX: -cx },
        { translateY: -cy },
        { scale: scale },
        { translateX: cx },
        { translateY: cy },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exitButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  exitText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  cyclesContainer: {
    position: 'absolute',
    top: 60,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    zIndex: 10,
  },
  cyclesText: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  svg: {
    position: 'absolute',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    bottom: 200,
    width: '100%',
    alignItems: 'center',
  },
  mainText: {
    fontFamily: 'Nunito',
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 12,
  },
  subText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
    letterSpacing: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  progressNumber: {
    fontFamily: 'Nunito',
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
  },
  // Completion screen styles
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  completionTitle: {
    fontFamily: 'Nunito',
    fontSize: 32,
    color: '#8A8177',
    fontWeight: '700',
    marginBottom: 12,
  },
  completionSubtitle: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: '#A39A90',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  statsLabel: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#A39A90',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsNumber: {
    fontFamily: 'Nunito',
    fontSize: 56,
    color: '#8A8177',
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: '#C9A581',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  doneButtonText: {
    fontFamily: 'Nunito',
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});