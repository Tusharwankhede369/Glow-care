const Order = require("../models/Order")

async function adminListOrders(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500)
    const orders = await Order.find()
      .populate("userId", "name email phone username")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
    return res.json(orders)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

async function adminUpdateOrder(req, res) {
  try {
    const { orderStatus, paymentStatus } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: "Order not found" })

    if (orderStatus) order.orderStatus = orderStatus
    if (paymentStatus) order.set("payment.status", paymentStatus)

    await order.save()

    const fresh = await Order.findById(order._id).populate("userId", "name email phone username").lean()
    return res.json(fresh)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
}

module.exports = { adminListOrders, adminUpdateOrder }
