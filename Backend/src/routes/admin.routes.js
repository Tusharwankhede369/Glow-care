const express = require("express")
const { upload } = require("../middleware/upload")
const { adminAuth } = require("../middleware/adminAuth")
const {
  adminRegister,
  adminLogin,
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} = require("../controllers/admin.controller")
const { getAdminOverview, getDashboardAnalytics } = require("../controllers/admin.analytics.controller")
const { adminListOrders, adminUpdateOrder } = require("../controllers/admin.orders.controller")
const { adminListCustomers, adminGetCustomer, adminDeleteCustomer } = require("../controllers/admin.users.controller")
const { adminListHomeContent, createHomeContent, updateHomeContent, deleteHomeContent } = require("../controllers/home-content.controller")
const { adminListContactMessages } = require("../controllers/contact.controller")

const router = express.Router()

router.post("/admin/register", adminRegister)
router.post("/admin/login", adminLogin)

router.get("/admin/products", adminAuth, adminListProducts)
router.post("/admin/products", adminAuth, upload.array("images", 8), adminCreateProduct)
router.put("/admin/products/:id", adminAuth, upload.array("images", 8), adminUpdateProduct)
router.delete("/admin/products/:id", adminAuth, adminDeleteProduct)

router.get("/admin/analytics/overview", adminAuth, getAdminOverview)
router.get("/admin/analytics/dashboard", adminAuth, getDashboardAnalytics)

router.get("/admin/orders", adminAuth, adminListOrders)
router.patch("/admin/orders/:id", adminAuth, adminUpdateOrder)

router.get("/admin/customers", adminAuth, adminListCustomers)
router.get("/admin/customers/:id", adminAuth, adminGetCustomer)
router.delete("/admin/customers/:id", adminAuth, adminDeleteCustomer)

router.get("/admin/home-content", adminAuth, adminListHomeContent)
router.post("/admin/home-content", adminAuth, upload.single("image"), createHomeContent)
router.put("/admin/home-content/:id", adminAuth, upload.single("image"), updateHomeContent)
router.delete("/admin/home-content/:id", adminAuth, deleteHomeContent)
router.get("/admin/contact-messages", adminAuth, adminListContactMessages)

module.exports = router

