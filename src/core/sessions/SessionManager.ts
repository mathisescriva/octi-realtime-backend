import { OpenAIRealtimeClient } from '../realtime/OpenAIRealtimeClient';
import { getEnvConfig } from '../../config/env';
import { logger } from '../../config/logger';
import { SessionError } from '../../utils/errors';
import { AgentConfig } from '../agents/AgentConfig';
import { RealtimeSessionConfig } from '../realtime/types';

/**
 * Gestionnaire de sessions Realtime
 * Crée et gère les connexions OpenAI Realtime pour différents agents
 */
export class SessionManager {
  /**
   * Crée une nouvelle session Realtime pour l'agent OCTI
   * @returns Un client Realtime connecté et configuré
   */
  static async createOctiSession(agentConfig: AgentConfig): Promise<OpenAIRealtimeClient> {
    const envConfig = getEnvConfig();

    const client = new OpenAIRealtimeClient(envConfig.openaiApiKey, envConfig.openaiRealtimeModel);

    // Convertir la config agent en config session Realtime
    const sessionConfig: RealtimeSessionConfig = {
      instructions: agentConfig.systemPrompt,
      voice: agentConfig.voice,
      input_audio_format: agentConfig.inputAudioFormat,
      output_audio_format: agentConfig.outputAudioFormat,
      modalities: agentConfig.modalities,
    };

    try {
      await client.connect(sessionConfig);
      logger.info('Session OCTI créée avec succès');
      return client;
    } catch (error) {
      logger.error({ error }, 'Erreur lors de la création de la session OCTI');
      throw new SessionError('Impossible de créer la session Realtime', error as Error);
    }
  }

  /**
   * Méthode générique pour créer une session pour n'importe quel agent
   * Permet d'étendre facilement pour d'autres agents (MILO, Gilbert...)
   */
  static async createSession(agentConfig: AgentConfig): Promise<OpenAIRealtimeClient> {
    const envConfig = getEnvConfig();

    const client = new OpenAIRealtimeClient(envConfig.openaiApiKey, envConfig.openaiRealtimeModel);

    const sessionConfig: RealtimeSessionConfig = {
      instructions: agentConfig.systemPrompt,
      voice: agentConfig.voice,
      input_audio_format: agentConfig.inputAudioFormat,
      output_audio_format: agentConfig.outputAudioFormat,
      modalities: agentConfig.modalities,
    };

    try {
      await client.connect(sessionConfig);
      logger.info('Session créée avec succès');
      return client;
    } catch (error) {
      logger.error({ error }, 'Erreur lors de la création de la session');
      throw new SessionError('Impossible de créer la session Realtime', error as Error);
    }
  }
}

