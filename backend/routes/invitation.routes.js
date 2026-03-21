const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitation.controller");

router.post("/courses/:id/invitations", invitationController.inviteUser);
router.get("/courses/:id/invitations", invitationController.listInvitations);
router.post("/invitations/accept/:token", invitationController.acceptInvite);

module.exports = router;