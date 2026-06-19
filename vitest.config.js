import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
  },
  resolve: {
    alias: {
      '@utils': path.resolve('src/utils'),
      '@models': path.resolve('src/models'),
      '@sheets': path.resolve('src/sheets'),
      '@hooks': path.resolve('src/hooks'),
      '@effects': path.resolve('src/effects'),
      '@documents': path.resolve('src/documents'),
      '@flows': path.resolve('src/flows'),
      '@importer': path.resolve('src/importer'),
    },
  },
});
