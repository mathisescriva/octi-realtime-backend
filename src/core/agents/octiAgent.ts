import { getEnvConfig } from '../../config/env';
import { AgentConfig, createAgentConfig } from './AgentConfig';

/**
 * Configuration de l'agent OCTI
 */
export function getOctiAgentConfig(): AgentConfig {
  const config = getEnvConfig();

  return createAgentConfig(
    config.octiSystemPrompt,
    config.octiDefaultVoice
  );
}
