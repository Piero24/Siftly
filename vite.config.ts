/// <reference types="vitest/config" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import metadata from './metadata.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL('.', import.meta.url).pathname, '');
  const buildTarget = env.VITE_BUILD_TARGET ?? 'extension';
  const isWebBuild = buildTarget === 'web';

  const { port: SERVER_PORT, apiBase: API_BASE } = metadata.server;

  return {
    root: isWebBuild ? 'src/web' : '.',
    plugins: [react()],
    base: isWebBuild ? (env.VITE_BASE_PATH || '/') : './',
    server: {
      proxy: isWebBuild ? {
        [API_BASE]: {
          target: `http://localhost:${SERVER_PORT}`,
          changeOrigin: true,
        },
      } : undefined,
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: isWebBuild
          ? undefined
          : {
            popup: new URL('./src/popup/index.html', import.meta.url).pathname,
            dashboard: new URL('./src/dashboard/index.html', import.meta.url).pathname,
            background: new URL('./src/background/index.ts', import.meta.url).pathname,
            content: new URL('./src/content/index.ts', import.meta.url).pathname,
          },
        output: {
          entryFileNames: 'assets/[name].js',
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.tsx'],
      css: false,
      server: {
        deps: {
          inline: [/@csstools\/css-calc/, /@asamuzakjp\/css-color/, /react-simple-maps/, /d3-/],
        },
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
      },
    },
  };
});
