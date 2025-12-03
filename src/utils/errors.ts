/**
 * Erreurs personnalisées pour le backend OKTI
 */

export class RealtimeConnectionError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'RealtimeConnectionError';
  }
}

export class SessionError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'SessionError';
  }
}

export class InvalidMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMessageError';
  }
}


