const User = require("../models/User")
const { generateToken, sha256 } = require("../utils/tokens")
const { sendMail, hasSmtpEnv } = require("../utils/mailer")

function buildAppUrl(req, path) {
  const base = process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`
  return `${base}${path}`
}

async function requestEmailVerification(req, res) {
  const { email } = req.body
  const normalizedEmail = (email || "").trim().toLowerCase()
  if (!normalizedEmail) return res.status(400).json({ error: "Email is required" })

  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    return res.json({ message: "If the email exists, a verification link has been sent." })
  }
  if (user.isEmailVerified) {
    return res.json({ message: "Email is already verified." })
  }

  const rawToken = generateToken(24)
  user.emailVerifyTokenHash = sha256(rawToken)
  user.emailVerifyTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
  await user.save()

  const verifyUrl = buildAppUrl(req, `/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`)
  const canSend = hasSmtpEnv()
  await sendMail({
    to: user.email,
    subject: "Verify your Glow Care account",
    text: `Verify your email: ${verifyUrl}`,
    html: `<p>Verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
  })

  return res.json({
    message: "Verification link sent (or skipped if SMTP not configured).",
    smtpConfigured: canSend,
  })
}

async function verifyEmail(req, res) {
  const { token, email } = req.query
  const normalizedEmail = (email || "").trim().toLowerCase()
  if (!token || !normalizedEmail) return res.status(400).json({ error: "token and email are required" })

  const tokenHash = sha256(token)
  const user = await User.findOne({
    email: normalizedEmail,
    emailVerifyTokenHash: tokenHash,
    emailVerifyTokenExpiresAt: { $gt: new Date() },
  })
  if (!user) return res.status(400).json({ error: "Invalid or expired verification token" })

  user.isEmailVerified = true
  user.emailVerifyTokenHash = ""
  user.emailVerifyTokenExpiresAt = null
  await user.save()

  return res.json({ message: "Email verified successfully" })
}

async function forgotPassword(req, res) {
  const { email } = req.body
  const normalizedEmail = (email || "").trim().toLowerCase()
  if (!normalizedEmail) return res.status(400).json({ error: "Email is required" })

  const user = await User.findOne({ email: normalizedEmail })
  // Always respond OK to avoid user enumeration
  if (!user) return res.json({ message: "If the email exists, a reset link has been sent." })

  const rawToken = generateToken(24)
  user.passwordResetTokenHash = sha256(rawToken)
  user.passwordResetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 20) // 20 minutes
  await user.save()

  const resetUrl = buildAppUrl(req, `/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`)
  const canSend = hasSmtpEnv()
  await sendMail({
    to: user.email,
    subject: "Reset your Glow Care password",
    text: `Reset your password: ${resetUrl}`,
    html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  })

  return res.json({
    message: "Reset link sent (or skipped if SMTP not configured).",
    smtpConfigured: canSend,
  })
}

async function resetPassword(req, res) {
  const { token, email, newPassword } = req.body
  const normalizedEmail = (email || "").trim().toLowerCase()
  if (!token || !normalizedEmail || !newPassword) {
    return res.status(400).json({ error: "token, email, newPassword are required" })
  }
  if (String(newPassword).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" })

  const tokenHash = sha256(token)
  const user = await User.findOne({
    email: normalizedEmail,
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiresAt: { $gt: new Date() },
  })
  if (!user) return res.status(400).json({ error: "Invalid or expired reset token" })

  user.password = newPassword
  user.passwordResetTokenHash = ""
  user.passwordResetTokenExpiresAt = null
  await user.save()

  return res.json({ message: "Password reset successfully" })
}

module.exports = { requestEmailVerification, verifyEmail, forgotPassword, resetPassword }

