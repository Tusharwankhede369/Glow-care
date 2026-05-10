const Product = require("../models/Product")

async function seedProductsIfEmpty() {
  const count = await Product.countDocuments()
  if (count > 0) return
  await Product.insertMany([
    {
      name: "Hydra Glow Face Serum",
      description: "Hydrating serum with niacinamide and hyaluronic acid.",
      category: "Skincare",
      subcategory: "Serum",
      brand: "Glow Care",
      skinType: "All Skin Types",
      size: "30ml",
      price: 499,
      originalPrice: 699,
      discount: 29,
      featured: true,
      isNatural: true,
      isCrueltyFree: true,
      isVegan: true,
      image: "",
    },
    {
      name: "Vitamin C Brightening Cleanser",
      category: "Skincare",
      subcategory: "Cleanser",
      brand: "Glow Care",
      skinType: "Combination",
      size: "100ml",
      price: 349,
      originalPrice: 449,
      discount: 22,
      featured: true,
      isCrueltyFree: true,
      image: "",
    },
    {
      name: "Nourish Hair Repair Oil",
      category: "Haircare",
      subcategory: "Oil",
      brand: "Glow Care",
      hairType: "Dry Hair",
      size: "100ml",
      price: 399,
      originalPrice: 499,
      discount: 20,
      featured: false,
      isNatural: true,
      isVegan: true,
      image: "",
    },
    {
      name: "Floral Mist Perfume",
      category: "Perfume",
      subcategory: "Body Mist",
      brand: "Glow Care",
      gender: "Women",
      size: "80ml",
      price: 899,
      originalPrice: 1299,
      discount: 31,
      featured: true,
      image: "",
    },
  ])
}

module.exports = { seedProductsIfEmpty }
