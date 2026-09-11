const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/User")
const { env } = require("../config/env")
const { sha256 } = require("../utils/tokens")
const { sendMail, hasSmtpEnv } = require("../utils/mailer")

function signToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: "1d" })
}

async function signup(req, res) {
  try {
    const name = (req.body.name || "").trim()
    const email = (req.body.email || "").trim().toLowerCase()
    const username = (req.body.username || "").trim().toLowerCase()
    const password = req.body.password || ""
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Name, email, username and password are required" })
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address" })
    if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
      return res.status(400).json({ error: "Username must be 3–30 characters and use only letters, numbers, dots, hyphens, or underscores" })
    }
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" })

    const user = new User({
      name,
      middleName: (req.body.middleName || "").trim(),
      email,
      username,
      password,
      role: "user",
    })
    await user.save()
    const smtpConfigured = await sendSignupOtp(user)
    return res.status(201).json({
      message: smtpConfigured ? "Account created. Check your email for the verification code." : "Account created, but email delivery is not configured.",
      email: user.email,
      smtpConfigured,
    })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Email or username already exists" })
    return res.status(400).json({ error: err.message })
  }
}

async function login(req, res) {
  try {
    const password = req.body.password || ""
    const normalized = (req.body.username || "").trim().toLowerCase()
    if (!normalized || !password) return res.status(400).json({ error: "Username or email and password are required" })

    const user = await User.findOne({ $or: [{ username: normalized }, { email: normalized }] })
    if (!user) return res.status(401).json({ error: "Invalid username or password" })
    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(401).json({ error: "Invalid username or password" })
    if (!user.isEmailVerified) return res.status(403).json({ error: "Please verify your email address before signing in.", code: "EMAIL_NOT_VERIFIED", email: user.email })
    const smtpConfigured = await sendLoginOtp(user)
    if (!smtpConfigured) return res.status(503).json({ error: "Email delivery is not configured. Login OTP cannot be sent." })
    return res.json({ requiresOtp: true, email: user.email, message: "A sign-in code has been sent to your email." })
  } catch (err) {
    return res.status(500).json({ error: "Unable to sign in. Please try again." })
  }
}

async function googleLogin(req, res) {
  try {
    if (!env.GOOGLE_CLIENT_ID) return res.status(503).json({ error: "Google sign-in is not configured on the server." })
    const credential = String(req.body.credential || "")
    if (!credential) return res.status(400).json({ error: "Google credential is required." })

    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`)
    if (!response.ok) return res.status(401).json({ error: "The Google sign-in token is invalid or expired." })
    const profile = await response.json()
    if (profile.aud !== env.GOOGLE_CLIENT_ID || profile.email_verified !== "true" || !profile.email || !profile.sub) {
      return res.status(401).json({ error: "Google account verification failed." })
    }

    const email = profile.email.trim().toLowerCase()
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email }] })
    if (user?.role === "admin") return res.status(403).json({ error: "Administrator accounts must use administrator login." })

    if (!user) {
      let username = `google_${profile.sub}`.slice(0, 30).toLowerCase()
      if (await User.exists({ username })) username = `${username.slice(0, 24)}_${crypto.randomBytes(3).toString("hex")}`
      user = new User({
        name: String(profile.name || email.split("@")[0]).trim(),
        email,
        username,
        password: crypto.randomBytes(32).toString("hex"),
        googleId: profile.sub,
        avatar: profile.picture || "",
        role: "user",
        isEmailVerified: true,
      })
    } else {
      user.googleId = user.googleId || profile.sub
      user.isEmailVerified = true
      if (!user.avatar && profile.picture) user.avatar = profile.picture
    }
    await user.save()
    return res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "This Google account is already linked. Please try again." })
    return res.status(500).json({ error: "Unable to sign in with Google." })
  }
}

async function sendSignupOtp(user) {
  const otp = String(crypto.randomInt(100000, 1000000))
  user.emailOtpHash = sha256(otp)
  user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()
  await sendMail({
    to: user.email,
    subject: "Your GlowCare verification code",
    text: `Your GlowCare verification code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your GlowCare verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes.</p>`,
  })
  return hasSmtpEnv()
}

async function sendLoginOtp(user) {
  const otp = String(crypto.randomInt(100000, 1000000))
  user.loginOtpHash = sha256(otp)
  user.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()
  await sendMail({
    to: user.email,
    subject: "Your GlowCare sign-in code",
    text: `Your GlowCare sign-in code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your GlowCare sign-in code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p><p>This code expires in 10 minutes. If you did not try to sign in, you can ignore this email.</p>`,
  })
  return hasSmtpEnv()
}

async function getProfile(req, res) {
  const user = await User.findById(req.user.userId).select("-password")
  return res.json(user)
}

module.exports = { signup, login, googleLogin, getProfile, sendSignupOtp, sendLoginOtp, signToken }

