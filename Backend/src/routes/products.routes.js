const express = require("express")
const { getFilterOptions, listProducts, getProduct } = require("../controllers/products.controller")

const router = express.Router()

router.get("/products/filters/options", getFilterOptions)
router.get("/products", listProducts)
router.get("/products/:id", getProduct)

module.exports = router

