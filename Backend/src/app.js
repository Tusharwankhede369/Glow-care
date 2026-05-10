const express = require("express")
const cors = require("cors")
const path = require("path")
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

  return app
}

module.exports = { createApp }

