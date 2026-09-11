const ContactMessage = require("../models/ContactMessage")
const { sendMail, hasSmtpEnv } = require("../utils/mailer")

async function createContactMessage(req, res) {
  const name = String(req.body.name || "").trim()
  const email = String(req.body.email || "").trim().toLowerCase()
  const subject = String(req.body.subject || "").trim()
  const message = String(req.body.message || "").trim()
  if (!name || !email || !message) return res.status(400).json({ error: "Name, email, and message are required." })
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." })
  const saved = await ContactMessage.create({ name, email, subject, message })
  if (hasSmtpEnv() && process.env.CONTACT_TO_EMAIL) {
    await sendMail({ to: process.env.CONTACT_TO_EMAIL, subject: `Contact: ${subject || "New message"}`, text: `${name} <${email}>\n\n${message}` })
  }
  res.status(201).json({ message: "Thanks — your message has been sent.", id: saved._id })
}

async function adminListContactMessages(_, res) {
  res.json(await ContactMessage.find().sort({ createdAt: -1 }))
}

module.exports = { createContactMessage, adminListContactMessages }
