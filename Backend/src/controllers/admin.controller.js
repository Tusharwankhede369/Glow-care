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
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, password are required" })

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
  const { email, password } = req.body
  const normalized = (email || "").trim().toLowerCase()
  const admin = await User.findOne({ email: normalized, role: "admin" })
  if (!admin) return res.status(401).json({ error: "Invalid email or password" })
  const ok = await admin.comparePassword(password)
  if (!ok) return res.status(401).json({ error: "Invalid email or password" })
  const token = signAdminToken(admin)
  return res.json({
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  })
}

async function adminListProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1 })
  return res.json(products)
}

async function adminCreateProduct(req, res) {
  const body = req.body || {}
  const imagePath = req.file ? `/uploads/${req.file.filename}` : ""
  const product = await Product.create({
    ...body,
    price: Number(body.price),
    stock: body.stock !== undefined && body.stock !== "" ? Number(body.stock) : 100,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
    discount: body.discount ? Number(body.discount) : 0,
    isNatural: parseBool(body.isNatural),
    isCrueltyFree: parseBool(body.isCrueltyFree),
    isVegan: parseBool(body.isVegan),
    image: imagePath || body.image || "",
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
  if (req.file) update.image = `/uploads/${req.file.filename}`

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

