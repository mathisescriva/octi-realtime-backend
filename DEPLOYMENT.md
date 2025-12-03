# 🚀 Guide de Déploiement - OCTI Realtime Backend

## Vue d'ensemble

Ce backend peut être déployé sur n'importe quelle plateforme supportant Node.js. Il expose :
- **WebSocket** : `/ws/realtime` pour conversation directe
- **HTTP API** : `/api/session` pour sessions éphémères (WebRTC)
- **Health Check** : `/health` pour monitoring

## 📋 Prérequis

- Node.js ≥ 20
- Clé API OpenAI avec accès à l'API Realtime
- Variables d'environnement configurées

## 🌐 Déploiement sur Render

### 1. Créer un nouveau Web Service

1. Aller sur [Render Dashboard](https://dashboard.render.com)
2. Cliquer sur "New +" → "Web Service"
3. Connecter votre repository GitHub

### 2. Configuration

**Build Command :**
```bash
npm install && npm run build
```

**Start Command :**
```bash
npm start
```

**Environment Variables :**
```
OPENAI_API_KEY=sk-xxx
OCTI_SYSTEM_PROMPT="Tu es OCTI..."
OCTI_DEFAULT_VOICE=alloy
OPENAI_REALTIME_MODEL=gpt-realtime
PORT=8080
NODE_ENV=production
```

### 3. Déployer

Render déploiera automatiquement. Votre backend sera accessible sur :
```
https://your-service.onrender.com
```

## 🚂 Déploiement sur Railway

1. Créer un nouveau projet sur [Railway](https://railway.app)
2. Connecter votre repository
3. Ajouter les variables d'environnement
4. Railway détectera automatiquement Node.js et utilisera `npm start`

## 🐳 Déploiement avec Docker (optionnel)

Créer un `Dockerfile` :

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

Puis :
```bash
docker build -t octi-backend .
docker run -p 8080:8080 --env-file .env octi-backend
```

## 🔗 Intégration avec votre Frontend

### Option 1 : WebSocket Direct

Votre frontend se connecte au WebSocket de votre backend déployé :

```javascript
const ws = new WebSocket('wss://your-backend.onrender.com/ws/realtime');
```

### Option 2 : Sessions Éphémères (WebRTC)

Votre frontend utilise l'endpoint `/api/session` :

```javascript
const response = await fetch('https://your-backend.onrender.com/api/session');
const { client_secret } = await response.json();
// Utiliser client_secret.value pour se connecter à OpenAI via WebRTC
```

## 🔒 Sécurité en Production

1. **HTTPS/WSS obligatoire** : Utilisez toujours HTTPS en production
2. **CORS** : Configurez CORS pour votre domaine frontend si nécessaire
3. **Rate Limiting** : Ajoutez du rate limiting si nécessaire
4. **Monitoring** : Surveillez les logs et métriques

## 📊 Monitoring

### Health Check

```bash
curl https://your-backend.onrender.com/health
```

### Logs

Sur Render/Railway, les logs sont disponibles dans le dashboard.

## 🐛 Dépannage

### Erreur "Incorrect API key provided"

- Vérifier que `OPENAI_API_KEY` est bien configurée
- Vérifier qu'elle a accès à l'API Realtime

### Erreur de connexion WebSocket

- Vérifier que le backend est accessible
- Vérifier que le port est correctement exposé
- Vérifier les logs du serveur

### Pas de réponse audio

- Vérifier les logs backend
- Vérifier que l'audio est envoyé au bon format (PCM16, 24kHz)
- Vérifier que la session OpenAI est bien créée
