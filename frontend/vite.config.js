import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL;

  return {
    server: {
      port: 5173,
      host: 'localhost',
      open: false,
      proxy: backendUrl
        ? {
            '/api': {
              target: backendUrl,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        preserveEntrySignatures: 'allow-extension',
        input: {
          main: './index.html',
          'charts-test-bundle': './src/shared/widgets/charts.ts',
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'charts-test-bundle') {
              return 'assets/charts-test-bundle.js';
            }
            return 'assets/[name]-[hash].js';
          },
        },
      },
    },
  };
});
