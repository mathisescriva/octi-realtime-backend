/**
 * Types pour l'API OpenAI Realtime (GA)
 */

/**
 * Types d'événements reçus depuis OpenAI Realtime API
 */
export type RealtimeEventType =
  | 'session.created'
  | 'session.updated'
  | 'input_audio_buffer.speech_started'
  | 'input_audio_buffer.speech_stopped'
  | 'input_audio_buffer.committed'
  | 'conversation.item.added'
  | 'conversation.item.done'
  | 'response.output_audio_transcript.delta'
  | 'response.output_audio_transcript.done'
  | 'response.output_audio.delta'
  | 'response.output_audio.done'
  | 'response.done'
  | 'error';

/**
 * Événement générique de l'API Realtime
 */
export interface RealtimeEvent {
  type: RealtimeEventType;
  [key: string]: any;
}

/**
 * Événement de transcription delta (texte de la réponse)
 */
export interface ResponseOutputAudioTranscriptDeltaEvent extends RealtimeEvent {
  type: 'response.output_audio_transcript.delta';
  delta: string;
}

/**
 * Événement de chunk audio delta (audio PCM16 en base64)
 */
export interface ResponseOutputAudioDeltaEvent extends RealtimeEvent {
  type: 'response.output_audio.delta';
  delta: string; // Base64 encoded audio
}

/**
 * Événement de fin d'audio
 */
export interface ResponseOutputAudioDoneEvent extends RealtimeEvent {
  type: 'response.output_audio.done';
}

/**
 * Événement d'erreur
 */
export interface ErrorEvent extends RealtimeEvent {
  type: 'error';
  error: {
    type: string;
    message: string;
    code?: string;
  };
}

/**
 * Configuration de session pour OpenAI Realtime (GA)
 */
export interface RealtimeSessionConfig {
  type: 'realtime';
  instructions: string;
  model?: string;
  audio?: {
    output?: {
      voice?: string;
    };
  };
}

/**
 * Message session.update pour configurer la session
 */
export interface SessionUpdateMessage {
  type: 'session.update';
  session: RealtimeSessionConfig;
}

/**
 * Message input_audio_buffer.commit pour signaler la fin de l'audio utilisateur
 */
export interface InputAudioBufferCommitMessage {
  type: 'input_audio_buffer.commit';
}
