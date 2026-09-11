const express = require("express")
const { signup, login, googleLogin, getProfile } = require("../controllers/auth.controller")
const { updateProfile } = require("../controllers/profile.controller")
const {
  requestEmailVerification,
  verifyEmail,
  verifyEmailOtp,
  resendEmailOtp,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.upgrades.controller")
const { auth } = require("../middleware/auth")
const { upload } = require("../middleware/upload")

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/auth/google", googleLogin)

// auth upgrades
router.post("/auth/request-email-verify", requestEmailVerification)
router.get("/auth/verify-email", verifyEmail)
router.post("/auth/verify-email-otp", verifyEmailOtp)
router.post("/auth/resend-email-otp", resendEmailOtp)
router.post("/auth/verify-login-otp", verifyLoginOtp)
router.post("/auth/resend-login-otp", resendLoginOtp)
router.post("/auth/forgot-password", forgotPassword)
router.post("/auth/reset-password", resetPassword)

router.get("/profile", auth, getProfile)
router.put("/profile", auth, upload.single("avatarFile"), updateProfile)

module.exports = router

