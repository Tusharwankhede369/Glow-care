function getEnv(name, fallback) {
  const v = process.env[name]
  if (v === undefined || v === null || v === "") return fallback
  return v
}

function getEnvNumber(name, fallback) {
  const v = getEnv(name, "")
  if (!v) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnvNumber("PORT", 5000),
  JWT_SECRET: getEnv("JWT_SECRET", "dev_secret_key"),
  MONGODB_URI: getEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/Glowcare"),
  CLIENT_ORIGINS: getEnv("CLIENT_ORIGINS", "http://localhost:3000,http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
}

module.exports = { env }
