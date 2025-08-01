import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, CircleCheck as CheckCircle, Circle as XCircle, RotateCcw } from 'lucide-react-native';
import { getQuizById } from '@/services/storageService';
import { Quiz, Question } from '@/types/quiz';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const quizData = await getQuizById(id as string);
      if (quizData) {
        setQuiz(quizData);
      } else {
        Alert.alert('Erreur', 'Quiz non trouvé.');
        router.back();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le quiz.');
      router.back();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQuestion = quiz!.questions[currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  const getScoreMessage = () => {
    const percentage = (score / quiz!.questions.length) * 100;
    if (percentage >= 80) return 'Excellent !';
    if (percentage >= 60) return 'Bien joué !';
    if (percentage >= 40) return 'Pas mal !';
    return 'Continuez vos efforts !';
  };

  const getScoreColor = () => {
    const percentage = (score / quiz!.questions.length) * 100;
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#3B82F6';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Résultats</Text>
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Quiz terminé !</Text>
            <Text style={[styles.scoreMessage, { color: getScoreColor() }]}>
              {getScoreMessage()}
            </Text>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreText, { color: getScoreColor() }]}>
                {score}/{quiz.questions.length}
              </Text>
            </View>
            <Text style={styles.scorePercentage}>
              {Math.round((score / quiz.questions.length) * 100)}% de bonnes réponses
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <RotateCcw size={20} color="white" />
              <Text style={styles.restartButtonText}>Recommencer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backToCollectionButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.backToCollectionText}>Retour aux quiz</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quiz.title}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} / {quiz.questions.length}
        </Text>
      </View>

      <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correctAnswer;
            const isWrong = isAnswered && isSelected && !isCorrect;

            let buttonStyle = styles.answerButton;
            let textStyle = styles.answerText;
            let icon = null;

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle = [styles.answerButton, styles.correctAnswer];
                textStyle = [styles.answerText, styles.correctAnswerText];
                icon = <CheckCircle size={20} color="#10B981" />;
              } else if (isWrong) {
                buttonStyle = [styles.answerButton, styles.wrongAnswer];
                textStyle = [styles.answerText, styles.wrongAnswerText];
                icon = <XCircle size={20} color="#EF4444" />;
              }
            } else if (isSelected) {
              buttonStyle = [styles.answerButton, styles.selectedAnswer];
              textStyle = [styles.answerText, styles.selectedAnswerText];
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => handleAnswerSelect(option)}
                disabled={isAnswered}
              >
                <Text style={textStyle}>{option}</Text>
                {icon}
              </TouchableOpacity>
            );
          })}
        </View>

        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 32,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedAnswer: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF4FF',
  },
  correctAnswer: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  wrongAnswer: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  answerText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedAnswerText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  correctAnswerText: {
    color: '#10B981',
    fontWeight: '600',
  },
  wrongAnswerText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    marginTop: 32,
    marginBottom: 32,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    padding: 24,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  scoreMessage: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '700',
  },
  scorePercentage: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionsContainer: {
    gap: 16,
  },
  restartButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backToCollectionButton: {
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  backToCollectionText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});