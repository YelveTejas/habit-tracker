import nodemailer from 'nodemailer';

export const emailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!emailConfigured()) {
    console.warn(`[email] SMTP not configured - skipped "${subject}" to ${to}`);
    return false;
  }
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'HabitFlow <no-reply@habitflow.app>',
    to,
    subject,
    html,
    text,
  });
  return true;
};

export default sendEmail;
