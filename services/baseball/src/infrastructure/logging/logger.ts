import type { LoggerService } from '@nestjs/common';
import { inspect } from 'node:util';
import pino, { type Logger } from 'pino';
import type { AppConfig } from '../config/app-config.js';

export const APP_LOGGER = Symbol('APP_LOGGER');

/** Logger JSON de la aplicacion; se crea antes que cualquier otra cosa en el proceso. */
export function createLogger(level: AppConfig['logLevel'] = 'info'): Logger {
  return pino({ level, base: { service: 'baseball' } });
}

/** Adaptador de pino a LoggerService de Nest: los logs de Nest salen tambien en JSON. */
export class PinoLoggerService implements LoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('info', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('trace', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.write('fatal', message, optionalParams);
  }

  // Nest pasa el contexto (nombre de la clase) como ultimo parametro de tipo string.
  private write(
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace',
    message: unknown,
    optionalParams: readonly unknown[],
  ): void {
    const last = optionalParams.at(-1);
    const context = typeof last === 'string' ? last : undefined;
    const extra = context === undefined ? optionalParams : optionalParams.slice(0, -1);
    const bindings: Record<string, unknown> = {};
    if (context !== undefined) {
      bindings.context = context;
    }
    if (message instanceof Error) {
      bindings.err = message;
    } else if (extra.length > 0) {
      bindings.details = extra;
    }
    let text: string;
    if (message instanceof Error) {
      text = message.message;
    } else {
      text = typeof message === 'string' ? message : inspect(message);
    }
    this.logger[level](bindings, text);
  }
}
