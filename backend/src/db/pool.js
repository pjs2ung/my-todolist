const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

pool.on('error', (err) => {
  console.error('[db] idle client error, exiting:', err.message);
  process.exit(1);
});

pool.on('connect', () => {
  console.log('[db] connection established');
});

module.exports = pool;
