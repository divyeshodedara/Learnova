/**
 * Zod validation middleware factory.
 * Usage: validate(signupSchema)
 */
const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Just extract the message for simplicity
      const errorMessages = result.error.errors.map((e) => e.message);
      
      // Return a flat list of messages in 'error' field if single, or 'errors' if multiple
      const message = errorMessages.length === 1 
        ? errorMessages[0] 
        : errorMessages.join(", ");

      return res.status(400).json({ 
        success: false, 
        message: message, 
        errors: errorMessages 
      });
    }

    req.body = result.data; // use the parsed (and possibly transformed) data
    next();
  } catch (err) {
    console.error("Validation Middleware Error:", err);
    return res.status(500).json({ success: false, message: "Internal validation error" });
  }
};

module.exports = validate;
