const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Product = require("../models/Product")
const { env } = require("../config/env")
const { parseBool } = require("../utils/parse")

function signAdminToken(user) {
  return jwt.sign({ userId: user._id, role: "admin" }, env.JWT_SECRET, { expiresIn: "1d" })
}

async function adminRegister(req, res) {
  try {
    const name = (req.body.name || "").trim()
    const email = (req.body.email || "").trim().toLowerCase()
    const password = req.body.password || ""
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, password are required" })
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address" })
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" })

    // Only allow a public registration while setting up an empty installation.
    // After that, an explicit setup key is required, preventing public admin creation.
    const hasAdmin = await User.exists({ role: "admin" })
    if (hasAdmin && (!env.ADMIN_SETUP_KEY || req.body.setupKey !== env.ADMIN_SETUP_KEY)) {
      return res.status(403).json({ error: "Admin registration is closed. Sign in with an existing administrator account." })
    }

    const user = new User({
      name,
      email,
      username: email,
      password,
      role: "admin",
      isEmailVerified: true,
    })
    await user.save()
    return res.status(201).json({ message: "Admin created" })
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Email already exists" })
    return res.status(400).json({ error: err.message })
  }
}

async function adminLogin(req, res) {
  try {
    const password = req.body.password || ""
    const normalized = (req.body.email || "").trim().toLowerCase()
    if (!normalized || !password) return res.status(400).json({ error: "Email and password are required" })
    const admin = await User.findOne({ email: normalized, role: "admin" })
    if (!admin) return res.status(401).json({ error: "Invalid email or password" })
    const ok = await admin.comparePassword(password)
    if (!ok) return res.status(401).json({ error: "Invalid email or password" })
    const token = signAdminToken(admin)
    return res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (err) {
    return res.status(500).json({ error: "Unable to sign in. Please try again." })
  }
}

async function adminListProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1 })
  return res.json(products)
}

async function adminCreateProduct(req, res) {
  const body = req.body || {}
  const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`)
  const existingImages = body.images ? JSON.parse(body.images) : []
  const images = [...existingImages, ...uploadedImages].filter(Boolean)
  const product = await Product.create({
    ...body,
    price: Number(body.price),
    stock: body.stock !== undefined && body.stock !== "" ? Number(body.stock) : 100,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
    discount: body.discount ? Number(body.discount) : 0,
    isNatural: parseBool(body.isNatural),
    isCrueltyFree: parseBool(body.isCrueltyFree),
    isVegan: parseBool(body.isVegan),
    images,
    primaryImage: body.primaryImage || images[0] || body.image || "",
    image: body.primaryImage || images[0] || body.image || "",
    sku: body.sku || "",
    variants: body.variants ? JSON.parse(body.variants) : [],
  })
  return res.status(201).json(product)
}

async function adminUpdateProduct(req, res) {
  const body = req.body || {}
  const update = {
    ...body,
  }
  if (body.price !== undefined) update.price = Number(body.price)
  if (body.stock !== undefined && body.stock !== "") update.stock = Number(body.stock)
  if (body.originalPrice !== undefined && body.originalPrice !== "") update.originalPrice = Number(body.originalPrice)
  if (body.discount !== undefined && body.discount !== "") update.discount = Number(body.discount)
  if (body.isNatural !== undefined) update.isNatural = parseBool(body.isNatural)
  if (body.isCrueltyFree !== undefined) update.isCrueltyFree = parseBool(body.isCrueltyFree)
  if (body.isVegan !== undefined) update.isVegan = parseBool(body.isVegan)
  const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`)
  const existingImages = body.images ? JSON.parse(body.images) : undefined
  if (existingImages || uploadedImages.length) {
    update.images = [...(existingImages || []), ...uploadedImages].filter(Boolean)
    update.primaryImage = body.primaryImage || update.images[0] || ""
    update.image = update.primaryImage
  }
  if (body.variants) update.variants = JSON.parse(body.variants)

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!product) return res.status(404).json({ error: "Product not found" })
  return res.json(product)
}

async function adminDeleteProduct(req, res) {
  const deleted = await Product.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ error: "Product not found" })
  return res.json({ message: "Deleted" })
}

module.exports = {
  adminRegister,
  adminLogin,
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
}

