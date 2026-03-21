/**
 * Zod validation middleware factory.
 * Usage: validate(signupSchema)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    return res.status(400).json({ success: false, errors });
  }

  req.body = result.data; // use the parsed (and possibly transformed) data
  next();
};

module.exports = validate;
