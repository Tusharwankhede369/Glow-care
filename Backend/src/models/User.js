const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    middleName: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    avatar: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },

    // phase-2: email verification + password reset
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyTokenHash: { type: String, default: "" },
    emailVerifyTokenExpiresAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: "" },
    passwordResetTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
)

userSchema.pre("save", async function saveHook(next) {
  if (this.email) this.email = this.email.trim().toLowerCase()
  if (this.username) this.username = this.username.trim().toLowerCase()
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
