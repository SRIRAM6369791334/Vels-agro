import path from 'node:path';
import { pathToFileURL } from 'node:url';

const frontendDir = 'E:/dashborad clone/frontend';
const viteUrl = pathToFileURL(path.resolve(frontendDir, 'node_modules/vite/dist/node/index.js')).href;
const { build } = await import(viteUrl);

console.log('Building charts-test-bundle.js...');
await build({
  root: frontendDir,
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(frontendDir, 'src/shared/widgets/charts.ts'),
      formats: ['es'],
      fileName: () => 'charts-test-bundle.js',
    },
    outDir: path.resolve(frontendDir, 'dist/assets'),
  },
});
console.log('Build completed successfully!');
