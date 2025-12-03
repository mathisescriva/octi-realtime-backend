/**
 * Configuration générique pour un agent vocal
 * Permet de définir les paramètres d'un agent (OCTI, MILO, Gilbert...)
 */
export interface AgentConfig {
  systemPrompt: string;
  voice: string;
  inputAudioFormat: string;
  outputAudioFormat: string;
  modalities: string[];
}

/**
 * Crée une configuration d'agent avec des valeurs par défaut
 */
export function createAgentConfig(
  systemPrompt: string,
  voice: string = 'alloy',
  inputAudioFormat: string = 'pcm16',
  outputAudioFormat: string = 'pcm16',
  modalities: string[] = ['text', 'audio']
): AgentConfig {
  return {
    systemPrompt,
    voice,
    inputAudioFormat,
    outputAudioFormat,
    modalities,
  };
}

