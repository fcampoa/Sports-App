import { Writable } from 'node:stream';
import pino from 'pino';
import { describe, expect, it } from 'vitest';
import { createLogger, PinoLoggerService } from '../../../src/infrastructure/logging/logger.js';

function capture(): { lines: Record<string, unknown>[]; service: PinoLoggerService } {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback): void {
      const parsed: unknown = JSON.parse(chunk.toString('utf8'));
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        lines.push(Object.fromEntries(Object.entries(parsed)));
      }
      callback();
    },
  });
  return { lines, service: new PinoLoggerService(pino({ level: 'trace' }, stream)) };
}

describe('Logging JSON (pino)', () => {
  it('los mensajes de Nest salen como JSON con nivel numerico, mensaje y contexto', () => {
    const { lines, service } = capture();
    service.log('Nest application successfully started', 'NestApplication');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      level: 30,
      msg: 'Nest application successfully started',
      context: 'NestApplication',
    });
  });

  it('error con una instancia de Error conserva el error en el campo err', () => {
    const { lines, service } = capture();
    service.error(new Error('boom'), 'Ctx');
    expect(lines[0]).toMatchObject({ level: 50, msg: 'boom', context: 'Ctx' });
    expect(lines[0]).toHaveProperty('err');
  });

  it('mapea warn, debug, verbose y fatal a los niveles de pino', () => {
    const { lines, service } = capture();
    service.warn('w');
    service.debug('d');
    service.verbose('v');
    service.fatal('f');
    expect(lines.map((line) => line.level)).toEqual([40, 20, 10, 60]);
  });

  it('createLogger respeta el nivel configurado', () => {
    expect(createLogger('warn').level).toBe('warn');
  });
});
