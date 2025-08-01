import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { BookOpen, Play, Trash2, Clock } from 'lucide-react-native';
import { getQuizzes, deleteQuiz } from '@/services/storageService';
import { Quiz } from '@/types/quiz';

export default function CollectionScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const loadQuizzes = async () => {
    try {
      const savedQuizzes = await getQuizzes();
      setQuizzes(savedQuizzes);
    } catch (error) {
      console.error('Erreur lors du chargement des quiz:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [])
  );

  const handlePlayQuiz = (quiz: Quiz) => {
    router.push({
      pathname: '/quiz/[id]' as any,
      params: { id: quiz.id }
    });
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    Alert.alert(
      'Supprimer le quiz',
      `Êtes-vous sûr de vouloir supprimer "${quiz.title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteQuiz(quiz.id);
              await loadQuizzes();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le quiz.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderQuizItem = ({ item }: { item: Quiz }) => (
    <View style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteQuiz(item)}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.quizInfo}>
        <View style={styles.infoItem}>
          <BookOpen size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {item.questions.length} question{item.questions.length > 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => handlePlayQuiz(item)}
      >
        <Play size={18} color="white" />
        <Text style={styles.playButtonText}>Jouer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <BookOpen size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>Aucun quiz créé</Text>
      <Text style={styles.emptySubtitle}>
        Créez votre premier quiz en allant dans l'onglet "Créer"
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Quiz</Text>
        <Text style={styles.subtitle}>
          {quizzes.length} quiz{quizzes.length > 1 ? 's' : ''} sauvegardé{quizzes.length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContainer: {
    padding: 24,
    paddingTop: 8,
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
  },
  quizInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  playButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});