export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  details?: Record<string, any>;
  stack?: string;
}

const SENSITIVE_KEYS = [
  'token',
  'secret',
  'password',
  'apikey',
  'api_key',
  'authorization',
  'privatekey',
  'private_key',
  'credential',
];

function sanitize(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    return data.replace(/(ghp_[a-zA-Z0-9]{30,}|bearer\s+[a-zA-Z0-9_\-\.]+)/gi, '[REDACTED]');
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
        cleaned[key] = '[REDACTED]';
      } else {
        cleaned[key] = sanitize(value);
      }
    }
    return cleaned;
  }
  return data;
}

export class Logger {
  static log(level: LogLevel, message: string, details?: Record<string, any>, requestId?: string, error?: Error) {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId,
      details: details ? sanitize(details) : undefined,
      stack: error?.stack,
    };

    const formatted = `[${payload.timestamp}] [${level.toUpperCase()}] ${requestId ? `[req:${requestId}] ` : ''}${message}`;

    if (level === 'error') {
      console.error(formatted, payload.details ? payload.details : '', payload.stack ? `\n${payload.stack}` : '');
    } else if (level === 'warn') {
      console.warn(formatted, payload.details ? payload.details : '');
    } else {
      console.log(formatted, payload.details ? payload.details : '');
    }
  }

  static debug(message: string, details?: Record<string, any>, requestId?: string) {
    if (process.env.NODE_ENV !== 'production' || process.env.DEBUG === 'true') {
      Logger.log('debug', message, details, requestId);
    }
  }

  static info(message: string, details?: Record<string, any>, requestId?: string) {
    Logger.log('info', message, details, requestId);
  }

  static warn(message: string, details?: Record<string, any>, requestId?: string) {
    Logger.log('warn', message, details, requestId);
  }

  static error(message: string, error?: any, details?: Record<string, any>, requestId?: string) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    Logger.log('error', message, details, requestId, errObj);
  }
}
