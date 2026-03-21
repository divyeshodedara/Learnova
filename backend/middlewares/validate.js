/**
 * Zod validation middleware factory.
 * Usage: validate(signupSchema)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errorDetails = result.error.errors
      ? result.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }))
      : [{ message: result.error.message || "Invalid input" }];

    return res.status(400).json({ success: false, errors: errorDetails });
  }

  req.body = result.data; // use the parsed (and possibly transformed) data
  next();
};

module.exports = validate;
