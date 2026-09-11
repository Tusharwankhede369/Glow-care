const express = require("express")
const { createContactMessage } = require("../controllers/contact.controller")
const router = express.Router()
router.post("/contact", createContactMessage)
module.exports = router
