import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: 'localhost',
    open: false
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      preserveEntrySignatures: 'allow-extension',
      input: {
        main: './index.html',
        'charts-test-bundle': './src/shared/widgets/charts.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'charts-test-bundle') {
            return 'assets/charts-test-bundle.js';
          }
          return 'assets/[name]-[hash].js';
        }
      }
    }
  }
});
