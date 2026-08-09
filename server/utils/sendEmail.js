const nodemailer = require('nodemailer');

// Thin wrapper around Nodemailer. Configured via SMTP env vars so it works
// with any provider (Gmail app password, SendGrid, Mailtrap for dev, etc).
// If SMTP_HOST isn't set, emails are skipped (logged only) so the app still
// runs fine without email configured — this is optional infrastructure.
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
};

// Sends an email; silently no-ops (with a console log) if SMTP isn't configured,
// and never throws — a failed notification email should never break the
// request that triggered it (e.g. posting an announcement).
const sendEmail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[email skipped - SMTP not configured] to=${to} subject="${subject}"`);
    return { skipped: true };
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || 'College Management System <no-reply@cms.edu>',
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error('Failed to send email:', err.message);
    return { sent: false, error: err.message };
  }
};

module.exports = sendEmail;
