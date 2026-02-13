import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Archive() {
  const router = useRouter();
  const [thoughts, setThoughts] = useState([]);
  const [editingThought, setEditingThought] = useState(null);

  useEffect(() => {
    loadThoughts();
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

  const deleteThought = async (id) => {
    Alert.alert(
      'Delete Thought',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = thoughts.filter((t) => t.id !== id);
            setThoughts(updated);
            await AsyncStorage.setItem('thoughts', JSON.stringify(updated));
          },
        },
      ]
    );
  };

  const updateThought = async (id, newText) => {
    const updated = thoughts.map((t) =>
      t.id === id ? { ...t, text: newText } : t
    );
    setThoughts(updated);
    await AsyncStorage.setItem('thoughts', JSON.stringify(updated));
    setEditingThought(null);
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
    });
  };

  return (
    <LinearGradient
      colors={['#F8E6CF', '#BFDCDC']}
      locations={[0, 0.9]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your Thoughts</Text>
        
        {thoughts.length === 0 ? (
          <Text style={styles.emptyText}>No thoughts yet!</Text>
        ) : (
          thoughts.map((thought) => (
            <View key={thought.id} style={styles.thoughtCard}>
              {editingThought?.id === thought.id ? (
                <View>
                  <TextInput
                    style={styles.editInput}
                    value={editingThought.text}
                    onChangeText={(text) =>
                      setEditingThought({ ...editingThought, text })
                    }
                    multiline
                    autoFocus
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      onPress={() =>
                        updateThought(editingThought.id, editingThought.text)
                      }
                      style={styles.saveButton}
                    >
                      <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEditingThought(null)}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.thoughtText}>{thought.text}</Text>
                  <Text style={styles.thoughtDate}>
                    {formatDate(thought.timestamp)}
                  </Text>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      onPress={() => setEditingThought(thought)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => deleteThought(thought.id)}
                      style={styles.actionButton}
                    >
                      <Text style={[styles.actionText, styles.deleteText]}>
                        🗑️ Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#8A8177',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontFamily: 'Nunito',
    fontSize: 28,
    color: '#8A8177',
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: '#A39A90',
    textAlign: 'center',
    marginTop: 60,
    fontStyle: 'italic',
  },
  thoughtCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  thoughtText: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: '#5A5148',
    lineHeight: 24,
    marginBottom: 12,
  },
  thoughtDate: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: '#A39A90',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(138, 129, 119, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: '#8A8177',
  },
  deleteText: {
    color: '#C85450',
  },
  editInput: {
    fontFamily: 'Nunito',
    fontSize: 16,
    color: '#5A5148',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#6B9B6E',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveText: {
    fontFamily: 'Nunito',
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'rgba(138, 129, 119, 0.1)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelText: {
    fontFamily: 'Nunito',
    color: '#8A8177',
    fontWeight: '600',
  },
});
