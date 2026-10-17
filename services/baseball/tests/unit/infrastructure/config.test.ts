import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from '../../../src/infrastructure/config/app-config.js';

const VALID = { DATABASE_URL: 'postgres://u:p@localhost:5432/db' };

describe('Configuracion (Zod)', () => {
  it('lee DATABASE_URL, LOG_LEVEL y PORT del entorno', () => {
    const config = loadConfig({ ...VALID, LOG_LEVEL: 'debug', PORT: '8080' });
    expect(config).toEqual({
      databaseUrl: 'postgres://u:p@localhost:5432/db',
      logLevel: 'debug',
      port: 8080,
    });
  });

  it('aplica valores por defecto a LOG_LEVEL (info) y PORT (3000)', () => {
    const config = loadConfig(VALID);
    expect(config.logLevel).toBe('info');
    expect(config.port).toBe(3000);
  });

  it('falla con mensaje claro si falta DATABASE_URL', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
  });

  it.each([
    ['DATABASE_URL no es una URL', { DATABASE_URL: 'no-es-url' }, /DATABASE_URL/],
    ['DATABASE_URL con protocolo http', { DATABASE_URL: 'http://localhost/db' }, /DATABASE_URL/],
    ['PORT no numerico', { ...VALID, PORT: 'abc' }, /PORT/],
    ['PORT fuera de rango', { ...VALID, PORT: '70000' }, /PORT/],
    ['PORT cero', { ...VALID, PORT: '0' }, /PORT/],
    ['PORT no entero', { ...VALID, PORT: '80.5' }, /PORT/],
    ['LOG_LEVEL desconocido', { ...VALID, LOG_LEVEL: 'verbose' }, /LOG_LEVEL/],
  ])('falla si %s', (_name, env, pattern) => {
    expect(() => loadConfig(env)).toThrow(ConfigError);
    expect(() => loadConfig(env)).toThrow(pattern);
  });

  it('no incluye el valor de DATABASE_URL en el mensaje de error (secretos)', () => {
    try {
      loadConfig({ DATABASE_URL: 'postgres://user:SECRETO@host', PORT: 'abc' });
      expect.unreachable('debia lanzar');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect(String(error)).not.toContain('SECRETO');
    }
  });
});
