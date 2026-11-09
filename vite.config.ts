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

// The app picks the page from the path (see src/app/routes.ts).
// GitHub Pages has no rewrites: give each direct route its own index.html.
const ROUTE_ENTRIES = ['terminal', 'landing'];

const routeEntries = (): Plugin => ({
  name: 'route-entries',
  apply: 'build',
  closeBundle() {
    const outDir = resolve(__dirname, 'dist');
    for (const route of ROUTE_ENTRIES) {
      mkdirSync(resolve(outDir, route), { recursive: true });
      copyFileSync(
        resolve(outDir, 'index.html'),
        resolve(outDir, `${route}/index.html`)
      );
    }
  },
});

export default defineConfig({
  plugins: [react(), yamlContent(), routeEntries()],
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
        // React (with its JSX runtime and scheduler) in one shared chunk. The
        // Markdown libraries are left to Rollup, so they load only with the
        // pages that use them instead of on every first load.
        manualChunks: (id) =>
          /node_modules\/(react|react-dom|scheduler)\//.test(id)
            ? 'vendor'
            : undefined,
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
