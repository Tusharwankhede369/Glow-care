const Order = require("../models/Order")
const Product = require("../models/Product")
const User = require("../models/User")

async function getAdminOverview(_, res) {
  const [ordersCount, revenueAgg, paymentsAgg] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: "$pricing.total" },
          cod: { $sum: { $cond: [{ $eq: ["$payment.method", "COD"] }, "$pricing.total", 0] } },
        },
      },
    ]),
    Order.aggregate([
      { $group: { _id: "$payment.method", total: { $sum: "$pricing.total" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ])

  const revenue = revenueAgg?.[0]?.revenue || 0
  const codRevenue = revenueAgg?.[0]?.cod || 0
  const onlineRevenue = Math.max(0, revenue - codRevenue)

  return res.json({
    ordersCount,
    revenue,
    revenueBreakdown: { cod: codRevenue, online: onlineRevenue },
    paymentMethods: paymentsAgg.map((p) => ({ method: p._id || "unknown", total: p.total, count: p.count })),
  })
}

function monthSeriesKeys() {
  const keys = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
    })
  }
  return keys
}

async function getDashboardAnalytics(_, res) {
  try {
    const now = new Date()
    const start12 = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const start30 = new Date(now)
    start30.setDate(start30.getDate() - 30)

    const [
      overviewOrders,
      revenueAgg,
      paymentsAgg,
      monthlyRaw,
      topProducts,
      unitsLast30,
      stockAgg,
      lowStockProducts,
      customersCount,
      activeProductsCount,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: "$pricing.total" },
            cod: { $sum: { $cond: [{ $eq: ["$payment.method", "COD"] }, "$pricing.total", 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $group: { _id: "$payment.method", total: { $sum: "$pricing.total" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start12 } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            revenue: { $sum: "$pricing.total" },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            units: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { units: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            productId: "$_id",
            name: { $ifNull: ["$product.name", "Deleted product"] },
            image: "$product.image",
            stock: "$product.stock",
            units: 1,
            revenue: 1,
          },
        },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start30 } } },
        { $unwind: "$items" },
        { $group: { _id: null, units: { $sum: "$items.quantity" } } },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: "$stock" },
            skuCount: { $sum: 1 },
            lowStockItems: {
              $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] },
            },
            outOfStock: {
              $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
            },
          },
        },
      ]),
      Product.find({ stock: { $lte: 10 } })
        .select("name stock category brand image")
        .sort({ stock: 1 })
        .limit(12)
        .lean(),
      User.countDocuments({ role: { $ne: "admin" } }),
      Product.countDocuments({ status: "active" }),
    ])

    const revenue = revenueAgg?.[0]?.revenue || 0
    const codRevenue = revenueAgg?.[0]?.cod || 0
    const onlineRevenue = Math.max(0, revenue - codRevenue)

    const monthMap = new Map(
      monthlyRaw.map((r) => [`${r._id.year}-${r._id.month}`, { revenue: r.revenue, orders: r.orders }])
    )

    const monthlyChart = monthSeriesKeys().map(({ year, month, label }) => {
      const hit = monthMap.get(`${year}-${month}`)
      return {
        label,
        revenue: hit?.revenue ?? 0,
        orders: hit?.orders ?? 0,
      }
    })

    const totalRevenue12m = monthlyChart.reduce((s, m) => s + m.revenue, 0)
    const totalOrders12m = monthlyChart.reduce((s, m) => s + m.orders, 0)

    const stock = stockAgg[0] || {
      totalStock: 0,
      skuCount: 0,
      lowStockItems: 0,
      outOfStock: 0,
    }

    const unitsSold30d = unitsLast30[0]?.units ?? 0

    const avgOrderValue = overviewOrders > 0 ? revenue / overviewOrders : 0

    return res.json({
      overview: {
        ordersCount: overviewOrders,
        revenue,
        revenueBreakdown: { cod: codRevenue, online: onlineRevenue },
        avgOrderValue,
        customersCount,
        activeProductsCount,
      },
      paymentMethods: paymentsAgg.map((p) => ({
        method: p._id || "unknown",
        total: p.total,
        count: p.count,
      })),
      monthlyChart,
      summary12m: {
        revenue: totalRevenue12m,
        orders: totalOrders12m,
      },
      topSellingProducts: topProducts,
      unitsSoldLast30Days: unitsSold30d,
      stock: {
        totalUnits: stock.totalStock ?? 0,
        skuCount: stock.skuCount ?? 0,
        lowStockCount: stock.lowStockItems ?? 0,
        outOfStockCount: stock.outOfStock ?? 0,
        lowStockProducts,
      },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

module.exports = { getAdminOverview, getDashboardAnalytics }
