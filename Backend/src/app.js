const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
const { env } = require("./config/env")

const authRoutes = require("./routes/auth.routes")
const productsRoutes = require("./routes/products.routes")
const ordersRoutes = require("./routes/orders.routes")
const adminRoutes = require("./routes/admin.routes")

function createApp() {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // uploads are stored at Backend/uploads
  const uploadsPath = path.join(__dirname, "..", "uploads")
  app.use("/uploads", express.static(uploadsPath))

  app.use(
    cors({
      origin: env.CLIENT_ORIGINS,
      credentials: true,
    })
  )

  app.get("/health", (_, res) => res.json({ status: "OK", port: env.PORT }))

  // keep legacy paths as-is for frontend compatibility
  app.use(authRoutes)
  app.use(productsRoutes)
  app.use(ordersRoutes)
  app.use(adminRoutes)

  // A production deployment can run the API and React single-page app from one
  // service. The fallback is deliberately registered after API routes so direct
  // visits such as /shop and /product/:id render instead of returning 404.
  const frontendBuildPath = path.join(__dirname, "..", "..", "frontend", "build")
  const indexPath = path.join(frontendBuildPath, "index.html")
  if (fs.existsSync(indexPath)) {
    app.use(express.static(frontendBuildPath))
    app.get("*", (_, res) => res.sendFile(indexPath))
  }

  return app
}

module.exports = { createApp }

