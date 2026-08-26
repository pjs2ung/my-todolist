const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const pool = require('./db/pool');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

const allowlist = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowlist.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        Object.assign(new Error('Not allowed by CORS'), {
          status: 403,
          code: 'CORS_NOT_ALLOWED',
        })
      );
    },
    credentials: true,
  })
);

app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    err.status = 500;
    err.code = 'DB_UNAVAILABLE';
    next(err);
  }
});

app.use(errorHandler);

module.exports = app;
