import WebSocket from 'ws';
import { logger } from '../../config/logger';
import { SessionManager } from '../../core/sessions/SessionManager';
import { getOctiAgentConfig } from '../../core/agents/octiAgent';
import { OpenAIRealtimeClient } from '../../core/realtime/OpenAIRealtimeClient';
import {
  isFrontendMessage,
  createReadyMessage,
  createBotAudioEndMessage,
  createTranscriptDeltaMessage,
  createErrorMessage,
} from '../../utils/wsMessages';
import {
  ResponseAudioDeltaEvent,
  ResponseAudioTranscriptDeltaEvent,
  ErrorEvent,
  InputAudioBufferCommitMessage,
} from '../../core/realtime/types';

/**
 * Gère une connexion WebSocket client pour le service Realtime
 * Fait le proxy entre le frontend et OpenAI Realtime API
 */
export function realtimeHandler(ws: WebSocket): void {
  let realtimeClient: OpenAIRealtimeClient | null = null;

  logger.info('Nouvelle connexion WebSocket client');

  /**
   * Initialise la session Realtime
   */
  async function initializeSession() {
    try {
      const agentConfig = getOctiAgentConfig();
      realtimeClient = await SessionManager.createOctiSession(agentConfig);

      // Configurer les handlers pour les événements OpenAI
      realtimeClient.onMessage((event) => {
        handleOpenAIEvent(event);
      });

      // Envoyer ready au frontend
      ws.send(JSON.stringify(createReadyMessage()));
      logger.info('Session Realtime initialisée, prêt pour le frontend');
    } catch (error) {
      logger.error({ error }, 'Erreur lors de l\'initialisation de la session');
      sendError('Erreur lors de l\'initialisation de la session Realtime');
    }
  }

  /**
   * Gère les événements reçus depuis OpenAI Realtime
   */
  function handleOpenAIEvent(event: any) {
    try {
      switch (event.type) {
        case 'response.audio_transcript.delta': {
          const deltaEvent = event as ResponseAudioTranscriptDeltaEvent;
          // Envoyer la transcription delta au frontend (pour affichage)
          ws.send(JSON.stringify(createTranscriptDeltaMessage(deltaEvent.delta)));
          break;
        }

        case 'response.audio.delta': {
          const audioEvent = event as ResponseAudioDeltaEvent;
          // Décoder le base64 et envoyer l'audio PCM16 au frontend
          const audioBuffer = Buffer.from(audioEvent.delta, 'base64');
          ws.send(audioBuffer);
          break;
        }

        case 'response.audio.done': {
          // Signaler la fin de l'audio au frontend
          ws.send(JSON.stringify(createBotAudioEndMessage()));
          break;
        }

        case 'error': {
          const errorEvent = event as ErrorEvent;
          logger.error({ error: errorEvent.error }, 'Erreur depuis OpenAI Realtime');
          sendError(`Erreur OpenAI: ${errorEvent.error.message}`);
          break;
        }

        default:
          // Ignorer les autres événements (session.created, etc.)
          break;
      }
    } catch (error) {
      logger.error({ error, eventType: event.type }, 'Erreur lors du traitement d\'un événement OpenAI');
    }
  }

  /**
   * Envoie un message d'erreur au frontend
   */
  function sendError(message: string) {
    try {
      ws.send(JSON.stringify(createErrorMessage(message)));
    } catch (error) {
      logger.error({ error }, 'Impossible d\'envoyer le message d\'erreur');
    }
  }

  /**
   * Réinitialise la session Realtime
   */
  async function resetSession() {
    logger.info('Réinitialisation de la session');
    
    if (realtimeClient) {
      realtimeClient.close();
      realtimeClient = null;
    }

    await initializeSession();
  }

  // Initialiser la session dès la connexion
  initializeSession();

  // Gérer les messages du frontend
  ws.on('message', async (data: WebSocket.Data) => {
    try {
      // Message binaire = chunk audio PCM16
      if (Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
        if (!realtimeClient || !realtimeClient.connected) {
          logger.warn('Tentative d\'envoi d\'audio sans session active');
          return;
        }

        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        realtimeClient.sendBinary(buffer);
        return;
      }

      // Message JSON
      if (typeof data === 'string') {
        const message = JSON.parse(data);

        if (!isFrontendMessage(message)) {
          logger.warn({ message }, 'Message frontend invalide');
          sendError('Format de message invalide');
          return;
        }

        switch (message.type) {
          case 'start_conversation':
            logger.info('Démarrage de conversation demandé');
            // La session est déjà prête, rien à faire
            break;

          case 'user_audio_end':
            logger.info('Fin de l\'audio utilisateur détectée');
            if (realtimeClient && realtimeClient.connected) {
              // Signaler à OpenAI que l'audio utilisateur est terminé
              const commitMessage: InputAudioBufferCommitMessage = {
                type: 'input_audio_buffer.commit',
              };
              realtimeClient.sendEvent(commitMessage);
            }
            break;

          case 'reset_session':
            logger.info('Reset de session demandé');
            await resetSession();
            break;

          default:
            logger.warn({ message }, 'Type de message non géré');
        }
      }
    } catch (error) {
      logger.error({ error }, 'Erreur lors du traitement d\'un message frontend');
      sendError('Erreur lors du traitement du message');
    }
  });

  // Gérer la fermeture de la connexion
  ws.on('close', () => {
    logger.info('Connexion WebSocket client fermée');
    if (realtimeClient) {
      realtimeClient.close();
      realtimeClient = null;
    }
  });

  // Gérer les erreurs de connexion
  ws.on('error', (error) => {
    logger.error({ error }, 'Erreur WebSocket client');
    if (realtimeClient) {
      realtimeClient.close();
      realtimeClient = null;
    }
  });
}

