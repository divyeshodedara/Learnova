const express = require("express");
const authenticate = require("../middlewares/auth.js");
const authorize = require("../middlewares/authorize.js");
const {
  createUser,
  listUsers,
  updateUser,
  deleteUser
} = require("../controllers/admin.controller.js");

const router = express.Router();

// Route-level middleware to enforce authentication and administrator authorization
router.use(authenticate);
router.use(authorize("ADMIN"));

router.post("/users", createUser);
router.get("/users", listUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
