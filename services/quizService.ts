import { Quiz, Question } from '@/types/quiz';
import OpenAI from 'openai';

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export async function generateQuiz(text: string, title: string): Promise<Quiz> {
  try {
    const prompt = `
Analyse le texte suivant et génère exactement 5 questions de quiz avec 4 options de réponse chacune.
Le quiz doit être basé sur le contenu du texte fourni.

Texte à analyser:
"${text}"

Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact:
{
  "questions": [
    {
      "question": "Question basée sur le texte",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option correcte (doit être identique à une des options)"
    }
  ]
}

Règles importantes:
- Génère exactement 5 questions
- Chaque question doit avoir exactement 4 options
- Les questions doivent être pertinentes par rapport au texte
- Une seule réponse correcte par question
- Le correctAnswer doit correspondre exactement à une des options
- Utilise un français correct
- Varie les types de questions (compréhension, détails, analyse, etc.)
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en création de quiz éducatifs. Tu génères des questions pertinentes et bien formulées basées sur le texte fourni. Réponds uniquement avec du JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Aucune réponse reçue de l\'IA');
    }

    // Parse la réponse JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      throw new Error('Réponse invalide de l\'IA');
    }

    // Validation de la structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Structure de réponse invalide');
    }

    // Validation des questions
    const validatedQuestions: Question[] = parsedResponse.questions.map((q: any, index: number) => {
      if (!q.question || !Array.isArray(q.options) || !q.correctAnswer) {
        throw new Error(`Question ${index + 1} invalide`);
      }

      if (q.options.length !== 4) {
        throw new Error(`Question ${index + 1} doit avoir exactement 4 options`);
      }

      if (!q.options.includes(q.correctAnswer)) {
        throw new Error(`Question ${index + 1}: la réponse correcte ne correspond à aucune option`);
      }

      return {
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()),
        correctAnswer: q.correctAnswer.trim()
      };
    });

    if (validatedQuestions.length === 0) {
      throw new Error('Aucune question valide générée');
    }

    const quiz: Quiz = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      questions: validatedQuestions,
      createdAt: new Date().toISOString()
    };

    return quiz;

  } catch (error) {
    console.error('Erreur lors de la génération du quiz:', error);
    
    // En cas d'erreur, on peut soit relancer l'erreur, soit utiliser un fallback
    if (error instanceof Error) {
      throw new Error(`Erreur IA: ${error.message}`);
    } else {
      throw new Error('Erreur inconnue lors de la génération du quiz');
    }
  }
}

// Fonction de fallback en cas d'échec de l'IA
export async function generateQuizFallback(text: string, title: string): Promise<Quiz> {
  // Questions génériques basées sur l'analyse du texte
  const fallbackQuestions: Question[] = [
    {
      question: "Quelle est l'idée principale abordée dans le texte ?",
      options: [
        "Le concept central développé dans le passage",
        "Une idée secondaire mentionnée",
        "Un détail technique spécifique",
        "Une conclusion générale"
      ],
      correctAnswer: "Le concept central développé dans le passage"
    },
    {
      question: "Quel élément important est mis en évidence ?",
      options: [
        "Un aspect technique",
        "L'élément clé du sujet traité",
        "Une information contextuelle",
        "Un exemple illustratif"
      ],
      correctAnswer: "L'élément clé du sujet traité"
    },
    {
      question: "Selon le texte, quelle conclusion peut-on tirer ?",
      options: [
        "Une interprétation personnelle",
        "La conclusion logique du développement",
        "Une hypothèse non confirmée",
        "Un point de vue alternatif"
      ],
      correctAnswer: "La conclusion logique du développement"
    }
  ];

  const quiz: Quiz = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: title,
    questions: fallbackQuestions,
    createdAt: new Date().toISOString()
  };

  return quiz;
}