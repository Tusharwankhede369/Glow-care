const nodemailer = require("nodemailer")

function hasSmtpEnv() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function sendMail({ to, subject, html, text }) {
  if (!hasSmtpEnv()) {
    return { skipped: true, reason: "SMTP not configured" }
  }
  const transporter = createTransport()
  const from = process.env.MAIL_FROM || process.env.SMTP_USER
  const info = await transporter.sendMail({ from, to, subject, html, text })
  return { skipped: false, messageId: info.messageId }
}

module.exports = { sendMail, hasSmtpEnv }

