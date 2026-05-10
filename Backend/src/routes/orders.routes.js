const express = require("express")
const { auth } = require("../middleware/auth")
const { checkoutCod, myOrders } = require("../controllers/orders.controller")

const router = express.Router()

router.post("/checkout/cod", auth, checkoutCod)
router.get("/orders/my", auth, myOrders)

module.exports = router

