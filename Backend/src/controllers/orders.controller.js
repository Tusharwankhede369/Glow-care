const Order = require("../models/Order")
const Product = require("../models/Product")

async function checkoutCod(req, res) {
  const { items } = req.body
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart items are required for checkout" })
  }

  const itemDocs = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId)
      if (!product) return null
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: Number(item.quantity) || 1,
      }
    })
  )
  const validItems = itemDocs.filter(Boolean)
  if (!validItems.length) return res.status(400).json({ error: "No valid items found" })

  const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 999 ? 0 : 79
  const total = subtotal + shipping

  const order = await Order.create({
    userId: req.user.userId,
    items: validItems,
    pricing: { subtotal, shipping, total },
    payment: { method: "COD", status: "pending" },
    orderStatus: "placed",
  })

  return res.status(201).json({ message: "Order placed successfully", orderId: order._id, order })
}

async function myOrders(req, res) {
  const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 })
  return res.json(orders)
}

module.exports = { checkoutCod, myOrders }

