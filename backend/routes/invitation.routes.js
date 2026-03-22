const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitation.controller");
const authenticate = require("../middlewares/auth");

router.post("/courses/:id/invitations", authenticate, invitationController.inviteUser);
router.get("/courses/:id/invitations", authenticate, invitationController.listInvitations);
router.post("/invitations/accept/:token", invitationController.acceptInvite);

module.exports = router;