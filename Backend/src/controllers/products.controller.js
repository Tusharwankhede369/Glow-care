const Product = require("../models/Product")
const { parseBool } = require("../utils/parse")

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function getFilterOptions(_, res) {
  const [categories, brands, subcategories, genders, skinTypes, hairTypes, sizes, minPriceRow, maxPriceRow] =
    await Promise.all([
      Product.distinct("category"),
      Product.distinct("brand"),
      Product.distinct("subcategory"),
      Product.distinct("gender"),
      Product.distinct("skinType"),
      Product.distinct("hairType"),
      Product.distinct("size"),
      Product.findOne().sort({ price: 1 }).select("price -_id"),
      Product.findOne().sort({ price: -1 }).select("price -_id"),
    ])

  return res.json({
    categories,
    brands,
    subcategories,
    genders,
    skinTypes,
    hairTypes,
    sizes,
    priceRange: {
      minPrice: minPriceRow?.price || 0,
      maxPrice: maxPriceRow?.price || 0,
    },
  })
}

async function listProducts(req, res) {
  const {
    category,
    brand,
    subcategory,
    gender,
    skinType,
    hairType,
    size,
    minPrice,
    maxPrice,
    search,
    isNatural,
    isCrueltyFree,
    isVegan,
    limit = 12,
    page = 1,
  } = req.query

  const query = {}
  if (category) query.category = new RegExp(`^${escapeRegex(category)}$`, "i")
  if (brand) query.brand = brand
  if (subcategory) query.subcategory = subcategory
  if (gender) query.gender = gender
  if (skinType) query.skinType = skinType
  if (hairType) query.hairType = hairType
  if (size) query.size = size
  if (search) query.name = { $regex: search, $options: "i" }
  if (isNatural !== undefined) query.isNatural = parseBool(isNatural)
  if (isCrueltyFree !== undefined) query.isCrueltyFree = parseBool(isCrueltyFree)
  if (isVegan !== undefined) query.isVegan = parseBool(isVegan)
  if (minPrice || maxPrice) {
    query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)
  }

  const pageNum = Number(page)
  const limitNum = Math.min(Number(limit), 50)
  const skip = (pageNum - 1) * limitNum

  const [products, totalProducts] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ])

  const totalPages = Math.max(1, Math.ceil(totalProducts / limitNum))
  return res.json({
    products,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalProducts,
      hasPrev: pageNum > 1,
      hasNext: pageNum < totalPages,
    },
  })
}

async function getProduct(req, res) {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ error: "Product not found" })
  return res.json(product)
}

module.exports = { getFilterOptions, listProducts, getProduct }

