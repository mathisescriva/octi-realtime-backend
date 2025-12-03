# Guide de Test Local

## ✅ État Actuel

Le backend est **opérationnel** et prêt à recevoir des connexions.

## 🧪 Comment Tester

### Option 1 : Avec le Frontend (Recommandé)

Le backend est conçu pour fonctionner avec un frontend qui :
1. Capture l'audio du micro (PCM16)
2. Se connecte au WebSocket `ws://localhost:8080/ws/realtime`
3. Envoie les chunks audio en temps réel
4. Reçoit et joue l'audio de réponse

**Le frontend doit implémenter :**
- Capture audio PCM16 depuis le micro
- Connexion WebSocket
- Envoi des chunks audio binaires
- Réception et lecture de l'audio de réponse

### Option 2 : Test Manuel avec un Client WebSocket

Vous pouvez tester la connexion avec un client WebSocket (ex: Postman, websocat, ou un script Node.js).

**Exemple minimal :**
```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080/ws/realtime');

ws.on('message', (data) => {
  if (typeof data === 'string') {
    console.log('Message:', JSON.parse(data));
  } else {
    console.log('Audio reçu:', data.length, 'bytes');
  }
});

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'start_conversation' }));
});
```

### Option 3 : Vérification de la Connexion OpenAI

Le backend se connecte automatiquement à OpenAI Realtime quand un client se connecte. Vous verrez dans les logs :
- ✅ "Connexion OpenAI Realtime établie"
- ✅ "Session OCTI créée avec succès"

## ⚠️ Important

**Pour obtenir une vraie réponse vocale, il faut :**
1. ✅ Backend démarré (c'est fait)
2. ✅ Clé API OpenAI valide (configurée dans .env)
3. ⚠️ **Client frontend qui envoie de l'audio PCM16 réel**

Le backend seul ne peut pas générer de réponse sans audio d'entrée valide.

## 🚀 Démarrer le Serveur

```bash
# En développement (avec rechargement auto)
npm run dev

# En production
npm run build
npm start
```

Le serveur démarre sur `http://localhost:8080`

## 📊 Vérifier que ça marche

```bash
# Test de la route health
curl http://localhost:8080/health

# Devrait retourner :
# {"status":"ok","timestamp":"...","service":"octi-realtime-backend"}
```

## 🔍 Logs

Les logs du serveur montrent :
- Connexions WebSocket
- Connexions OpenAI Realtime
- Messages échangés
- Erreurs éventuelles

