import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, FileText } from 'lucide-react-native';
import { generateQuiz } from '@/services/quizService';
import { saveQuiz } from '@/services/storageService';

// Vérification de la clé API
const isOpenAIConfigured = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export default function CreateQuizScreen() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Afficher un avertissement si l'API OpenAI n'est pas configurée
  useEffect(() => {
    if (!isOpenAIConfigured) {
      Alert.alert(
        'Configuration requise',
        'Pour utiliser l\'IA, ajoutez votre clé API OpenAI dans les variables d\'environnement (EXPO_PUBLIC_OPENAI_API_KEY).',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const handleGenerateQuiz = async () => {
    if (!text.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un texte pour générer le quiz.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez donner un titre à votre quiz.');
      return;
    }

    setIsLoading(true);
    try {
      const quiz = await generateQuiz(text, title);
      await saveQuiz(quiz);
      
      Alert.alert(
        'Succès',
        `Votre quiz "${quiz.title}" avec ${quiz.questions.length} questions a été généré par l'IA et sauvegardé avec succès !`,
        [{ text: 'OK', onPress: () => {
          setText('');
          setTitle('');
        }}]
      );
    } catch (error) {
      console.error('Erreur génération quiz:', error);
      Alert.alert(
        'Erreur', 
        error instanceof Error ? error.message : 'Impossible de générer le quiz. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sparkles size={32} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Créer un Quiz</Text>
          <Text style={styles.subtitle}>
            Transformez n'importe quel texte en quiz interactif grâce à l'IA
          </Text>
          {!isOpenAIConfigured && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Configuration IA requise
              </Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titre du quiz</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Ex: Histoire de France, Biologie..."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Texte source</Text>
            <View style={styles.textInputContainer}>
              <FileText size={20} color="#6B7280" style={styles.textIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Collez ou tapez votre texte ici. L'IA OpenAI analysera le contenu et créera automatiquement 5 questions pertinentes avec des réponses à choix multiples..."
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.generateButton, isLoading && styles.generateButtonDisabled]}
            onPress={handleGenerateQuiz}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Sparkles size={20} color="white" />
            )}
            <Text style={styles.generateButtonText}>
              {isLoading ? 'IA en cours d\'analyse...' : 'Générer avec l\'IA'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  textInputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 200,
    position: 'relative',
  },
  textIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  textInput: {
    padding: 16,
    paddingLeft: 48,
    fontSize: 16,
    color: '#111827',
    flex: 1,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});