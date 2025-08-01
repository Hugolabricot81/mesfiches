import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quiz } from '@/types/quiz';

const QUIZZES_KEY = 'quizzes';

export async function saveQuiz(quiz: Quiz): Promise<void> {
  try {
    const existingQuizzes = await getQuizzes();
    const updatedQuizzes = [...existingQuizzes, quiz];
    await AsyncStorage.setItem(QUIZZES_KEY, JSON.stringify(updatedQuizzes));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du quiz:', error);
    throw error;
  }
}

export async function getQuizzes(): Promise<Quiz[]> {
  try {
    const quizzesJson = await AsyncStorage.getItem(QUIZZES_KEY);
    return quizzesJson ? JSON.parse(quizzesJson) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des quiz:', error);
    return [];
  }
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  try {
    const quizzes = await getQuizzes();
    return quizzes.find(quiz => quiz.id === id) || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    return null;
  }
}

export async function deleteQuiz(id: string): Promise<void> {
  try {
    const quizzes = await getQuizzes();
    const filteredQuizzes = quizzes.filter(quiz => quiz.id !== id);
    await AsyncStorage.setItem(QUIZZES_KEY, JSON.stringify(filteredQuizzes));
  } catch (error) {
    console.error('Erreur lors de la suppression du quiz:', error);
    throw error;
  }
}