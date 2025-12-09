# 🎨 Guide Complet du Frontend OKTI

Guide détaillé pour comprendre et utiliser toutes les fonctionnalités du frontend OKTI Realtime.

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation et démarrage](#installation-et-démarrage)
3. [Interface utilisateur](#interface-utilisateur)
4. [Modes d'interaction](#modes-dinteraction)
5. [Push-to-Talk (PTT)](#push-to-talk-ptt)
6. [Fonctionnalités avancées](#fonctionnalités-avancées)
7. [Configuration](#configuration)
8. [Architecture technique](#architecture-technique)

---

## 🎯 Vue d'ensemble

Le frontend OKTI est une application Next.js qui permet d'interagir avec l'agent vocal OKTI via l'API OpenAI Realtime. Il offre plusieurs modes d'interaction :

- **Mode conversationnel automatique** (VAD - Voice Activity Detection)
- **Mode Push-to-Talk** (PTT)
- **Mode texte** (chat)

---

## 🚀 Installation et démarrage

### Prérequis

- Node.js >= 20.0.0
- Backend OKTI en cours d'exécution (localhost:8080 ou URL de production)

### Installation

```bash
cd reference-agents
npm install
```

### Configuration

Créez un fichier `.env.local` dans `reference-agents/` :

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

Pour la production, utilisez l'URL de votre backend déployé :
```env
NEXT_PUBLIC_BACKEND_URL=https://okti-backend.onrender.com
```

### Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

---

## 🖥️ Interface utilisateur

### En-tête

- **Logo Lexia** : Cliquez pour recharger la page
- **Titre** : "OKTI Realtime"
- **Sélecteur de scénario** : Choisissez le scénario d'agent (par défaut : `octi`)
- **Sélecteur d'agent** : Choisissez l'agent spécifique dans le scénario

### Zone principale

#### Panneau de transcription (gauche)

Affiche l'historique complet de la conversation :

- **Messages utilisateur** : Bulles noires à droite
- **Messages agent** : Bulles grises à gauche
- **Breadcrumbs** : Informations système (changement d'agent, outils appelés, etc.)
- **Transcription en temps réel** : Mise à jour pendant que l'agent parle

**Actions disponibles :**
- **Copy** : Copier tout le transcript dans le presse-papier
- **Download Audio** : Télécharger l'enregistrement audio de la session

#### Panneau de logs (droite, optionnel)

Affiche tous les événements techniques de la session :

- **Événements client** (▲ violet) : Actions envoyées au backend
- **Événements serveur** (▼ vert) : Réponses reçues du backend
- **Erreurs** : Affichées en rouge

Cliquez sur un événement pour voir les détails JSON.

### Barre d'outils inférieure

Contient tous les contrôles principaux (voir [Fonctionnalités](#fonctionnalités-avancées))

---

## 💬 Modes d'interaction

### 1. Mode conversationnel automatique (VAD)

**Par défaut** quand "Push to talk" est **décoché**.

**Fonctionnement :**
- L'agent écoute en permanence via le microphone
- Détection automatique de la parole (VAD - Voice Activity Detection)
- L'agent répond automatiquement après un silence de 500ms
- Pas besoin d'appuyer sur un bouton

**Paramètres VAD :**
- `threshold: 0.9` : Seuil de détection de la voix
- `prefix_padding_ms: 300` : Capture 300ms avant le début de la parole
- `silence_duration_ms: 500` : Silence de 500ms pour déclencher la réponse

**Quand l'utiliser :**
- Pour une conversation naturelle et fluide
- Pour des démos où l'utilisateur veut parler librement
- Pour simuler une conversation téléphonique

### 2. Mode Push-to-Talk (PTT)

**Actif** quand "Push to talk" est **coché**.

**Fonctionnement :**
- Cochez la case "Push to talk"
- Maintenez le bouton "Talk" enfoncé pour parler
- Relâchez le bouton pour envoyer votre message
- L'agent répond après que vous ayez relâché

**Étapes détaillées :**

1. **Activation** : Cochez "Push to talk"
2. **Enregistrement** : Maintenez "Talk" enfoncé et parlez
3. **Envoi** : Relâchez "Talk"
4. **Réponse** : L'agent traite et répond

**Événements techniques :**
- `onMouseDown` / `onTouchStart` : Démarre l'enregistrement
  - Envoie `input_audio_buffer.clear` : Vide le buffer audio
  - Interrompt l'agent s'il parle
- `onMouseUp` / `onTouchEnd` : Arrête l'enregistrement
  - Envoie `input_audio_buffer.commit` : Valide l'audio enregistré
  - Envoie `response.create` : Déclenche la réponse de l'agent

**Quand l'utiliser :**
- Pour éviter les interruptions accidentelles
- Pour un contrôle précis de quand parler
- Pour des environnements bruyants
- Pour éviter que l'agent ne réponde à des bruits ambiants

### 3. Mode texte

**Toujours disponible** via le champ de saisie en bas du panneau de transcription.

**Fonctionnement :**
- Tapez votre message dans le champ de texte
- Appuyez sur Entrée ou cliquez sur le bouton d'envoi
- L'agent répond vocalement (si l'audio est activé)

**Avantages :**
- Permet de poser des questions précises
- Utile si le microphone ne fonctionne pas
- Permet de copier/coller des questions

---

## 🎤 Push-to-Talk (PTT) - Détails techniques

### Implémentation

Le PTT est géré dans `App.tsx` via les fonctions :

```typescript
const handleTalkButtonDown = () => {
  if (sessionStatus !== 'CONNECTED') return;
  interrupt(); // Interrompt l'agent s'il parle
  setIsPTTUserSpeaking(true);
  sendClientEvent({ type: 'input_audio_buffer.clear' }, 'clear PTT buffer');
};

const handleTalkButtonUp = () => {
  if (sessionStatus !== 'CONNECTED' || !isPTTUserSpeaking) return;
  setIsPTTUserSpeaking(false);
  sendClientEvent({ type: 'input_audio_buffer.commit' }, 'commit PTT');
  sendClientEvent({ type: 'response.create' }, 'trigger response PTT');
};
```

### Gestion de la session

Quand le PTT est activé, le mode VAD est désactivé :

```typescript
const updateSession = (shouldTriggerResponse: boolean = false) => {
  const turnDetection = isPTTActive
    ? null  // Pas de VAD en mode PTT
    : {
        type: 'server_vad',
        threshold: 0.9,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
        create_response: true,
      };

  sendEvent({
    type: 'session.update',
    session: {
      turn_detection: turnDetection,
    },
  });
};
```

### Support tactile

Le PTT fonctionne aussi sur mobile/tablette :
- `onMouseDown` / `onMouseUp` : Desktop
- `onTouchStart` / `onTouchEnd` : Mobile/Tablette

---

## ⚙️ Fonctionnalités avancées

### 1. Connexion/Déconnexion

**Bouton "Connect" / "Disconnect"**

- **Connect** (noir) : Établit la connexion WebRTC avec OpenAI
- **Connecting...** : État de connexion en cours
- **Disconnect** (rouge) : Ferme la session et déconnecte

**Processus de connexion :**

1. Récupère une clé éphémère depuis le backend (`/api/session`)
2. Initialise la session OpenAI Realtime avec le SDK
3. Configure l'agent OKTI avec ses outils (RAG, etc.)
4. Établit la connexion WebRTC pour l'audio
5. Met à jour l'interface (statut "CONNECTED")

### 2. Audio Playback

**Checkbox "Audio playback"**

- **Coché** : L'audio de l'agent est joué via les haut-parleurs
- **Décoché** : L'audio est muet (mais toujours enregistré)

**Fonctionnement :**
- Utilise un élément `<audio>` HTML5 caché
- Le SDK OpenAI injecte le stream audio WebRTC dans cet élément
- Quand désactivé, l'audio est muté côté client ET serveur (économie de bande passante)

**Persistance :**
- L'état est sauvegardé dans `localStorage`
- Reste coché/décoché entre les sessions

### 3. Logs (Events)

**Checkbox "Logs"**

- **Coché** : Affiche le panneau de logs à droite
- **Décoché** : Masque le panneau de logs

**Contenu des logs :**
- Tous les événements WebSocket
- Appels d'outils (RAG, etc.)
- Erreurs et warnings
- Événements de transcription
- Changements d'agent (handoff)

**Utilité :**
- Debugging technique
- Compréhension du fonctionnement interne
- Vérification des appels RAG

### 4. Sélecteur de codec

**Dropdown "Codec"**

Permet de choisir le codec audio WebRTC :

- **Opus (48 kHz)** : Qualité maximale (par défaut)
- **PCMU (8 kHz)** : Simule une ligne téléphonique (G.711 μ-law)
- **PCMA (8 kHz)** : Simule une ligne téléphonique (G.711 A-law)

**Utilité :**
- Tester la qualité audio sur différentes connexions
- Simuler des appels téléphoniques réels
- Valider le comportement ASR/VAD avec bande passante limitée

**Note :** Changer le codec recharge la page pour appliquer le changement.

### 5. Enregistrement audio

**Bouton "Download Audio"**

- Enregistre automatiquement tout l'audio de la session
- Disponible uniquement quand connecté
- Télécharge un fichier audio de la conversation complète

**Format :** Dépend du codec sélectionné (généralement Opus)

### 6. Copie du transcript

**Bouton "Copy"**

- Copie tout le transcript dans le presse-papier
- Format texte brut (sans markdown)
- Utile pour sauvegarder ou partager la conversation

---

## 🔧 Configuration

### Variables d'environnement

**`.env.local` (frontend) :**

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

**Variables utilisées :**
- `NEXT_PUBLIC_BACKEND_URL` : URL du backend pour récupérer les clés éphémères

### Paramètres URL

**Query parameters :**

- `?agentConfig=octi` : Sélectionne le scénario d'agent
- `?codec=opus` : Sélectionne le codec audio

**Exemple :**
```
http://localhost:3000?agentConfig=octi&codec=opus
```

### LocalStorage

Le frontend sauvegarde automatiquement :

- `pushToTalkUI` : État de la checkbox PTT
- `logsExpanded` : État de la checkbox Logs
- `audioPlaybackEnabled` : État de la checkbox Audio playback

**Chargement au démarrage :**
- Les préférences sont restaurées automatiquement
- Par défaut : PTT décoché, Logs décochés, Audio playback décoché

---

## 🏗️ Architecture technique

### Stack technologique

- **Framework** : Next.js 15 (React 19)
- **SDK** : `@openai/agents/realtime` (OpenAI Agents SDK)
- **Styling** : Tailwind CSS
- **Audio** : WebRTC (via SDK OpenAI)
- **État** : React Hooks (useState, useRef, useEffect)

### Composants principaux

#### `App.tsx`
- Composant racine
- Gère la connexion/déconnexion
- Gère les modes PTT/VAD
- Coordonne tous les sous-composants

#### `useRealtimeSession.ts`
- Hook personnalisé pour gérer la session OpenAI
- Encapsule le SDK `RealtimeSession`
- Expose : `connect`, `disconnect`, `sendUserText`, `interrupt`, `mute`

#### `BottomToolbar.tsx`
- Barre d'outils avec tous les contrôles
- Gère les interactions PTT
- Affiche les checkboxes et sélecteurs

#### `Transcript.tsx`
- Affiche l'historique de conversation
- Gère l'input texte
- Boutons Copy et Download Audio

#### `Events.tsx`
- Affiche les logs techniques
- Panneau expandable/collapsible

### Flux de données

```
Utilisateur
    ↓
App.tsx (UI)
    ↓
useRealtimeSession (Hook)
    ↓
RealtimeSession (SDK OpenAI)
    ↓
OpenAIRealtimeWebRTC (Transport)
    ↓
Backend OKTI (/api/session pour clé éphémère)
    ↓
OpenAI Realtime API
```

### Gestion audio

1. **Microphone** : Capturé par le navigateur via `getUserMedia()`
2. **Envoi** : Stream audio envoyé via WebRTC au SDK OpenAI
3. **Réception** : Audio de l'agent reçu via WebRTC
4. **Lecture** : Injecté dans un élément `<audio>` HTML5

### Gestion des événements

Le SDK OpenAI émet de nombreux événements :

- `agent_handoff` : Changement d'agent
- `agent_tool_start` / `agent_tool_end` : Appels d'outils (RAG, etc.)
- `history_updated` : Mise à jour de l'historique
- `transport_event` : Événements WebSocket bruts

Tous ces événements sont capturés et affichés dans les logs.

---

## 📝 Exemples d'utilisation

### Scénario 1 : Conversation naturelle

1. Ouvrir `http://localhost:3000`
2. Cliquer sur "Connect"
3. Attendre la connexion
4. Parler naturellement (mode VAD activé par défaut)
5. L'agent répond automatiquement

### Scénario 2 : Démo avec PTT

1. Ouvrir `http://localhost:3000`
2. Cocher "Push to talk"
3. Cliquer sur "Connect"
4. Maintenir "Talk" et poser une question
5. Relâcher "Talk"
6. Écouter la réponse
7. Répéter pour la suite de la conversation

### Scénario 3 : Test avec texte

1. Ouvrir `http://localhost:3000`
2. Cliquer sur "Connect"
3. Décocher "Audio playback" (optionnel)
4. Taper une question dans le champ texte
5. Appuyer sur Entrée
6. Voir la transcription de la réponse

### Scénario 4 : Debug avec logs

1. Ouvrir `http://localhost:3000`
2. Cocher "Logs"
3. Cliquer sur "Connect"
4. Parler ou taper une question
5. Observer les événements dans le panneau de logs
6. Cliquer sur un événement pour voir les détails JSON

---

## 🐛 Dépannage

### Le microphone ne fonctionne pas

- Vérifier les permissions du navigateur
- Vérifier que le microphone n'est pas utilisé par une autre application
- Essayer en mode texte

### L'agent ne répond pas

- Vérifier que "Audio playback" est coché
- Vérifier la connexion (statut "CONNECTED")
- Regarder les logs pour voir les erreurs
- Vérifier que le backend est accessible

### Le PTT ne fonctionne pas

- Vérifier que "Push to talk" est coché
- Vérifier que vous êtes connecté
- Essayer de maintenir le bouton plus longtemps
- Vérifier les logs pour les erreurs

### Erreurs de connexion

- Vérifier que le backend est démarré
- Vérifier `NEXT_PUBLIC_BACKEND_URL` dans `.env.local`
- Vérifier les CORS si backend sur un autre domaine
- Regarder la console du navigateur pour les erreurs

---

## 🔗 Ressources

- **API Backend** : Voir `API.md`
- **SDK OpenAI** : https://github.com/openai/agents
- **Documentation OpenAI Realtime** : https://platform.openai.com/docs/guides/realtime

---

## 📌 Notes importantes

1. **Clés éphémères** : Le frontend récupère une nouvelle clé éphémère à chaque connexion depuis le backend
2. **WebRTC** : La connexion audio passe directement entre le navigateur et OpenAI (pas via le backend)
3. **RAG** : Les appels RAG sont gérés par l'agent et apparaissent dans les logs
4. **Persistance** : Les préférences UI sont sauvegardées dans `localStorage`
5. **Mobile** : Le PTT fonctionne aussi sur mobile/tablette avec le support tactile

---

**Dernière mise à jour** : Décembre 2024

