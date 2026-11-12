import { runMigrations } from '../migrations/runner.js';

(async () => {
  try {
    await runMigrations();
    process.exit(0);
  } catch (error) {
    console.error('Migration process exited with errors.');
    process.exit(1);
  }
})();
