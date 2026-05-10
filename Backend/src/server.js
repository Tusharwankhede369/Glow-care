const { env } = require("./config/env")
const { connectDb, disconnectDb } = require("./config/db")
const { seedProductsIfEmpty } = require("./seed/products")
const { createApp } = require("./app")

async function start() {
  await connectDb()
  await seedProductsIfEmpty()

  const app = createApp()
  let port = env.PORT

  function listen() {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        port += 1
        listen()
      } else {
        console.error(err)
      }
    })
  }

  listen()

  process.on("SIGINT", async () => {
    await disconnectDb()
    process.exit(0)
  })
}

start().catch((err) => {
  console.error("Server startup failed", err)
  process.exit(1)
})

