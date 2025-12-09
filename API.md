# 🔌 API Endpoints - OKTI Backend

Documentation des endpoints pour connecter votre frontend.

## ⚠️ Important : Deux approches possibles

Il existe **deux façons** de connecter un frontend à OKTI :

### 1. **Approche SDK OpenAI (recommandée - utilisée par le frontend actuel)**

Utilise `/api/session` pour obtenir une clé éphémère, puis se connecte **directement** à OpenAI via WebRTC en utilisant le SDK `@openai/agents/realtime`.

**Avantages :**
- ✅ Toutes les fonctionnalités disponibles (texte, interruption, PTT, etc.)
- ✅ Connexion directe à OpenAI (meilleure latence)
- ✅ Gestion complète des événements par le SDK

**Voir :** `GUIDE_FRONTEND.md` pour l'implémentation complète.

### 2. **Approche WebSocket Backend**

Utilise `/ws/realtime` pour passer par le backend qui fait le proxy vers OpenAI.

**Avantages :**
- ✅ Plus simple à implémenter (pas besoin du SDK)
- ✅ Le backend gère la connexion OpenAI

**Limitations actuelles :**
- ❌ Pas d'envoi de texte (audio uniquement)
- ❌ Pas d'interruption de l'agent
- ❌ Pas de gestion Push-to-Talk (clear/commit buffer)
- ❌ Pas de transcription de l'utilisateur en temps réel

**Cette documentation couvre l'approche WebSocket Backend.**

---

## Base URL

```
http://localhost:8080  (développement)
https://your-backend.com  (production)
```

---

## 📡 Endpoints HTTP

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

**Exemple :**
```javascript
const response = await fetch('http://localhost:8080/health');
const data = await response.json();
console.log(data.status); // "ok"
```

---

### GET /api/session

Crée une session éphémère OpenAI Realtime. Retourne un `client_secret` pour connexion directe à OpenAI via WebRTC.

**⚠️ Utilisé par l'approche SDK OpenAI (voir `GUIDE_FRONTEND.md`)**

**Réponse :**
```json
{
  "object": "realtime.session",
  "id": "sess_xxx",
  "model": "gpt-realtime-2025-08-28",
  "client_secret": {
    "value": "ek_xxx",
    "expires_at": 1234567890
  },
  "instructions": "...",
  "voice": "verse",
  ...
}
```

**Exemple :**
```javascript
const response = await fetch('http://localhost:8080/api/session');
const session = await response.json();
const ephemeralKey = session.client_secret.value;
// Utiliser ephemeralKey avec le SDK OpenAI Agents pour se connecter directement
```

**Note :** Pour utiliser cette approche, voir `GUIDE_FRONTEND.md` qui documente l'utilisation complète du SDK.

---

### POST /api/rag/search

Recherche dans les documents ESCE via RAG (utilisé par l'agent OKTI).

**Body :**
```json
{
  "query": "votre question"
}
```

**Réponse :**
```json
{
  "context": "contexte trouvé dans les documents...",
  "length": 1234
}
```

**Note :** Cet endpoint est principalement utilisé par l'agent OKTI via ses outils. Vous pouvez l'utiliser directement pour tester le RAG.

---

## 🔌 WebSocket Endpoint

### WS /ws/realtime

Endpoint WebSocket pour conversation directe avec OKTI via le backend.

**⚠️ Limitations :** Cette approche ne supporte actuellement que l'audio. Pour toutes les fonctionnalités (texte, interruption, PTT), utilisez l'approche SDK avec `/api/session`.

**URL :**
```
ws://localhost:8080/ws/realtime  (développement)
wss://your-backend.com/ws/realtime  (production)
```

**Fonctionnalités supportées :**
- ✅ Envoi d'audio (PCM16, 24kHz, mono)
- ✅ Réception d'audio
- ✅ Transcription de l'agent en temps réel
- ✅ Reset de session

**Fonctionnalités non supportées (à venir) :**
- ❌ Envoi de texte
- ❌ Interruption de l'agent
- ❌ Push-to-Talk (clear/commit buffer)
- ❌ Transcription de l'utilisateur en temps réel

---

## 📤 Messages Frontend → Backend

### 1. Démarrer la conversation

```json
{ "type": "start_conversation" }
```

**Quand l'envoyer :** Au début de la conversation, après avoir reçu `ready`.

---

### 2. Envoyer un chunk audio

**Format :** Binaire (ArrayBuffer), PCM16, 24kHz, mono

```javascript
// Votre audio doit être en PCM16, 24kHz, mono
const pcm16Buffer = convertToPCM16(audioData); // Int16Array
ws.send(pcm16Buffer.buffer); // Envoyer l'ArrayBuffer
```

**Important :**
- Format : PCM16 (16-bit signed integers)
- Sample rate : 24000 Hz
- Channels : Mono (1 canal)
- Le backend convertit automatiquement en Base64 et l'envoie à OpenAI

---

### 3. Fin de la parole utilisateur (optionnel)

```json
{ "type": "user_audio_end" }
```

**Note :** Avec `semantic_vad` activé, ce message n'est généralement pas nécessaire car OpenAI détecte automatiquement la fin de parole.

---

### 4. Reset session

```json
{ "type": "reset_session" }
```

Réinitialise la session et en crée une nouvelle.

---

## 📥 Messages Backend → Frontend

### 1. Backend prêt

```json
{ "type": "ready" }
```

**Quand reçu :** Automatiquement après la connexion WebSocket, quand la session OpenAI est initialisée et confirmée.

**Action :** Vous pouvez maintenant envoyer `start_conversation` et commencer à envoyer de l'audio.

---

### 2. Chunk audio du bot

**Format :** Binaire (ArrayBuffer), PCM16, 24kHz, mono

```javascript
ws.onmessage = (event) => {
  if (event.data instanceof ArrayBuffer) {
    // C'est de l'audio PCM16, 24kHz, mono
    const audioBuffer = event.data;
    playAudio(audioBuffer);
  }
};
```

**Important :**
- Format : PCM16 (16-bit signed integers)
- Sample rate : 24000 Hz
- Channels : Mono (1 canal)
- À jouer directement dans votre AudioContext

---

### 3. Fin de la réponse vocale

```json
{ "type": "bot_audio_end" }
```

**Quand reçu :** Quand le bot a fini de parler.

**Action :** Vous pouvez indiquer à l'utilisateur qu'il peut parler à nouveau.

---

### 4. Transcription texte (optionnel)

```json
{ "type": "transcript_delta", "text": "..." }
```

**Quand reçu :** Pendant que le bot parle, pour afficher la transcription en temps réel.

**Exemple :**
```javascript
if (message.type === 'transcript_delta') {
  transcriptElement.textContent += message.text;
}
```

---

### 5. Erreur

```json
{ "type": "error", "message": "..." }
```

**Quand reçu :** En cas d'erreur (connexion OpenAI, session, etc.)

**Action :** Afficher l'erreur à l'utilisateur.

---

## 💻 Exemple Complet Frontend

```javascript
// 1. Connexion WebSocket
const ws = new WebSocket('ws://localhost:8080/ws/realtime');

let isReady = false;

ws.onopen = () => {
  console.log('✅ Connecté au backend');
};

ws.onmessage = async (event) => {
  // Message JSON
  if (typeof event.data === 'string') {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case 'ready':
        isReady = true;
        console.log('✅ Backend prêt');
        // Démarrer la conversation
        ws.send(JSON.stringify({ type: 'start_conversation' }));
        break;
        
      case 'bot_audio_end':
        console.log('🔚 Bot a fini de parler');
        break;
        
      case 'transcript_delta':
        console.log('📝 Transcription:', message.text);
        updateTranscript(message.text);
        break;
        
      case 'error':
        console.error('❌ Erreur:', message.message);
        break;
    }
  } 
  // Audio binaire
  else if (event.data instanceof ArrayBuffer) {
    console.log('🔊 Audio reçu:', event.data.byteLength, 'bytes');
    await playAudio(event.data);
  }
};

ws.onerror = (error) => {
  console.error('❌ Erreur WebSocket:', error);
};

ws.onclose = () => {
  console.log('🔌 Connexion fermée');
  isReady = false;
};

// 2. Envoyer de l'audio (PCM16, 24kHz, mono)
function sendAudio(audioData) {
  if (!isReady || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  
  // Convertir en PCM16 si nécessaire
  const pcm16 = convertToPCM16(audioData); // Int16Array
  ws.send(pcm16.buffer); // Envoyer l'ArrayBuffer
}

// 3. Jouer l'audio reçu
async function playAudio(audioBuffer) {
  const audioContext = new AudioContext({ sampleRate: 24000 });
  const pcm16 = new Int16Array(audioBuffer);
  const float32 = new Float32Array(pcm16.length);
  
  // Convertir PCM16 vers Float32
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }
  
  const buffer = audioContext.createBuffer(1, float32.length, 24000);
  buffer.getChannelData(0).set(float32);
  
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
}
```

---

## 📋 Spécifications Audio

### Format d'entrée (Frontend → Backend)
- **Format :** PCM16 (16-bit signed integers)
- **Sample rate :** 24000 Hz
- **Channels :** Mono (1 canal)
- **Encoding :** Little-endian

### Format de sortie (Backend → Frontend)
- **Format :** PCM16 (16-bit signed integers)
- **Sample rate :** 24000 Hz
- **Channels :** Mono (1 canal)
- **Encoding :** Little-endian

---

## 🔗 URLs de Connexion

### Développement
- WebSocket : `ws://localhost:8080/ws/realtime`
- HTTP : `http://localhost:8080`

### Production
- WebSocket : `wss://your-backend.com/ws/realtime`
- HTTP : `https://your-backend.com`

**Important :** Utilisez `wss://` (WebSocket Secure) en production avec HTTPS.

---

## 📊 Comparaison des approches

| Fonctionnalité | SDK OpenAI (`/api/session`) | WebSocket Backend (`/ws/realtime`) |
|----------------|----------------------------|-----------------------------------|
| Audio (parler) | ✅ | ✅ |
| Audio (écouter) | ✅ | ✅ |
| Envoi de texte | ✅ | ❌ |
| Interruption | ✅ | ❌ |
| Push-to-Talk | ✅ | ❌ |
| Transcription utilisateur | ✅ | ❌ |
| Transcription agent | ✅ | ✅ |
| RAG (outils) | ✅ | ✅ |
| Latence | Faible (direct) | Moyenne (via backend) |
| Complexité | Moyenne (SDK requis) | Faible (WebSocket simple) |

**Recommandation :** Utilisez l'approche SDK (`/api/session`) pour un frontend complet avec toutes les fonctionnalités. Utilisez l'approche WebSocket Backend (`/ws/realtime`) uniquement si vous avez besoin d'une solution simple sans le SDK.

---

## 🔗 Ressources

- **Guide Frontend complet** : `GUIDE_FRONTEND.md` (approche SDK)
- **Documentation OpenAI Realtime** : https://platform.openai.com/docs/guides/realtime
- **SDK OpenAI Agents** : https://github.com/openai/agents

