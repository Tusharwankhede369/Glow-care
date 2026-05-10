const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    pricing: {
      subtotal: Number,
      shipping: Number,
      total: Number,
    },
    payment: {
      method: { type: String, default: "COD" },
      status: { type: String, default: "pending" },
      transactionId: { type: String, default: "" },
    },
    orderStatus: { type: String, default: "placed" },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Order", orderSchema)
