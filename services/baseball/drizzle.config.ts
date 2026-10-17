import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // drizzle-kit se ejecuta fuera de la app; lee la misma variable de entorno.
    url: process.env.DATABASE_URL ?? '',
  },
});
