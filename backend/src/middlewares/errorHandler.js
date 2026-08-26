// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR');

  if (status === 500) {
    console.error(err.stack || err.message);
  }

  res.status(status).json({ code, message: err.message });
}

module.exports = errorHandler;
