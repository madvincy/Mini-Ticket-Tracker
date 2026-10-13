module.exports = (error, _req, res, _next) => {
  if (error.status && error.code) {
    const payload = { code: error.code, message: error.message };
    if (error.details) payload.details = error.details;
    return res.status(error.status).json({ error: payload });
  }
  console.error(error);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
  });
};