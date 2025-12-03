import { getEnvConfig } from '../../config/env';
import { AgentConfig, createAgentConfig } from './AgentConfig';
import { ESCE_CONTEXT } from './esceContext';

/**
 * Configuration de l'agent OCTI
 */
export function getOctiAgentConfig(): AgentConfig {
  const config = getEnvConfig();

  // Utiliser la voix configurée (verse par défaut)
  const voice = config.octiDefaultVoice || 'verse';

  // Enrichir le prompt système avec le contexte ESCE
  const enrichedPrompt = config.octiSystemPrompt
    ? `${config.octiSystemPrompt}\n\n${ESCE_CONTEXT}`
    : ESCE_CONTEXT;

  return createAgentConfig(
    enrichedPrompt,
    voice
  );
}
