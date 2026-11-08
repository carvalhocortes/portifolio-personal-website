import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'yaml';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Turns .yaml files into JS modules at build time, so content/site.yaml ships
// inside the bundle and nothing is fetched at runtime.
const yamlContent = (): Plugin => ({
  name: 'yaml-content',
  transform(code, id) {
    if (!id.endsWith('.yaml')) return null;
    return {
      code: `export default ${JSON.stringify(parse(code))};`,
      map: null,
    };
  },
});

// GitHub Pages has no rewrites, so /desktop gets its own copy of the page.
// The app picks the page from the path (see src/app/routes.ts).
const desktopEntry = (): Plugin => ({
  name: 'desktop-entry',
  apply: 'build',
  closeBundle() {
    const outDir = resolve(__dirname, 'dist');
    mkdirSync(resolve(outDir, 'desktop'), { recursive: true });
    copyFileSync(
      resolve(outDir, 'index.html'),
      resolve(outDir, 'desktop/index.html')
    );
  },
});

export default defineConfig({
  plugins: [react(), yamlContent(), desktopEntry()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        'src/widgets/Terminal/commands/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/entities/**/*.ts',
        'src/shared/config/constants.ts',
      ],
    },
  },
  base: '/',
  build: {
    outDir: './dist',
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          markdown: ['react-markdown', 'remark-gfm'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
      },
    },
  },
  css: {
    modules: {
      // CSS Modules configuration
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@app': resolve(__dirname, './src/app'),
      '@entities': resolve(__dirname, './src/entities'),
      '@features': resolve(__dirname, './src/features'),
      '@pages': resolve(__dirname, './src/pages'),
      '@shared': resolve(__dirname, './src/shared'),
      '@widgets': resolve(__dirname, './src/widgets'),
    },
  },
});
