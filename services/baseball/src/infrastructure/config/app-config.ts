import { z } from 'zod';

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

const envSchema = z.object({
  DATABASE_URL: z
    .string({ error: 'is required' })
    .refine(
      (value) => URL.canParse(value) && /^postgres(ql)?:\/\//.test(value),
      'must be a postgres:// or postgresql:// URL',
    ),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export interface AppConfig {
  readonly databaseUrl: string;
  readonly logLevel: (typeof LOG_LEVELS)[number];
  readonly port: number;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Lee y valida la configuracion desde variables de entorno.
 * El mensaje de error nombra las variables invalidas pero nunca incluye sus valores.
 */
export function loadConfig(env: Readonly<Record<string, string | undefined>>): AppConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.map(String).join('.')}: ${issue.message}`)
      .join('; ');
    throw new ConfigError(`Invalid configuration: ${problems}`);
  }
  return {
    databaseUrl: result.data.DATABASE_URL,
    logLevel: result.data.LOG_LEVEL,
    port: result.data.PORT,
  };
}
