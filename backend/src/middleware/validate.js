const HttpError = require('../errors/http-error');

const validate = (schema, source) => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message
    }));
    return next(new HttpError(400, 'VALIDATION_ERROR', 'Invalid input', details));
  }
  req.validated = { ...req.validated, [source]: result.data };
  return next();
};

module.exports = validate;