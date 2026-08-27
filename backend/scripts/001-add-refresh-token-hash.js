require('dotenv').config();
const pool = require('../src/db/pool');

async function main() {
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT;');
  console.log('[migration] 001-add-refresh-token-hash: done');
  await pool.end();
}

main().catch((err) => {
  console.error('[migration] 001-add-refresh-token-hash failed:', err);
  process.exit(1);
});
