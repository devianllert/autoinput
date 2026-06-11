import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';

const buildDate = new Date();
const commitHash = execSync('git rev-parse HEAD').toString().trim();
const version = process.env.npm_package_version;

export default defineConfig({
  main: {
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __BUILD_DATE__: JSON.stringify(buildDate),
      __VERSION__: JSON.stringify(version),
    },
    resolve: {
      alias: {
        '@/main': resolve('src/main'),
        '@/shared': resolve('src/shared'),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        '@/shared': resolve('src/shared'),
      },
    },
  },
  renderer: {
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __BUILD_DATE__: JSON.stringify(buildDate),
      __VERSION__: JSON.stringify(version),
    },
    resolve: {
      alias: {
        '@/renderer': resolve('src/renderer/src'),
        '@/shared': resolve('src/shared'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
