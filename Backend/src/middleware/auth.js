const jwt = require("jsonwebtoken")
const { env } = require("../config/env")

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token provided" })
  try {
    req.user = jwt.verify(token, env.JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = { auth }
