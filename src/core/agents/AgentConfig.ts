/**
 * Configuration générique pour un agent vocal
 */
export interface AgentConfig {
  systemPrompt: string;
  voice: string;
}

/**
 * Crée une configuration d'agent
 */
export function createAgentConfig(
  systemPrompt: string,
  voice: string = 'alloy'
): AgentConfig {
  return {
    systemPrompt,
    voice,
  };
}
