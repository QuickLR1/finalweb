const nodemailer = require("nodemailer");

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

async function sendWelcomeEmail(to, username) {
  const transporter = createTransport();
  const from = process.env.MAIL_FROM;
  await transporter.sendMail({
    from,
    to,
    subject: "Welcome to Notes App",
    text: `Hi ${username}! Your account was created successfully.`
  });
}

module.exports = { sendWelcomeEmail };
