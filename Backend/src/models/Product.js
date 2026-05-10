const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    subcategory: { type: String, default: "" },
    brand: { type: String, required: true },
    gender: { type: String, default: "Unisex" },
    skinType: { type: String, default: "" },
    hairType: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    material: { type: String, default: "" },
    availability: { type: String, default: "In Stock" },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 4.2 },
    numReviews: { type: Number, default: 10 },
    stock: { type: Number, default: 100 },
    featured: { type: Boolean, default: false },
    isNatural: { type: Boolean, default: false },
    isCrueltyFree: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Product", productSchema)
