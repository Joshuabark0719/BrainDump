import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [currentThought, setCurrentThought] = useState('');
  const [thoughts, setThoughts] = useState([]);
  const [thoughtCount, setThoughtCount] = useState(0);
  
  // Animation values
  const bubbleOpacity = useRef(new Animated.Value(1)).current;
  const bubbleY = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    loadThoughts();
    loadCounter();
  }, []);

  const loadThoughts = async () => {
    try {
      const stored = await AsyncStorage.getItem('thoughts');
      if (stored) {
        setThoughts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading thoughts:', error);
    }
  };

  const loadCounter = async () => {
    try {
      const count = await AsyncStorage.getItem('thoughtCount');
      if (count) {
        setThoughtCount(parseInt(count));
      }
    } catch (error) {
      console.error('Error loading counter:', error);
    }
  };

  const saveThought = async () => {
    if (!currentThought.trim()) return;

    // Animate bubble floating away
    setShowSuccessAnimation(true);
    
    Animated.parallel([
      Animated.timing(bubbleOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleY, {
        toValue: -150,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(bubbleScale, {
        toValue: 0.8,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      bubbleOpacity.setValue(1);
      bubbleY.setValue(0);
      bubbleScale.setValue(1);
      setShowSuccessAnimation(false);
    });

    const newThought = {
      id: Date.now().toString(),
      text: currentThought,
      timestamp: new Date().toISOString(),
      archived: false,
    };

    const updatedThoughts = [newThought, ...thoughts];
    setThoughts(updatedThoughts);
    
    const newCount = thoughtCount + 1;
    setThoughtCount(newCount);

    try {
      await AsyncStorage.setItem('thoughts', JSON.stringify(updatedThoughts));
      await AsyncStorage.setItem('thoughtCount', newCount.toString());
    } catch (error) {
      console.error('Error saving thought:', error);
    }

    setTimeout(() => {
      setCurrentThought('');
    }, 400);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <LinearGradient
      colors={['#F8E6CF', '#BFDCDC']}
      locations={[0, 0.9]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push('/zen-mode')}
              style={styles.zenButton}
            >
              <Text style={styles.zenButtonText}>Zen Mode</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/archive')}
              style={styles.archiveButton}
            >
              <Text style={styles.archiveButtonText}>📦</Text>
            </TouchableOpacity>
          </View>

          {/* Cat Image */}
          <Image
            source={require('../assets/cat.png')}
            style={styles.cat}
          />

          {/* Title */}
          <Text style={styles.title}>How was today?</Text>
          <Text style={styles.date}>{dateString}</Text>

          {/* Thought Counter */}
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {thoughtCount} thoughts offloaded
            </Text>
          </View>

          {/* Input Card with Animation */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: bubbleOpacity,
                transform: [
                  { translateY: bubbleY },
                  { scale: bubbleScale },
                ],
              },
            ]}
          >
            <TextInput
              placeholder="What's on your mind?"
              placeholderTextColor="#B0A79E"
              multiline
              style={styles.input}
              value={currentThought}
              onChangeText={setCurrentThought}
              onSubmitEditing={saveThought}
            />
            
            <TouchableOpacity
              onPress={saveThought}
              style={styles.releaseButton}
              disabled={!currentThought.trim()}
            >
              <Text style={styles.releaseText}>
                {currentThought.trim() ? 'Release →' : 'Type to release'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Success Animation */}
          {showSuccessAnimation && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✓ Thought released</Text>
            </View>
          )}

          {/* Recent Thoughts Preview */}
          {thoughts.length > 0 && (
            <View style={styles.recentContainer}>
              <Text style={styles.recentTitle}>Recent thoughts</Text>
              {thoughts.slice(0, 3).map((thought) => (
                <View key={thought.id} style={styles.recentThought}>
                  <Text style={styles.recentText} numberOfLines={2}>
                    {thought.text}
                  </Text>
                  <Text style={styles.recentDate}>
                    {formatDate(thought.timestamp)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  zenButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zenButtonText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#8A8177',
    fontWeight: '600',
  },
  archiveButton: {
    padding: 10,
  },
  archiveButtonText: {
    fontSize: 18,
    color: '#8A8177',
  },
  cat: {
    width: 96,
    height: 96,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: 18,
    color: '#8A8177',
    marginBottom: 4,
    textAlign: 'center',
  },
  date: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#A39A90',
    marginBottom: 20,
    textAlign: 'center',
  },
  counterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  counterText: {
    fontFamily: 'Nunito',
    fontSize: 15,
    color: '#8A8177',
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    minHeight: 180,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 20,
  },
  input: {
    fontFamily: 'Nunito',
    fontSize: 16,
    lineHeight: 24,
    color: '#5A5148',
    minHeight: 120,
    textAlignVertical: 'top',
    textAlign: 'center',  // ← CENTERS TEXT IN BOX
  },
  releaseButton: {
    alignSelf: 'center',  // ← CENTERS BUTTON
    backgroundColor: 'rgba(138, 129, 119, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  releaseText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: '#8A8177',
    fontWeight: '500',
  },
  successContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  successText: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: '#6B9B6E',
    fontWeight: '500',
  },
  recentContainer: {
    width: '100%',
    marginTop: 20,
  },
  recentTitle: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: '#8A8177',
    fontWeight: '500',
    marginBottom: 15,
  },
  recentThought: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  recentText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#5A5148',
    lineHeight: 20,
    marginBottom: 8,
  },
  recentDate: {
    fontFamily: 'Nunito',
    fontSize: 12,
    color: '#A39A90',
  },
});
