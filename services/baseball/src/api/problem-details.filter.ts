import {
  Catch,
  HttpException,
  Inject,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Logger } from 'pino';
import { APP_LOGGER } from '../infrastructure/logging/logger.js';
import { PROBLEM_JSON } from './problem-details.js';

const TITLES: Readonly<Record<number, string>> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  409: 'Conflict',
  413: 'Payload Too Large',
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

// Textos fijos: nunca se reenvia el mensaje de la excepcion (RFC 9457, sin detalles internos).
const DETAILS: Readonly<Record<number, string>> = {
  404: 'The requested resource was not found.',
  500: 'An unexpected error occurred.',
  503: 'The service is not ready to receive traffic.',
};

function statusOf(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }
  if (typeof exception === 'object' && exception !== null && 'statusCode' in exception) {
    const code = exception.statusCode;
    if (typeof code === 'number' && Number.isInteger(code) && code >= 400 && code < 500) {
      return code;
    }
  }
  return 500;
}

interface CauseSummary {
  readonly name?: string;
  readonly code?: string;
  readonly message?: string;
}

/** Resumen sin traza de la causa de una excepcion HTTP (codigo/mensaje, p. ej. ECONNREFUSED). */
function summarizeCause(cause: unknown): CauseSummary | undefined {
  if (typeof cause !== 'object' || cause === null) {
    return cause === undefined
      ? undefined
      : { message: typeof cause === 'string' ? cause : typeof cause };
  }
  const summary: { name?: string; code?: string; message?: string } = {};
  if ('name' in cause && typeof cause.name === 'string') {
    summary.name = cause.name;
  }
  if ('code' in cause && typeof cause.code === 'string') {
    summary.code = cause.code;
  }
  if ('message' in cause && typeof cause.message === 'string' && cause.message !== '') {
    summary.message = cause.message;
  }
  return summary;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  constructor(
    @Inject(APP_LOGGER) private readonly logger: Logger,
    @Inject(HttpAdapterHost) private readonly adapterHost: HttpAdapterHost,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const status = statusOf(exception);
    if (status === 503) {
      // Sondas de readiness frecuentes: warn con la causa, sin traza completa.
      const cause =
        exception instanceof HttpException ? summarizeCause(exception.cause) : undefined;
      this.logger.warn({ status, cause }, 'Request failed');
    } else if (status >= 500) {
      this.logger.error({ err: exception }, 'Request failed');
    }
    const title = TITLES[status] ?? (status >= 500 ? 'Internal Server Error' : 'Bad Request');
    const detail =
      DETAILS[status] ??
      (status >= 500 ? 'An unexpected error occurred.' : 'The request is invalid.');
    const { httpAdapter } = this.adapterHost;
    const response: unknown = host.switchToHttp().getResponse();
    httpAdapter.setHeader(response, 'content-type', PROBLEM_JSON);
    httpAdapter.reply(
      response,
      JSON.stringify({ type: 'about:blank', title, status, detail }),
      status,
    );
  }
}
