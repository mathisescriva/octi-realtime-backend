# Analyse : RAG vs Préprompt Complet

## Situation Actuelle

**Préprompt actuel :**
- Taille : ~19 000 caractères (~4 770 tokens)
- Contenu : Contexte ESCE complet (programmes, admissions, campus, etc.)
- RAG : Utilisé pour les détails spécifiques (noms d'étudiants, stages précis)

## Comparaison des Approches

### Option 1 : Tout dans le Préprompt (sans RAG)

**Avantages :**
- ✅ **Pas de latence RAG** : Réponses instantanées, pas d'appel API supplémentaire
- ✅ **Pas de consommation d'embeddings** : Économie sur les coûts d'embedding
- ✅ **Informations toujours disponibles** : Pas besoin de chercher, tout est en mémoire
- ✅ **Plus simple** : Pas de gestion de Pinecone, pas de recherche

**Inconvénients :**
- ❌ **~4 770 tokens à CHAQUE message** : Le préprompt est envoyé avec chaque requête
- ❌ **Accumulation de tokens** : Avec le contexte de conversation, ça peut vite monter
- ❌ **Rate limits plus probables** : Plus de tokens = plus de risque de dépasser la limite
- ❌ **Moins flexible** : Difficile de mettre à jour les données (noms d'étudiants, nouveaux stages)
- ❌ **Limite de contexte** : Si le préprompt + conversation dépasse la limite du modèle, ça plante

**Estimation de consommation :**
- Chaque message : ~4 770 tokens (préprompt) + tokens de conversation
- Sur 10 messages : ~47 700 tokens juste pour le préprompt
- Avec conversation : peut facilement dépasser 50k tokens

### Option 2 : RAG Seulement (préprompt minimal)

**Avantages :**
- ✅ **Préprompt léger** : ~500-1000 tokens (personnalité + instructions)
- ✅ **Informations à jour** : Peut re-ingérer facilement les nouveaux documents
- ✅ **Flexible** : Ajoute/modifie des documents sans changer le code
- ✅ **Moins de tokens par message** : Seulement le préprompt minimal + conversation

**Inconvénients :**
- ❌ **Latence** : Appel RAG ajoute ~500ms-1s par recherche
- ❌ **Coût embeddings** : Chaque recherche coûte (embedding de la requête)
- ❌ **Peut manquer des infos** : Si la recherche n'est pas bonne, l'info n'est pas trouvée
- ❌ **Complexité** : Gestion de Pinecone, ingestion, recherche

**Estimation de consommation :**
- Chaque message : ~500 tokens (préprompt minimal) + tokens de conversation
- Appel RAG : ~100 tokens (embedding) + ~600-700 tokens (contexte retourné)
- Sur 10 messages avec RAG : ~12 000 tokens total

### Option 3 : Hybride (Approche Actuelle - RECOMMANDÉE)

**Préprompt :**
- Infos générales/statiques : Programmes, admissions, campus, spécialisations (~3 000 tokens)
- Personnalité et instructions (~1 500 tokens)
- Total : ~4 500 tokens

**RAG :**
- Détails spécifiques : Noms d'étudiants, stages précis, profils LinkedIn
- Utilisé seulement quand nécessaire

**Avantages :**
- ✅ **Meilleur des deux mondes** : Infos générales toujours disponibles, détails via RAG
- ✅ **Flexible** : Peut mettre à jour les détails spécifiques facilement
- ✅ **Équilibre tokens/latence** : Pas trop de tokens, pas trop de latence

**Inconvénients :**
- ⚠️ **Complexité moyenne** : Gestion du RAG mais préprompt quand même présent

## Recommandation

### Pour éviter les Rate Limits : **Option 2 (RAG Seulement)**

**Raison :**
1. **Réduction drastique des tokens** : De ~4 770 à ~500 tokens par message = **90% de réduction**
2. **Moins de risque de rate limit** : Avec 40k TPM, tu peux faire beaucoup plus de messages
3. **Flexibilité** : Peut mettre à jour les données facilement

**Compromis :**
- Garder un préprompt minimal avec :
  - Personnalité d'OKTI
  - Instructions de base
  - Infos ESSENTIELLES uniquement (devise, orientation internationale)
- Tout le reste via RAG

### Pour la Performance : **Option 1 (Tout dans le Préprompt)**

**Raison :**
- Pas de latence RAG
- Réponses instantanées
- Mais attention aux rate limits !

## Impact sur les Rate Limits

**Avec préprompt complet (4 770 tokens) :**
- 10 messages = ~47 700 tokens (juste préprompt)
- Avec conversation : ~60k+ tokens
- **Risque élevé de rate limit** ❌

**Avec RAG seulement (~500 tokens préprompt) :**
- 10 messages = ~5 000 tokens (préprompt)
- Avec RAG (si utilisé) : +600-700 tokens par recherche
- Total : ~12 000 tokens
- **Risque faible de rate limit** ✅

## Conclusion

**Pour résoudre les rate limits :** Utiliser **RAG seulement** avec un préprompt minimal.

**Préprompt minimal suggéré :**
- Personnalité d'OKTI (~500 tokens)
- Instructions de base (~300 tokens)
- Infos essentielles ESCE (résumé très court, ~500 tokens)
- Total : ~1 300 tokens au lieu de 4 770

**RAG pour :**
- Programmes détaillés
- Admissions détaillées
- Campus détaillés
- Spécialisations
- Noms d'étudiants
- Stages précis
- Tout le reste

