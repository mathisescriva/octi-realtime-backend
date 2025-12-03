# OCTI Realtime Backend

Backend Node.js/TypeScript pour l'agent IA vocal OCTI utilisant l'API OpenAI Realtime (GA).

## 🎯 Objectif

Backend simple, fiable et réutilisable qui fait le proxy entre le frontend et l'API OpenAI Realtime pour permettre une communication speech-to-speech en temps réel avec une latence minimale.

**Conforme à la documentation OpenAI Realtime API GA** - Utilise les dernières spécifications de l'API.

## ✨ Fonctionnalités

- ✅ **WebSocket Proxy** : Proxy bidirectionnel entre frontend et OpenAI Realtime API
- ✅ **Sessions Éphémères** : Route `/api/session` pour créer des sessions éphémères (WebRTC)
- ✅ **Audio Streaming** : Support PCM16 avec Base64 encoding via `input_audio_buffer.append`
- ✅ **Voice Activity Detection** : Utilise `semantic_vad` pour détection automatique de la parole
- ✅ **Multi-Agent Ready** : Architecture extensible pour plusieurs agents
- ✅ **Production Ready** : Prêt pour déploiement sur Render, Railway, etc.

## 🚀 Démarrage rapide

### Prérequis

- Node.js ≥ 20
- npm ou yarn
- Clé API OpenAI avec accès à l'API Realtime

### Installation

```bash
# Cloner le repository
git clone <your-repo-url>
cd octi-realtime-backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env et remplir vos variables
# Notamment OPENAI_API_KEY et OCTI_SYSTEM_PROMPT
```

### Configuration (.env)

```env
PORT=8080
NODE_ENV=development
OPENAI_API_KEY=sk-xxx
OPENAI_REALTIME_MODEL=gpt-realtime
OCTI_SYSTEM_PROMPT="Tu es OCTI, l'assistant vocal intelligent..."
OCTI_DEFAULT_VOICE=alloy
OCTI_PROMPT_ID=pmpt_xxx  # Optionnel : utiliser un prompt ID au lieu de instructions
```

### Lancer en développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:8080`.

### Build et production

```bash
# Compiler TypeScript
npm run build

# Lancer le serveur
npm start
```

## 📡 API Endpoints

### GET /health

Vérifie que le serveur est opérationnel.

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "octi-realtime-backend"
}
```

### GET /api/session

Crée une session éphémère OpenAI Realtime. Utilisé par les frontends WebRTC (comme le repo de référence OpenAI).

**Réponse :**
```json
{
  "object": "realtime.session",
  "id": "sess_xxx",
  "model": "gpt-realtime",
  "client_secret": {
    "value": "ek_xxx",
    "expires_at": 1234567890
  },
  ...
}
```

### POST /api/client-secret

Génère une clé éphémère pour connexion directe à OpenAI (alternative à `/api/session`).

### WebSocket /ws/realtime

Endpoint WebSocket pour conversation directe. Voir [Protocole WebSocket](#-protocole-websocket) ci-dessous.

## 📡 Protocole WebSocket

### Endpoint

```
wss://<BACKEND_DOMAIN>/ws/realtime
```

### Messages Frontend → Backend

#### 1. Démarrer la conversation

```json
{ "type": "start_conversation" }
```

#### 2. Envoyer un chunk audio (binaire)

Envoyé en `ArrayBuffer` (PCM16, 24kHz), pas de JSON. Le backend convertit automatiquement en Base64 et l'envoie via `input_audio_buffer.append`.

```javascript
ws.send(pcm16Buffer);
```

#### 3. Fin de la parole utilisateur

```json
{ "type": "user_audio_end" }
```

**Note :** Avec `semantic_vad` activé, ce message n'est généralement pas nécessaire car OpenAI détecte automatiquement la fin de parole.

#### 4. Reset session

```json
{ "type": "reset_session" }
```

### Messages Backend → Frontend

#### 1. Backend prêt

```json
{ "type": "ready" }
```

Envoyé automatiquement lorsque la session Realtime est initialisée et confirmée par OpenAI.

#### 2. Chunk audio du modèle (binaire)

Audio PCM16 (24kHz) à jouer directement. Reçu en `ArrayBuffer`.

#### 3. Fin de la réponse vocale

```json
{ "type": "bot_audio_end" }
```

#### 4. Transcription texte (optionnel, pour affichage)

```json
{ "type": "transcript_delta", "text": "..." }
```

#### 5. Erreur

```json
{ "type": "error", "message": "..." }
```

## 🏗️ Architecture

```
src/
  server.ts                 # Point d'entrée du serveur
  app/
    index.ts                # Configuration Express
    httpRoutes/
      healthRoute.ts        # Route GET /health
      sessionRoute.ts      # Route GET /api/session (sessions éphémères)
      clientSecretRoute.ts # Route POST /api/client-secret
    wsHandlers/
      realtimeHandler.ts    # Handler WebSocket principal
  core/
    realtime/
      OpenAIRealtimeClient.ts  # Client WebSocket OpenAI
      types.ts                 # Types pour l'API Realtime (GA)
    agents/
      AgentConfig.ts          # Configuration générique d'agent
      octiAgent.ts            # Configuration spécifique OCTI
    sessions/
      SessionManager.ts       # Gestionnaire de sessions
  config/
    env.ts                    # Configuration environnement
    logger.ts                 # Logger Pino
  utils/
    wsMessages.ts             # Types et helpers messages WS
    errors.ts                 # Erreurs personnalisées
```

## 📝 Exemple d'utilisation (Frontend WebSocket)

```javascript
const ws = new WebSocket('wss://your-backend.com/ws/realtime');

ws.onopen = () => {
  console.log('Connexion établie');
};

ws.onmessage = (event) => {
  // Message JSON
  if (typeof event.data === 'string') {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case 'ready':
        console.log('Backend prêt');
        break;
      case 'bot_audio_end':
        console.log('Réponse audio terminée');
        break;
      case 'transcript_delta':
        console.log('Transcription:', message.text);
        break;
      case 'error':
        console.error('Erreur:', message.message);
        break;
    }
  } 
  // Audio binaire (PCM16, 24kHz)
  else {
    const audioBuffer = event.data;
    // Jouer l'audio
    playAudio(audioBuffer);
  }
};

// Démarrer la conversation
ws.send(JSON.stringify({ type: 'start_conversation' }));

// Envoyer un chunk audio (PCM16, 24kHz)
ws.send(audioChunk);

// Signaler la fin de l'audio utilisateur (optionnel avec VAD)
ws.send(JSON.stringify({ type: 'user_audio_end' }));
```

## 🌐 Utilisation avec un Frontend Personnalisé

### Option 1 : WebSocket Direct (comme `voice-agent.html`)

Votre frontend se connecte directement au WebSocket `/ws/realtime` et envoie/reçoit de l'audio PCM16.

**Avantages :**
- Contrôle total sur l'audio
- Simple à implémenter
- Pas de dépendances externes

**Exemple :** Voir `examples/voice-agent.html`

### Option 2 : WebRTC via Sessions Éphémères (comme le repo de référence OpenAI)

Votre frontend utilise `/api/session` pour obtenir une clé éphémère et se connecte directement à OpenAI via WebRTC.

**Avantages :**
- Meilleure latence (connexion directe)
- Gestion automatique de l'audio par WebRTC
- Support des interruptions et guardrails

**Exemple :** Voir le repo `reference-agents/` (non inclus dans ce repo)

## 🚢 Déploiement

### Sur Render

1. Créer un nouveau **Web Service** sur Render
2. Connecter votre repository GitHub
3. Configurer :
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Environment Variables** : Ajouter toutes les variables de `.env.example`
4. Déployer

Le service sera accessible sur `https://your-service.onrender.com`

### Sur Railway / Heroku / Autres

Même principe : configurer les variables d'environnement et utiliser `npm start` comme commande de démarrage.

### Variables d'environnement requises

- `OPENAI_API_KEY` : **Requis** - Votre clé API OpenAI
- `OCTI_SYSTEM_PROMPT` ou `OCTI_PROMPT_ID` : **Requis** - Instructions ou ID de prompt
- `PORT` : Port d'écoute (défaut: 8080)
- `OPENAI_REALTIME_MODEL` : Modèle à utiliser (défaut: `gpt-realtime`)
- `OCTI_DEFAULT_VOICE` : Voix à utiliser (défaut: `alloy`)

## 🧪 Tests

### Vérifier que le serveur répond

```bash
curl http://localhost:8080/health
```

### Tester la route /api/session

```bash
curl http://localhost:8080/api/session
```

### Tester avec le frontend d'exemple

```bash
# Démarrer un serveur HTTP simple
python3 -m http.server 8000

# Ouvrir http://localhost:8000/examples/voice-agent.html
```

## 📦 Dépendances

- **express** : Serveur HTTP
- **ws** : WebSocket
- **dotenv** : Variables d'environnement
- **pino** : Logger performant
- **typescript** : Compilation TypeScript

## 🔒 Sécurité

- ✅ Ne jamais commiter le fichier `.env`
- ✅ Utiliser des variables d'environnement pour les secrets
- ✅ Valider tous les messages WebSocket entrants
- ✅ Gérer proprement les erreurs et fermer les connexions
- ✅ CORS configuré pour permettre les requêtes frontend

## 🎯 Conformité avec OpenAI Realtime API GA

Ce backend est conforme à la documentation officielle OpenAI Realtime API (GA) :

- ✅ Structure `session.update` conforme
- ✅ Utilisation de `input_audio_buffer.append` avec Base64
- ✅ Support de `semantic_vad` pour la détection de parole
- ✅ Support des prompts par ID (`prompt.id`)
- ✅ Format audio PCM16 à 24kHz
- ✅ Gestion correcte des événements GA (`response.output_audio.delta`, etc.)

## 📄 Licence

MIT

## 🤝 Contribution

Ce projet est une baseline propre et fonctionnelle. Pour ajouter de nouveaux agents ou fonctionnalités :

1. Créer un nouveau fichier dans `src/core/agents/`
2. Ajouter la configuration dans `src/core/sessions/SessionManager.ts`
3. Suivre l'architecture existante
