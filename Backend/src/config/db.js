const mongoose = require("mongoose")
const { env } = require("./env")

async function connectDb() {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected")
  })
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error", err)
  })
  await mongoose.connect(env.MONGODB_URI)
  return mongoose.connection
}

async function disconnectDb() {
  if (mongoose.connection?.readyState) {
    await mongoose.connection.close()
  }
}

module.exports = { connectDb, disconnectDb }
