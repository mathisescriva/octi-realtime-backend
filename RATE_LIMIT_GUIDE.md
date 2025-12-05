# Guide : Augmenter les Rate Limits OpenAI

## Problème

Tu rencontres des erreurs de type :
```
Rate limit reached for gpt-4o-mini-realtime in organization org-XXX on tokens per min (TPM): 
Limit 40000, Used 25502, Requested 18592. Please try again in 6.141s.
```

Cela signifie que ta limite actuelle est de **40000 tokens par minute (TPM)** et que tu as besoin de plus.

## Solution : Demander une augmentation

### 1. Accéder à la page des Rate Limits

1. Va sur [https://platform.openai.com/account/rate-limits](https://platform.openai.com/account/rate-limits)
2. Connecte-toi avec ton compte OpenAI

### 2. Vérifier ta limite actuelle

Sur la page, tu verras tes limites actuelles pour chaque modèle :
- **gpt-realtime-mini** : 40000 TPM (tokens par minute)
- **gpt-realtime** : 40000 TPM
- etc.

### 3. Demander une augmentation

#### Option A : Via le formulaire OpenAI (recommandé)

1. Sur la page des rate limits, cherche un bouton **"Request increase"** ou **"Request quota increase"**
2. Remplis le formulaire avec :
   - **Modèle** : `gpt-4o-mini-realtime` ou `gpt-realtime-mini`
   - **Type de limite** : Tokens per minute (TPM)
   - **Limite actuelle** : 40000
   - **Limite demandée** : 100000 ou 200000 (selon tes besoins)
   - **Raison** : "Application de démonstration pour client avec interactions vocales en temps réel nécessitant plus de capacité"

#### Option B : Via le support OpenAI

1. Va sur [https://help.openai.com/](https://help.openai.com/)
2. Clique sur **"Contact Support"**
3. Sélectionne **"Billing and Rate Limits"**
4. Explique ta situation :
   - Tu développes une application de démonstration pour un client
   - Tu utilises l'API Realtime pour des interactions vocales
   - Tu as besoin d'une limite plus élevée pour les démos

### 4. Informations à fournir

- **Organization ID** : `org-O6TU9tjxqDkwE1GV439KrcTm` (visible dans l'erreur)
- **Modèle utilisé** : `gpt-4o-mini-realtime` ou `gpt-realtime-mini`
- **Type de limite** : TPM (Tokens Per Minute)
- **Limite actuelle** : 40000
- **Limite souhaitée** : 100000-200000 (ou plus selon tes besoins)
- **Cas d'usage** : Application de démonstration pour client avec interactions vocales en temps réel

### 5. Délai de traitement

- **Gratuit** : Généralement quelques jours à une semaine
- **Payant** : Souvent plus rapide (24-48h)

## Solutions temporaires

En attendant l'augmentation, tu peux :

1. **Utiliser `gpt-realtime-mini`** : ✅ Déjà fait - consomme moins de tokens
2. **Réduire la longueur des conversations** : Limiter la durée des sessions
3. **Implémenter un throttling** : Espacer les requêtes pour ne pas dépasser la limite
4. **Attendre automatiquement** : Le système attend déjà automatiquement le temps indiqué dans l'erreur

## Vérification après augmentation

Une fois l'augmentation approuvée :

1. Vérifie sur [https://platform.openai.com/account/rate-limits](https://platform.openai.com/account/rate-limits)
2. La nouvelle limite devrait apparaître dans les 24-48h
3. Teste l'application - les erreurs de rate limit devraient disparaître

## Notes importantes

- Les limites sont par **organisation** (org-XXX)
- Les limites sont par **modèle** (gpt-realtime-mini, gpt-realtime, etc.)
- Les limites sont **par minute** (TPM) - elles se réinitialisent chaque minute
- Si tu utilises plusieurs modèles, tu dois demander une augmentation pour chacun

