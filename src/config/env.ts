import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Configuration de l'environnement
 * Valide et expose toutes les variables d'environnement nécessaires
 */
export interface EnvConfig {
  port: number;
  nodeEnv: string;
  openaiApiKey: string;
  openaiRealtimeModel: string;
  octiSystemPrompt: string;
  octiDefaultVoice: string;
  octiInputAudioFormat: string;
  octiOutputAudioFormat: string;
}

/**
 * Valide et retourne la configuration de l'environnement
 * @throws Error si une variable requise est manquante
 */
export function getEnvConfig(): EnvConfig {
  const port = parseInt(process.env.PORT || '8080', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiRealtimeModel = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview';
  const octiSystemPrompt = process.env.OCTI_SYSTEM_PROMPT;
  const octiDefaultVoice = process.env.OCTI_DEFAULT_VOICE || 'alloy';
  const octiInputAudioFormat = process.env.OCTI_INPUT_AUDIO_FORMAT || 'pcm16';
  const octiOutputAudioFormat = process.env.OCTI_OUTPUT_AUDIO_FORMAT || 'pcm16';

  // Validation des variables requises
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY est requis dans les variables d\'environnement');
  }

  if (!octiSystemPrompt) {
    throw new Error('OCTI_SYSTEM_PROMPT est requis dans les variables d\'environnement');
  }

  return {
    port,
    nodeEnv,
    openaiApiKey,
    openaiRealtimeModel,
    octiSystemPrompt,
    octiDefaultVoice,
    octiInputAudioFormat,
    octiOutputAudioFormat,
  };
}

