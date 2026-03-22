const prisma = require("../lib/prisma");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const inviteUser = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { email } = req.body;
    const invitedById = req.user.userId;

    const existing = await prisma.invitation.findUnique({
      where: {
        courseId_email: {
          courseId,
          email,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: "User already invited to this course" });
    }

    const invitation = await prisma.invitation.create({
      data: {
        courseId,
        email,
        invitedById,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        course: true,
      },
    });

    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/accept-invite/${invitation.token}`;
    await sendEmail({
      to: email,
      subject: `Invitation to join course: ${invitation.course.title}`,
      html: `<p>You have been invited to join <strong>${invitation.course.title}</strong>.</p>
             <p>Click <a href="${inviteLink}">here</a> to accept.</p>`,
    });

    res.status(201).json({ message: "Invitation sent successfully", invitation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const listInvitations = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const invitations = await prisma.invitation.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
    });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        course: true,
      },
    });

    if (!invitation) return res.status(404).json({ error: "Invalid token" });
    if (invitation.acceptedAt) return res.status(400).json({ error: "Already accepted" });
    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: "Invitation expired" });
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (user) {
        await prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId: invitation.courseId,
                status: "YET_TO_START"
            }
        }).catch(() => {}); // ignore if already enrolled
    }

    res.json({ message: "Invitation accepted", courseId: invitation.courseId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  inviteUser,
  listInvitations,
  acceptInvite,
};