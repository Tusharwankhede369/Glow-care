const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { env } = require("../config/env")

function signToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: "1d" })
}

async function signup(req, res) {
  try {
    const { name, email, username, password } = req.body
    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Name, email, username and password are required" })
    }
    const user = new User(req.body)
    await user.save()
    return res.status(201).json({ message: "User created successfully" })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Email or username already exists" })
    return res.status(400).json({ error: err.message })
  }
}

async function login(req, res) {
  const { username, password } = req.body
  const normalized = (username || "").trim().toLowerCase()
  const user = await User.findOne({ $or: [{ username: normalized }, { email: normalized }] })
  if (!user) return res.status(401).json({ error: "Invalid username or password" })
  const isMatch = await user.comparePassword(password)
  if (!isMatch) return res.status(401).json({ error: "Invalid username or password" })
  const token = signToken(user)
  return res.json({ token })
}

async function getProfile(req, res) {
  const user = await User.findById(req.user.userId).select("-password")
  return res.json(user)
}

module.exports = { signup, login, getProfile }

