import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// Los decoradores de Nest necesitan emitDecoratorMetadata; esbuild/Oxc no lo emiten,
// por eso se usa SWC. Si Vite elimina la metadata, se desactivaria Oxc con `oxc: false`.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
