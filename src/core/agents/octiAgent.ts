import { getEnvConfig } from '../../config/env';
import { AgentConfig, createAgentConfig } from './AgentConfig';

/**
 * Configuration de l'agent OCTI
 * Utilise les variables d'environnement pour définir le pré-prompt et les paramètres
 */
export function getOctiAgentConfig(): AgentConfig {
  const config = getEnvConfig();

  return createAgentConfig(
    config.octiSystemPrompt,
    config.octiDefaultVoice,
    config.octiInputAudioFormat,
    config.octiOutputAudioFormat,
    ['text', 'audio'] // Modalités obligatoires pour OCTI
  );
}

