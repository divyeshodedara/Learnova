/**
 * Zod validation middleware factory.
 * Usage: validate(signupSchema)
 */
const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      let errorMessages = [];
      let message = "Invalid input";

      // Defensive check: handle cases where zod error structure varies
      if (result.error) {
        if (Array.isArray(result.error.errors)) {
          errorMessages = result.error.errors.map((e) => e.message);
        } else if (typeof result.error.flatten === "function") {
          const flattened = result.error.flatten();
          errorMessages = [
            ...flattened.formErrors,
            ...Object.values(flattened.fieldErrors).flat(),
          ];
        } else {
          // Fallback
          errorMessages = [result.error.message || "Validation failed"];
        }
      }

      // Construct a single string message
      if (errorMessages.length > 0) {
        message = errorMessages.join(", ");
      }

      return res.status(400).json({
        success: false,
        message: message,
        errors: errorMessages,
      });
    }

    req.body = result.data; // use the parsed data
    next();
  } catch (err) {
    console.error("Validation Middleware Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal validation error" });
  }
};

module.exports = validate;
