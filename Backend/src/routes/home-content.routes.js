const express = require("express")
const { listHomeContent } = require("../controllers/home-content.controller")
const router = express.Router()
router.get("/home-content", listHomeContent)
module.exports = router
