require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const app = express()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("✅ Created uploads directory")
}

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Add your frontend URLs
    credentials: true,
  }),
)
app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))
app.use("/uploads", express.static(uploadsDir)) // Serve uploaded files

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err)
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 5MB." })
    }
    return res.status(400).json({ error: "File upload error: " + err.message })
  }
  res.status(500).json({ error: "Internal server error: " + err.message })
})

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const extension = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + extension)
  },
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("📁 File upload attempt:", file.originalname, file.mimetype)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/avif"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed!"), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Multer setup for avatar uploads
const storageAvatar = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `avatar_${req.user.userId}_${Date.now()}${ext}`)
  },
})
const uploadAvatar = multer({ storage: storageAvatar })

// Serve uploaded files statically
app.use("/uploads", require("express").static(path.join(__dirname, "uploads")))

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "7996b1d7f0d5e1a37f2284505e1854c0a534913b61104b31221716736fa60fa4"
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Obrien"
const PORT = process.env.PORT || 5000

// Database connection with better error handling
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully")
    console.log("📊 Database:", mongoose.connection.name)
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  avatar: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  originalPrice: {
    type: Number,
    min: [0, "Original price cannot be negative"],
  },
  discount: {
    type: Number,
    min: [0, "Discount cannot be negative"],
    max: [100, "Discount cannot exceed 100%"],
    default: 0,
  },
  image: {
    type: String,
    required: [true, "Product image is required"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, "Brand is required"],
    trim: true,
  },
  color: {
    type: String,
    trim: true,
    default: "",
  },
  material: {
    type: String,
    trim: true,
    default: "",
  },
  size: {
    type: String,
    trim: true,
    default: "",
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, "Stock quantity cannot be negative"],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving for both User and Admin
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Update the updatedAt field before saving
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const User = mongoose.model("User", userSchema)
const Admin = mongoose.model("Admin", adminSchema)
const Product = mongoose.model("Product", productSchema)

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." })
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    console.error("Token verification failed:", error.message)
    res.status(400).json({ error: "Invalid token" })
  }
}

// Middleware to verify admin token
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  console.log("🔐 Admin auth check - Token:", token ? "exists" : "missing")

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." })
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET)
    console.log("🔐 Token verified:", { adminId: verified.adminId, role: verified.role })

    if (verified.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin privileges required." })
    }
    req.admin = verified
    next()
  } catch (error) {
    console.error("🔐 Token verification failed:", error.message)
    res.status(400).json({ error: "Invalid token" })
  }
}

// ================================
// USER ROUTES
// ================================

// User Signup
app.post("/signup", async (req, res) => {
  try {
    console.log("👤 User signup request:", req.body.email)
    const { name, middleName, email, username, password } = req.body

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "Please provide all required fields" })
    }

    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" })
    }

    const usernameExists = await User.findOne({ username })
    if (usernameExists) {
      return res.status(400).json({ error: "Username already exists" })
    }

    const user = new User({ name, middleName, email, username, password })
    await user.save()

    console.log("✅ User registered successfully:", email)
    res.status(201).json({ message: "User registered successfully" })
  } catch (error) {
    console.error("❌ User signup error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({ error: messages.join(", ") })
    }

    res.status(500).json({ error: "Internal server error" })
  }
})

// User Login
app.post("/login", async (req, res) => {
  try {
    console.log("👤 User login request:", req.body.username)
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Please provide username and password" })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" })
    }

    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    })

    console.log("✅ User login successful:", username)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(" User login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Add user profile endpoint
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update user profile endpoint to support avatar file upload
app.put("/profile", authenticateToken, uploadAvatar.single("avatarFile"), async (req, res) => {
  try {
    const updates = {}
    const allowedFields = ["name", "address", "phone"]
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })
    // If avatar file is uploaded, update avatar field
    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`
    } else if (req.body.avatar) {
      updates.avatar = req.body.avatar
    }
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true })
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      phone: user.phone,
    })
  } catch (error) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// ================================
// ADMIN ROUTES
// ================================

// Admin Registration
app.post("/admin/register", async (req, res) => {
  try {
    console.log("👨‍💼 Admin registration request:", req.body.email)
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please provide all required fields" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    const emailExists = await Admin.findOne({ email })
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" })
    }

    // Auto-generate username from email
    const baseUsername = email.split("@")[0] + "_admin"
    let username = baseUsername
    let counter = 1
    while (await Admin.findOne({ username })) {
      username = baseUsername + counter
      counter++
    }

    const admin = new Admin({ name, email, username, password })
    await admin.save()

    console.log("✅ Admin registered successfully:", email)
    res.status(201).json({ message: "Admin registered successfully" })
  } catch (error) {
    console.error("❌ Admin registration error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({ error: messages.join(", ") })
    }

    res.status(500).json({ error: "Internal server error" })
  }
})

// Admin Login
app.post("/admin/login", async (req, res) => {
  try {
    console.log("👨‍💼 Admin login request:", req.body.email)
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const validPassword = await bcrypt.compare(password, admin.password)
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const token = jwt.sign({ adminId: admin._id, email: admin.email, role: "admin" }, JWT_SECRET, {
      expiresIn: "24h",
    })

    console.log("✅ Admin login successful:", email)
    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("❌ Admin login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get all products for admin
app.get("/admin/products", authenticateAdmin, async (req, res) => {
  try {
    console.log("📦 Admin fetching all products")
    const products = await Product.find().sort({ createdAt: -1 })
    console.log(`✅ Found ${products.length} products for admin`)
    res.json(products)
  } catch (error) {
    console.error("❌ Error fetching products for admin:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ================================
// PRODUCT ROUTES
// ================================

// Get all products with filters (Public)
app.get("/products", async (req, res) => {
  try {
    console.log("📦 Public products request with query:", req.query)

    const {
      category,
      brand,
      color,
      material,
      size,
      minPrice,
      maxPrice,
      featured,
      search,
      page = 1,
      limit = 12,
    } = req.query

    // Build filter object
    const filter = { status: "active" } // Only show active products

    if (category) filter.category = new RegExp(category, "i")
    if (brand) filter.brand = new RegExp(brand, "i")
    if (color) filter.color = new RegExp(color, "i")
    if (material) filter.material = new RegExp(material, "i")
    if (size) filter.size = new RegExp(size, "i")
    if (featured !== undefined) filter.featured = featured === "true"

    // Price range filter
    if ((minPrice && minPrice !== "") || (maxPrice && maxPrice !== "")) {
      filter.price = {}
      if (minPrice && minPrice !== "") filter.price.$gte = Number(minPrice)
      if (maxPrice && maxPrice !== "") filter.price.$lte = Number(maxPrice)
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
      ]
    }

    console.log("🔍 Filter applied:", filter)

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get products with pagination
    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))

    // Get total count for pagination
    const total = await Product.countDocuments(filter)

    console.log(`✅ Found ${products.length} products out of ${total} total`)

    res.json({
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get single product
app.get("/products/:id", async (req, res) => {
  try {
    console.log("📦 Fetching single product:", req.params.id)
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }
    console.log("✅ Product found:", product.name)
    res.json(product)
  } catch (error) {
    console.error("❌ Error fetching single product:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Add new product (Admin only)
app.post("/admin/products", authenticateAdmin, upload.single("image"), async (req, res) => {
  try {
    console.log("📦 Add product request from admin:", req.admin.email)
    console.log("📦 Request body:", req.body)
    console.log("📦 Uploaded file:", req.file ? req.file.filename : "No file")

    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      brand,
      color,
      material,
      size,
      stockQuantity,
      featured,
    } = req.body

    // Validate required fields
    if (!name || !price || !category || !brand) {
      return res.status(400).json({ error: "Please provide all required fields: name, price, category, brand" })
    }

    // If you want to require an image, uncomment the next lines:
    // if (!req.file) {
    //   return res.status(400).json({ error: "Product image is required" })
    // }

    // Create product object
    const productData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      price: Number(price),
      category: category.trim(),
      brand: brand.trim(),
      image: req.file ? `/uploads/${req.file.filename}` : "",
    }

    // Add optional fields
    if (originalPrice && originalPrice !== "") productData.originalPrice = Number(originalPrice)
    if (discount && discount !== "") productData.discount = Number(discount)
    if (color && color !== "") productData.color = color.trim()
    if (material && material !== "") productData.material = material.trim()
    if (size && size !== "") productData.size = size.trim()
    if (stockQuantity && stockQuantity !== "") productData.stockQuantity = Number(stockQuantity)
    if (featured) productData.featured = featured === "true"

    console.log("📦 Creating product with data:", productData)

    const product = new Product(productData)
    await product.save()

    console.log("✅ Product created successfully:", product._id)
    res.status(201).json({ message: "Product added successfully", product })
  } catch (error) {
    console.error("❌ Error adding product:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({ error: messages.join(", ") })
    }

    res.status(500).json({ error: "Internal server error: " + error.message })
  }
})

// Update product (Admin only)
app.put("/admin/products/:id", authenticateAdmin, upload.single("image"), async (req, res) => {
  try {
    console.log("📦 Update product request:", req.params.id)
    console.log("📦 Request body:", req.body)
    console.log("📦 New file:", req.file ? req.file.filename : "No new file")

    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      brand,
      color,
      material,
      size,
      stockQuantity,
      featured,
    } = req.body

    const updateData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      price: Number(price),
      category: category.trim(),
      brand: brand.trim(),
    }

    // Add optional fields
    if (originalPrice && originalPrice !== "") updateData.originalPrice = Number(originalPrice)
    if (discount && discount !== "") updateData.discount = Number(discount)
    if (color && color !== "") updateData.color = color.trim()
    if (material && material !== "") updateData.material = material.trim()
    if (size && size !== "") updateData.size = size.trim()
    if (stockQuantity && stockQuantity !== "") updateData.stockQuantity = Number(stockQuantity)
    if (featured) updateData.featured = featured === "true"

    // If new image is uploaded, update image path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`
    }

    console.log("📦 Updating product with data:", updateData)

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    console.log("✅ Product updated successfully:", product._id)
    res.json({ message: "Product updated successfully", product })
  } catch (error) {
    console.error("❌ Error updating product:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({ error: messages.join(", ") })
    }

    res.status(500).json({ error: "Internal server error: " + error.message })
  }
})

// Delete product (Admin only)
app.delete("/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    console.log("📦 Delete product request:", req.params.id)
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }
    console.log("✅ Product deleted successfully:", req.params.id)
    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("❌ Error deleting product:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get filter options
app.get("/products/filters/options", async (req, res) => {
  try {
    console.log("🔍 Fetching filter options")
    const categories = await Product.distinct("category")
    const brands = await Product.distinct("brand")
    const colors = await Product.distinct("color")
    const materials = await Product.distinct("material")
    const sizes = await Product.distinct("size")

    // Get price range
    const priceRange = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ])

    const filterOptions = {
      categories: categories.filter(Boolean),
      brands: brands.filter(Boolean),
      colors: colors.filter(Boolean),
      materials: materials.filter(Boolean),
      sizes: sizes.filter(Boolean),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 100 },
    }

    console.log("✅ Filter options fetched:", filterOptions)
    res.json(filterOptions)
  } catch (error) {
    console.error("❌ Error fetching filter options:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// ================================
// UTILITY ROUTES
// ================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    endpoints: {
      health: "/health",
      products: "/products",
      adminLogin: "/admin/login",
      adminRegister: "/admin/register",
    },
  })
})

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Start server
app.listen(PORT, () => {
  console.log("🚀 ================================")
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📁 Uploads directory: ${uploadsDir}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`)
  console.log(`📊 Database: ${mongoose.connection.name}`)
  console.log("🚀 ================================")
})

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...")
  await mongoose.connection.close()
  console.log("📊 Database connection closed")
  process.exit(0)
})
