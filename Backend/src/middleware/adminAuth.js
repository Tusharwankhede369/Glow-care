const jwt = require("jsonwebtoken")
const { env } = require("../config/env")

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token provided" })
  try {
    const payload = jwt.verify(token, env.JWT_SECRET)
    if (payload.role !== "admin") return res.status(403).json({ error: "Admin access required" })
    req.user = payload
    return next()
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = { adminAuth }

