const crypto = require("crypto")

function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex")
}

function sha256(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex")
}

module.exports = { generateToken, sha256 }

