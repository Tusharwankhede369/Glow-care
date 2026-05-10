const express = require("express")
const { signup, login, getProfile } = require("../controllers/auth.controller")
const { updateProfile } = require("../controllers/profile.controller")
const {
  requestEmailVerification,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.upgrades.controller")
const { auth } = require("../middleware/auth")
const { upload } = require("../middleware/upload")

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)

// auth upgrades
router.post("/auth/request-email-verify", requestEmailVerification)
router.get("/auth/verify-email", verifyEmail)
router.post("/auth/forgot-password", forgotPassword)
router.post("/auth/reset-password", resetPassword)

router.get("/profile", auth, getProfile)
router.put("/profile", auth, upload.single("avatarFile"), updateProfile)

module.exports = router

