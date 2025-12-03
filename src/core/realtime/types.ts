/**
 * Types pour l'API OpenAI Realtime
 * Basés sur la documentation officielle de l'API Realtime
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
  | 'conversation.item.created'
  | 'conversation.item.input_audio_transcription.completed'
  | 'conversation.item.output_audio_transcription.completed'
  | 'response.audio_transcript.delta'
  | 'response.audio_transcript.done'
  | 'response.audio.delta'
  | 'response.audio.done'
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
export interface ResponseAudioTranscriptDeltaEvent extends RealtimeEvent {
  type: 'response.audio_transcript.delta';
  delta: string;
}

/**
 * Événement de chunk audio delta (audio PCM16)
 */
export interface ResponseAudioDeltaEvent extends RealtimeEvent {
  type: 'response.audio.delta';
  delta: string; // Base64 encoded audio
}

/**
 * Événement de fin d'audio
 */
export interface ResponseAudioDoneEvent extends RealtimeEvent {
  type: 'response.audio.done';
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
 * Configuration de session pour OpenAI Realtime
 */
export interface RealtimeSessionConfig {
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  modalities: string[];
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

