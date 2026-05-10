const User = require("../models/User")
const Order = require("../models/Order")

/** Emails that look like placeholders / demos — not shown in admin customer list */
function isExcludedPlaceholderEmail(email) {
  if (!email || typeof email !== "string") return true
  const lower = email.trim().toLowerCase()
  const domain = lower.split("@")[1] || ""
  if (!domain) return true
  if (/^(example\.com|example\.org|example\.net|test\.com|localhost)$/i.test(domain)) return true
  if (/^(demo|fake|testuser|fakeuser)\d*$/i.test(lower.split("@")[0])) return true
  return false
}

async function adminListCustomers(req, res) {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password -emailVerifyTokenHash -passwordResetTokenHash")
      .sort({ createdAt: -1 })
      .lean()

    const realUsers = users.filter((u) => u.email && !isExcludedPlaceholderEmail(u.email))

    const ids = realUsers.map((u) => u._id)
    if (ids.length === 0) return res.json([])

    const stats = await Order.aggregate([
      { $match: { userId: { $in: ids } } },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$pricing.total" },
        },
      },
    ])
    const statMap = new Map(stats.map((s) => [String(s._id), s]))

    const enriched = realUsers.map((u) => {
      const s = statMap.get(String(u._id))
      return {
        ...u,
        orderCount: s?.orderCount ?? 0,
        totalSpent: s?.totalSpent ?? 0,
      }
    })

    return res.json(enriched)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const PRIVATE_FIELDS = "-password -emailVerifyTokenHash -passwordResetTokenHash"

async function adminGetCustomer(req, res) {
  try {
    const user = await User.findById(req.params.id).select(PRIVATE_FIELDS).lean()
    if (!user) return res.status(404).json({ error: "User not found" })
    if (user.role === "admin") {
      return res.status(403).json({ error: "Administrator profiles are not available in this view" })
    }

    const userOid = user._id

    const [orders, agg] = await Promise.all([
      Order.find({ userId: userOid }).sort({ createdAt: -1 }).limit(75).lean(),
      Order.aggregate([
        { $match: { userId: userOid } },
        {
          $group: {
            _id: null,
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$pricing.total" },
          },
        },
      ]),
    ])

    const summary = agg[0] || { orderCount: 0, totalSpent: 0 }

    return res.json({
      user,
      orders,
      summary: {
        orderCount: summary.orderCount ?? 0,
        totalSpent: summary.totalSpent ?? 0,
      },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

async function adminDeleteCustomer(req, res) {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: "User not found" })
    if (user.role === "admin") return res.status(403).json({ error: "Cannot delete an administrator account" })

    await Order.deleteMany({ userId: user._id })
    await User.deleteOne({ _id: user._id })

    return res.json({ message: "Customer and their orders were removed" })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

module.exports = { adminListCustomers, adminGetCustomer, adminDeleteCustomer }
