# Quiz Generator App - IA Integration

Application Android native pour générer des quiz interactifs à partir de textes en utilisant l'intelligence artificielle OpenAI GPT.

## 🚀 Fonctionnalités

- **Génération IA** : Création automatique de quiz à partir de n'importe quel texte
- **Interface intuitive** : Navigation par onglets avec création et gestion de collection
- **Jeu interactif** : Interface de quiz avec scoring et résultats détaillés
- **Sauvegarde locale** : Stockage des quiz créés sur l'appareil
- **Design moderne** : Interface Material Design avec animations fluides

## 🔧 Configuration

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration OpenAI
1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Générez une clé API dans la section [API Keys](https://platform.openai.com/api-keys)
3. Copiez le fichier `.env.example` vers `.env`
4. Remplacez `your_openai_api_key_here` par votre vraie clé API

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Lancement de l'application
```bash
npm run dev
```

## 📱 Utilisation

1. **Créer un quiz** :
   - Allez dans l'onglet "Créer"
   - Donnez un titre à votre quiz
   - Collez ou tapez votre texte source
   - Appuyez sur "Générer avec l'IA"

2. **Jouer aux quiz** :
   - Allez dans l'onglet "Mes Quiz"
   - Sélectionnez un quiz et appuyez sur "Jouer"
   - Répondez aux questions et consultez vos résultats

## 🤖 IA et Génération de Quiz

L'application utilise **OpenAI GPT-3.5-turbo** pour :
- Analyser le texte fourni par l'utilisateur
- Générer 5 questions pertinentes avec 4 options chacune
- Créer des questions variées (compréhension, détails, analyse)
- Assurer la cohérence entre questions et réponses

## 🛠️ Architecture Technique

- **Framework** : Expo Router avec React Native
- **IA** : OpenAI GPT-3.5-turbo
- **Stockage** : AsyncStorage pour la persistance locale
- **Navigation** : Expo Router avec navigation par onglets
- **UI** : StyleSheet natif avec design system cohérent

## 📋 Structure du Projet

```
app/
├── (tabs)/
│   ├── index.tsx          # Écran de création de quiz
│   ├── collection.tsx     # Gestion des quiz sauvegardés
│   └── _layout.tsx        # Navigation par onglets
├── quiz/
│   └── [id].tsx          # Interface de jeu de quiz
services/
├── quizService.ts        # Intégration OpenAI
└── storageService.ts     # Gestion du stockage local
types/
└── quiz.ts              # Types TypeScript
```

## 🔒 Sécurité

- Les clés API sont stockées dans les variables d'environnement
- Validation des réponses IA avant utilisation
- Gestion d'erreurs robuste avec fallbacks

## 📈 Améliorations Futures

- Support de différents modèles IA (GPT-4, Claude, etc.)
- Personnalisation du nombre de questions
- Export/import de quiz
- Statistiques détaillées de performance
- Mode hors ligne avec cache intelligent

## 🆘 Dépannage

**Erreur "Configuration IA requise"** :
- Vérifiez que votre clé API OpenAI est correctement configurée dans `.env`
- Redémarrez l'application après avoir ajouté la clé

**Erreur de génération de quiz** :
- Vérifiez votre connexion internet
- Assurez-vous que votre clé API OpenAI est valide et a des crédits
- Le texte fourni doit être suffisamment substantiel pour générer des questions