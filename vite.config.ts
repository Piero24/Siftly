/// <reference types="vitest/config" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import metadata from './metadata.json';
import { readFileSync } from 'node:fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL('.', import.meta.url).pathname, '');
  const buildTarget = env.VITE_BUILD_TARGET ?? 'extension';
  const isWebBuild = buildTarget === 'web';

  const { port: SERVER_PORT, apiBase: API_BASE, host: SERVER_HOST, protocol: SERVER_PROTOCOL } = metadata.server;

  // Read scraper constants JSON at build time so it can be injected as a
  // compile-time literal via `define`. This avoids Vite emitting a top-level
  // `const` for a `?raw` import, which causes "Identifier already declared"
  // errors when the Chrome Extension content script is re-injected.
  const scraperConstantsJson = readFileSync(
    new URL('./src/scraper/linkedin/constants.json', import.meta.url).pathname,
    'utf-8',
  );

  return {
    root: isWebBuild ? 'src/web' : '.',
    plugins: [react()],
    base: isWebBuild ? (env.VITE_BASE_PATH || '/') : './',
    server: {
      proxy: isWebBuild ? {
        [API_BASE]: {
          target: `${SERVER_PROTOCOL}://${SERVER_HOST}:${SERVER_PORT}`,
          changeOrigin: true,
        },
      } : undefined,
    },
    define: {
      __SCRAPER_CONSTANTS_RAW__: JSON.stringify(scraperConstantsJson),
    },
    build: {
      chunkSizeWarningLimit: 10000,
      rollupOptions: {
        input: isWebBuild
          ? undefined
          : {
            popup: new URL('./src/popup/index.html', import.meta.url).pathname,
            dashboard: new URL('./src/dashboard/index.html', import.meta.url).pathname,
            background: new URL('./src/background/index.ts', import.meta.url).pathname,
            content: new URL('./src/content/index.ts', import.meta.url).pathname,
            linkedinScraper: new URL('./src/scraper/linkedin/contentScript.ts', import.meta.url).pathname,
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
