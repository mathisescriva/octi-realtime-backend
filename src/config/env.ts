import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuration de l'environnement
 */
export interface EnvConfig {
  port: number;
  nodeEnv: string;
  openaiApiKey: string;
  openaiRealtimeModel: string;
  octiSystemPrompt: string;
  octiDefaultVoice: string;
}

/**
 * Valide et retourne la configuration de l'environnement
 */
export function getEnvConfig(): EnvConfig {
  const port = parseInt(process.env.PORT || '8080', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiRealtimeModel = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime';
  const octiSystemPrompt = process.env.OCTI_SYSTEM_PROMPT;
  const octiDefaultVoice = process.env.OCTI_DEFAULT_VOICE || 'alloy';

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
  };
}
