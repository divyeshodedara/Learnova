const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Can be changed based on provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Learnova Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
};

module.exports = sendEmail;