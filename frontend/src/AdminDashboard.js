"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  Form,
  Alert,
  Badge,
  Spinner,
} from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaChartLine,
  FaBoxOpen,
  FaShoppingBag,
  FaUsers,
  FaUserCircle,
  FaHeartbeat,
  FaWarehouse,
  FaCreditCard,
  FaTag,
  FaRupeeSign,
  FaClipboardList,
  FaAlignLeft,
  FaImage,
  FaTrashAlt,
} from "react-icons/fa"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import axios from "axios"
import "./CSS/admin.css"
import { BASE_URL } from "./config"

const fmtMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Number(n) || 0
  )

const ORDER_STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"]
const PAYMENT_STATUSES = ["pending", "paid", "failed"]

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#0ea5e9", "#14b8a6", "#f59e0b", "#94a3b8"]

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("dashboard")

  const [analytics, setAnalytics] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])

  const [loadingDash, setLoadingDash] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState(null)

  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerDetail, setCustomerDetail] = useState(null)
  const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [adminProfile] = useState(() => {
    try {
      const raw = localStorage.getItem("adminUser")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "100",
    originalPrice: "",
    discount: "",
    brand: "",
    category: "",
    subcategory: "",
    gender: "",
    skinType: "",
    hairType: "",
    size: "",
    volume: "",
    ingredients: "",
    benefits: "",
    usage: "",
    expiryDate: "",
    isNatural: false,
    isCrueltyFree: false,
    isVegan: false,
    image: null,
    description: "",
    status: "active",
  })

  const productCategories = [
    {
      value: "hair-care",
      label: "Hair Care",
      subcategories: ["shampoo", "conditioner", "hair-oil", "hair-gel", "hair-wax", "hair-serum", "dry-shampoo"],
    },
    {
      value: "skin-care",
      label: "Skin Care",
      subcategories: ["face-wash", "moisturizer", "serum", "toner", "face-mask", "sunscreen", "scrub"],
    },
    {
      value: "body-care",
      label: "Body Care",
      subcategories: ["body-wash", "body-lotion", "body-scrub", "body-butter", "deodorant", "hand-cream", "foot-cream"],
    },
    {
      value: "grooming",
      label: "Grooming",
      subcategories: ["razor", "shaving-cream", "beard-trimmer", "hair-removal", "epilator", "nail-care"],
    },
    {
      value: "oral-care",
      label: "Oral Care",
      subcategories: ["toothpaste", "toothbrush", "mouthwash", "dental-floss", "tongue-cleaner"],
    },
    {
      value: "fragrances",
      label: "Fragrances",
      subcategories: ["perfume", "body-mist", "aftershave", "roll-on", "cologne"],
    },
  ]

  const genderOptions = [
    { value: "men", label: "For Men" },
    { value: "women", label: "For Women" },
    { value: "unisex", label: "Unisex" },
  ]

  const skinTypeOptions = [
    { value: "normal", label: "Normal" },
    { value: "dry", label: "Dry" },
    { value: "oily", label: "Oily" },
    { value: "combination", label: "Combination" },
    { value: "sensitive", label: "Sensitive" },
  ]

  const hairTypeOptions = [
    { value: "normal", label: "Normal" },
    { value: "dry", label: "Dry" },
    { value: "oily", label: "Oily" },
    { value: "curly", label: "Curly" },
    { value: "straight", label: "Straight" },
    { value: "wavy", label: "Wavy" },
  ]

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingDash(true)
      const { data } = await axios.get(`${BASE_URL}/admin/analytics/dashboard`)
      setAnalytics(data)
    } catch (err) {
      console.error(err)
      setError("Could not load dashboard analytics.")
    } finally {
      setLoadingDash(false)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true)
      const response = await axios.get(`${BASE_URL}/admin/products`)
      setProducts(response.data)
    } catch (err) {
      console.error("Error fetching products:", err)
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken")
        navigate("/admin/login")
      } else {
        setError("Failed to fetch products")
      }
    } finally {
      setLoadingProducts(false)
    }
  }, [navigate])

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true)
      const { data } = await axios.get(`${BASE_URL}/admin/orders`)
      setOrders(data)
      setSelectedOrder((prev) => {
        if (!prev) return null
        const fresh = data.find((o) => o._id === prev._id)
        return fresh || null
      })
    } catch (err) {
      console.error(err)
      setError("Failed to load orders")
    } finally {
      setLoadingOrders(false)
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true)
      const { data } = await axios.get(`${BASE_URL}/admin/customers`)
      setCustomers(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load customers")
    } finally {
      setLoadingCustomers(false)
    }
  }, [])

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      navigate("/admin/login")
      return
    }
    fetchDashboard()
    fetchProducts()
  }, [navigate, fetchDashboard, fetchProducts])

  useEffect(() => {
    if (activeSection === "orders") fetchOrders()
  }, [activeSection, fetchOrders])

  useEffect(() => {
    if (activeSection === "customers") fetchCustomers()
  }, [activeSection, fetchCustomers])

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === "image") {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock: "100",
      originalPrice: "",
      discount: "",
      brand: "",
      category: "",
      subcategory: "",
      gender: "",
      skinType: "",
      hairType: "",
      size: "",
      volume: "",
      ingredients: "",
      benefits: "",
      usage: "",
      expiryDate: "",
      isNatural: false,
      isCrueltyFree: false,
      isVegan: false,
      image: null,
      description: "",
      status: "active",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!formData.name || !formData.price || !formData.brand || !formData.category) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      if (!editingProduct && !formData.image) {
        setError("Product image is required")
        setLoading(false)
        return
      }

      const formDataToSend = new FormData()
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          formDataToSend.append(key, formData[key])
        }
      })

      if (editingProduct) {
        await axios.put(`${BASE_URL}/admin/products/${editingProduct._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setSuccess("Product updated successfully!")
      } else {
        await axios.post(`${BASE_URL}/admin/products`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setSuccess("Product added successfully!")
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
      fetchDashboard()
    } catch (err) {
      console.error("Error saving product:", err)
      setError(err.response?.data?.error || "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock != null ? String(product.stock) : "100",
      originalPrice: product.originalPrice || "",
      discount: product.discount || "",
      brand: product.brand || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      gender: product.gender || "",
      skinType: product.skinType || "",
      hairType: product.hairType || "",
      size: product.size || "",
      volume: product.volume || "",
      ingredients: product.ingredients || "",
      benefits: product.benefits || "",
      usage: product.usage || "",
      expiryDate: product.expiryDate || "",
      isNatural: product.isNatural || false,
      isCrueltyFree: product.isCrueltyFree || false,
      isVegan: product.isVegan || false,
      image: null,
      description: product.description || "",
      status: product.status || "active",
    })
    setShowModal(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Delete this product?")) {
      try {
        await axios.delete(`${BASE_URL}/admin/products/${productId}`)
        setSuccess("Product deleted.")
        fetchProducts()
        fetchDashboard()
      } catch (err) {
        console.error(err)
        setError("Failed to delete product")
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    navigate("/admin/login")
  }

  const openAddModal = () => {
    setEditingProduct(null)
    resetForm()
    setShowModal(true)
  }

  const patchOrder = async (orderId, payload) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/admin/orders/${orderId}`, payload)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)))
      setSelectedOrder((prev) => (prev && prev._id === orderId ? data : prev))
      setSuccess("Order updated.")
    } catch (err) {
      setError(err.response?.data?.error || "Could not update order")
    }
  }

  const openCustomerProfile = async (row) => {
    setError("")
    setShowCustomerModal(true)
    setCustomerDetail(null)
    setLoadingCustomerDetail(true)
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/customers/${row._id}`)
      setCustomerDetail(data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || "Could not load customer profile")
      setShowCustomerModal(false)
    } finally {
      setLoadingCustomerDetail(false)
    }
  }

  const handleDeleteCustomer = async (customerId, displayName) => {
    if (!window.confirm(`Permanently delete "${displayName}" and all their orders? This cannot be undone.`)) return
    try {
      await axios.delete(`${BASE_URL}/admin/customers/${customerId}`)
      setSuccess("Customer and their orders were removed.")
      setShowCustomerModal(false)
      setCustomerDetail(null)
      fetchCustomers()
      fetchDashboard()
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete customer")
    }
  }

  const overview = analytics?.overview
  const stockInfo = analytics?.stock

  const sectionTitle =
    {
      dashboard: "Dashboard",
      products: "Products",
      orders: "Orders",
      customers: "Customers",
      profile: "Admin profile",
    }[activeSection] || "Admin"

  const initials =
    (adminProfile?.name || adminProfile?.email || "A")
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD"

  return (
    <div className="admin-dashboard">
      <div className="admin-app">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <div className="admin-brand-mark">
              <FaHeartbeat aria-hidden />
            </div>
            <div>
              <div className="admin-brand-title">GlowCare Admin</div>
              <div className="admin-brand-sub">Commerce control</div>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin sections">
            <button type="button" className={activeSection === "dashboard" ? "active" : ""} onClick={() => setActiveSection("dashboard")}>
              <FaChartLine /> Dashboard
            </button>
            <button type="button" className={activeSection === "products" ? "active" : ""} onClick={() => setActiveSection("products")}>
              <FaBoxOpen /> Products
            </button>
            <button type="button" className={activeSection === "orders" ? "active" : ""} onClick={() => setActiveSection("orders")}>
              <FaShoppingBag /> Orders
            </button>
            <button type="button" className={activeSection === "customers" ? "active" : ""} onClick={() => setActiveSection("customers")}>
              <FaUsers /> Customers
            </button>
            <button type="button" className={activeSection === "profile" ? "active" : ""} onClick={() => setActiveSection("profile")}>
              <FaUserCircle /> Profile
            </button>
          </nav>

          <div className="admin-sidebar-footer">
            <button type="button" onClick={handleLogout}>
              <FaSignOutAlt /> Log out
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <h1>{sectionTitle}</h1>
              <div className="admin-topbar-meta">
                {activeSection === "dashboard" && "Revenue, inventory, and sales at a glance"}
                {activeSection === "products" && "Create, update, and remove catalog items"}
                {activeSection === "orders" && "Track fulfillment and payments"}
                {activeSection === "customers" && "Shopper spend and order history"}
                {activeSection === "profile" && "Signed-in administrator"}
              </div>
            </div>
            <div className="admin-user-pill">
              <div className="admin-user-avatar">{initials}</div>
              <div className="admin-user-info">
                <strong>{adminProfile?.name || "Admin"}</strong>
                <span>{adminProfile?.email || ""}</span>
              </div>
            </div>
          </header>

          <div className="admin-main-scroll">
            <Container fluid className="px-0 pt-3">
              <div className="admin-alert-slot">
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert variant="success" dismissible onClose={() => setSuccess("")}>
                    {success}
                  </Alert>
                )}
              </div>

              {activeSection === "dashboard" && (
                <>
                  {loadingDash && !analytics ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="info" />
                      <p className="mt-2 text-secondary">Loading analytics…</p>
                    </div>
                  ) : (
                    <>
                      <div className="admin-kpi-grid">
                        <div className="admin-kpi-card accent-sky">
                          <h6>Total revenue</h6>
                          <div className="value">{fmtMoney(overview?.revenue)}</div>
                        </div>
                        <div className="admin-kpi-card">
                          <h6>Orders</h6>
                          <div className="value">{overview?.ordersCount ?? 0}</div>
                        </div>
                        <div className="admin-kpi-card accent-green">
                          <h6>Avg. order value</h6>
                          <div className="value">{fmtMoney(overview?.avgOrderValue)}</div>
                        </div>
                        <div className="admin-kpi-card accent-violet">
                          <h6>Customers</h6>
                          <div className="value">{overview?.customersCount ?? 0}</div>
                        </div>
                        <div className="admin-kpi-card">
                          <h6>Units sold (30d)</h6>
                          <div className="value">{analytics?.unitsSoldLast30Days ?? 0}</div>
                        </div>
                        <div className="admin-kpi-card accent-amber">
                          <h6>Inventory units</h6>
                          <div className="value">{stockInfo?.totalUnits ?? 0}</div>
                        </div>
                        <div className="admin-kpi-card">
                          <h6>Active SKUs</h6>
                          <div className="value">{overview?.activeProductsCount ?? 0}</div>
                        </div>
                        <div className="admin-kpi-card accent-amber">
                          <h6>Low stock (≤10)</h6>
                          <div className="value">{stockInfo?.lowStockCount ?? 0}</div>
                        </div>
                      </div>

                      <Row className="g-3 mb-3">
                        <Col xs={12}>
                          <div className="admin-chart-card">
                            <h5>Monthly revenue & orders (last 12 months)</h5>
                            <div className="admin-chart-tall">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.monthlyChart || []} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                  <Tooltip
                                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                                    labelStyle={{ color: "#e2e8f0" }}
                                  />
                                  <Area type="monotone" dataKey="revenue" stroke="#38bdf8" fill="url(#fillRev)" strokeWidth={2} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Row className="g-3 mb-3">
                        <Col lg={7}>
                          <div className="admin-chart-card">
                            <h5>Top selling products (units)</h5>
                            <div className="admin-chart-med">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={(analytics?.topSellingProducts || []).map((p) => ({
                                    name: p.name?.length > 18 ? `${p.name.slice(0, 16)}…` : p.name || "—",
                                    units: p.units,
                                  }))}
                                  margin={{ top: 8, right: 16, left: 0, bottom: 32 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={56} />
                                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                  <Tooltip
                                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                                  />
                                  <Bar dataKey="units" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </Col>
                        <Col lg={5}>
                          <div className="admin-chart-card">
                            <h5>Payments by method</h5>
                            <div className="admin-chart-med d-flex align-items-center justify-content-center">
                              {(analytics?.paymentMethods || []).length === 0 ? (
                                <span className="text-secondary small px-3">No orders yet — chart will populate after sales.</span>
                              ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={analytics.paymentMethods}
                                      dataKey="total"
                                      nameKey="method"
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={52}
                                      outerRadius={88}
                                      paddingAngle={3}
                                    >
                                      {analytics.paymentMethods.map((_, i) => (
                                        <Cell key={String(i)} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      formatter={(v) => fmtMoney(v)}
                                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                            <div className="text-center small text-secondary pb-2">
                              COD vs online split also in KPI cards
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Row className="g-3">
                        <Col md={6}>
                          <Card className="border-secondary bg-dark text-light">
                            <Card.Body>
                              <Card.Title className="d-flex align-items-center gap-2 h6">
                                <FaCreditCard className="text-info" /> Revenue breakdown
                              </Card.Title>
                              <p className="mb-1 small text-secondary">COD</p>
                              <p className="mb-3 fw-bold">{fmtMoney(overview?.revenueBreakdown?.cod)}</p>
                              <p className="mb-1 small text-secondary">Online / other</p>
                              <p className="mb-0 fw-bold">{fmtMoney(overview?.revenueBreakdown?.online)}</p>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="border-secondary bg-dark text-light">
                            <Card.Body>
                              <Card.Title className="d-flex align-items-center gap-2 h6">
                                <FaWarehouse className="text-warning" /> Stock alerts
                              </Card.Title>
                              <p className="small text-secondary mb-2">
                                Out of stock SKUs: <strong>{stockInfo?.outOfStockCount ?? 0}</strong> · Low:{" "}
                                <strong>{stockInfo?.lowStockCount ?? 0}</strong>
                              </p>
                              <div className="admin-stock-strip">
                                {(stockInfo?.lowStockProducts || []).length === 0 ? (
                                  <span className="text-secondary small">No low-stock items 🎉</span>
                                ) : (
                                  stockInfo.lowStockProducts.map((p) => (
                                    <span key={p._id} className="admin-stock-chip">
                                      {p.name} ({p.stock})
                                    </span>
                                  ))
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </>
                  )}
                </>
              )}

              {activeSection === "products" && (
                <div className="admin-table-card">
                  <div className="admin-products-toolbar d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h5>Catalog</h5>
                      <p className="mb-0 small text-muted">Add products or edit listings — changes apply to the storefront.</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={openAddModal}>
                      <FaPlus className="me-1" /> Add product
                    </Button>
                  </div>
                  <div className="admin-table-wrap">
                    {loadingProducts ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="success" />
                      </div>
                    ) : (
                      <Table hover responsive className="mb-0 admin-data-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Brand</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product._id}>
                              <td>
                                <img
                                  src={product.image ? `${BASE_URL}${product.image}` : "/placeholder.svg"}
                                  alt=""
                                  className="admin-dashboard-img-thumb"
                                  onError={(e) => {
                                    e.target.src = "/placeholder.svg"
                                  }}
                                />
                              </td>
                              <td>{product.name}</td>
                              <td>{fmtMoney(product.price)}</td>
                              <td>{product.stock ?? "—"}</td>
                              <td>{product.brand}</td>
                              <td>{product.category}</td>
                              <td>
                                <Badge bg={product.status === "active" ? "success" : "secondary"}>{product.status}</Badge>
                              </td>
                              <td>
                                <Button variant="outline-light" size="sm" className="me-1" onClick={() => handleEdit(product)}>
                                  <FaEdit />
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product._id)}>
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "orders" && (
                <div className="admin-orders-layout">
                  <div className="admin-table-card">
                    <div className="admin-table-wrap">
                      {loadingOrders ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="info" />
                        </div>
                      ) : (
                        <Table hover responsive className="mb-0 admin-data-table">
                          <thead>
                            <tr>
                              <th>Order</th>
                              <th>Customer</th>
                              <th>Total</th>
                              <th>Payment</th>
                              <th>Status</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((o) => (
                              <tr
                                key={o._id}
                                style={{
                                  cursor: "pointer",
                                  background: selectedOrder?._id === o._id ? "rgba(99,102,241,0.12)" : undefined,
                                }}
                                onClick={() => setSelectedOrder(o)}
                              >
                                <td className="font-monospace small">{String(o._id).slice(-8)}</td>
                                <td>{o.userId?.name || o.userId?.email || "—"}</td>
                                <td>{fmtMoney(o.pricing?.total)}</td>
                                <td>
                                  <Badge bg="secondary">{o.payment?.method}</Badge>{" "}
                                  <Badge bg={o.payment?.status === "paid" ? "success" : "warning"}>{o.payment?.status}</Badge>
                                </td>
                                <td>
                                  <Badge bg="info">{o.orderStatus}</Badge>
                                </td>
                                <td className="small">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </div>
                  </div>

                  <aside className="admin-order-detail">
                    {!selectedOrder ? (
                      <p className="text-secondary small mb-0">Select an order to view details and update status.</p>
                    ) : (
                      <>
                        <h5>Order #{String(selectedOrder._id).slice(-10)}</h5>
                        <div className="small text-secondary mb-2">
                          {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString()}
                        </div>
                        <div className="mb-2">
                          <Form.Label className="small text-secondary">Order status</Form.Label>
                          <Form.Select
                            size="sm"
                            value={selectedOrder.orderStatus}
                            onChange={(e) => patchOrder(selectedOrder._id, { orderStatus: e.target.value })}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        <div className="mb-3">
                          <Form.Label className="small text-secondary">Payment status</Form.Label>
                          <Form.Select
                            size="sm"
                            value={selectedOrder.payment?.status || "pending"}
                            onChange={(e) => patchOrder(selectedOrder._id, { paymentStatus: e.target.value })}
                          >
                            {PAYMENT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                        <div className="admin-order-line">
                          <span>Subtotal</span>
                          <span>{fmtMoney(selectedOrder.pricing?.subtotal)}</span>
                        </div>
                        <div className="admin-order-line">
                          <span>Shipping</span>
                          <span>{fmtMoney(selectedOrder.pricing?.shipping)}</span>
                        </div>
                        <div className="admin-order-line fw-bold">
                          <span>Total</span>
                          <span>{fmtMoney(selectedOrder.pricing?.total)}</span>
                        </div>
                        <h6 className="mt-3 mb-2 small text-secondary text-uppercase">Customer</h6>
                        <p className="mb-1">{selectedOrder.userId?.name}</p>
                        <p className="mb-1 small">{selectedOrder.userId?.email}</p>
                        <p className="mb-3 small">{selectedOrder.userId?.phone}</p>
                        <h6 className="mb-2 small text-secondary text-uppercase">Items</h6>
                        <div className="admin-order-items">
                          {(selectedOrder.items || []).map((it, idx) => (
                            <div key={idx} className="admin-order-line">
                              <span>
                                {it.name} × {it.quantity}
                              </span>
                              <span>{fmtMoney((it.price || 0) * (it.quantity || 0))}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </aside>
                </div>
              )}

              {activeSection === "customers" && (
                <div className="admin-table-card">
                  <header className="admin-customers-toolbar">
                    <h5>Customers</h5>
                    <p>
                      Store accounts with role <strong>shopper</strong> only — administrators are hidden. Demo addresses like{" "}
                      <strong>@example.com</strong> are excluded. <strong>{customers.length}</strong> shown.
                    </p>
                  </header>
                  <div className="admin-table-wrap">
                    {loadingCustomers ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="info" />
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="admin-customers-empty">No registered shoppers yet, or all accounts are admins / demo emails.</div>
                    ) : (
                      <Table responsive className="mb-0 admin-data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th className="text-center">Orders</th>
                            <th>Total spent</th>
                            <th>Joined</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((c) => (
                            <tr key={c._id}>
                              <td>
                                <button
                                  type="button"
                                  className="btn-customer-name"
                                  onClick={() => openCustomerProfile(c)}
                                >
                                  {c.name || "—"}
                                </button>
                              </td>
                              <td>
                                <a href={`mailto:${c.email}`} className="link-table-email text-decoration-none">
                                  {c.email}
                                </a>
                              </td>
                              <td>{c.phone?.trim() ? c.phone : "—"}</td>
                              <td className="text-center">
                                <Badge bg="secondary" className="rounded-pill px-2">
                                  {c.orderCount ?? 0}
                                </Badge>
                              </td>
                              <td className="fw-semibold">{fmtMoney(c.totalSpent)}</td>
                              <td className="text-nowrap small">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
                              </td>
                              <td className="text-end">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="py-0 px-2"
                                  title="Delete customer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteCustomer(c._id, c.name || c.email || "Customer")
                                  }}
                                >
                                  <FaTrashAlt aria-hidden />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "profile" && (
                <div className="admin-profile-pro">
                  <div className="admin-profile-pro-card">
                    <div className="admin-profile-pro-head">
                      <div className="admin-profile-pro-avatar" aria-hidden>
                        {initials}
                      </div>
                      <div>
                        <h2 className="admin-profile-pro-name">{adminProfile?.name || "Administrator"}</h2>
                        <p className="admin-profile-pro-email">{adminProfile?.email || "—"}</p>
                        <span className="admin-profile-pro-badge">
                          {(adminProfile?.role || "admin").toString().replace(/^./, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <div className="admin-profile-pro-grid">
                      <div className="admin-profile-pro-item">
                        <span className="admin-profile-pro-label">Full name</span>
                        <span className="admin-profile-pro-value">{adminProfile?.name || "—"}</span>
                      </div>
                      <div className="admin-profile-pro-item">
                        <span className="admin-profile-pro-label">Work email</span>
                        <span className="admin-profile-pro-value">{adminProfile?.email || "—"}</span>
                      </div>
                      <div className="admin-profile-pro-item">
                        <span className="admin-profile-pro-label">Access level</span>
                        <span className="admin-profile-pro-value">
                          {(adminProfile?.role || "admin").toString().replace(/^./, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    <p className="admin-profile-pro-note">
                      Details are from your current session. Password and email changes will be available when your account settings flow is
                      connected.
                    </p>
                  </div>
                </div>
              )}
            </Container>
          </div>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        centered
        scrollable
        dialogClassName="admin-product-dialog"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton className="admin-modal-surface__header">
          <Modal.Title className="d-flex align-items-center gap-2 fs-5 text-dark">
            <FaBoxOpen className="admin-modal-title-icon" aria-hidden />
            {editingProduct ? "Edit product" : "Add new product"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="admin-product-modal-body admin-modal-surface__body pt-0">
            <section className="admin-form-section">
              <h6 className="admin-form-section-title">
                <FaTag aria-hidden /> Identity &amp; shelf
              </h6>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Product name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Hydra Glow Face Serum"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Brand</Form.Label>
                    <Form.Control type="text" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Brand name" required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select name="category" value={formData.category} onChange={handleInputChange} required>
                      <option value="">Choose category</option>
                      {productCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Subcategory</Form.Label>
                    <Form.Select name="subcategory" value={formData.subcategory} onChange={handleInputChange}>
                      <option value="">Optional</option>
                      {formData.category &&
                        productCategories
                          .find((c) => c.value === formData.category)
                          ?.subcategories.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub.replace("-", " ")}
                            </option>
                          ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Listing status</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                      <option value="active">Active — visible in store</option>
                      <option value="inactive">Inactive — hidden</option>
                    </Form.Select>
                    <div className="admin-form-hint">Inactive products stay in admin but won&apos;t appear to shoppers.</div>
                  </Form.Group>
                </Col>
              </Row>
            </section>

            <section className="admin-form-section">
              <h6 className="admin-form-section-title">
                <FaRupeeSign aria-hidden /> Pricing &amp; inventory
              </h6>
              <Row className="g-3">
                <Col sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Selling price (₹)</Form.Label>
                    <Form.Control type="number" step="0.01" min="0" name="price" value={formData.price} onChange={handleInputChange} required />
                  </Form.Group>
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label>MRP / Original (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control type="number" min="0" max="100" name="discount" value={formData.discount} onChange={handleInputChange} placeholder="0" />
                  </Form.Group>
                </Col>
                <Col sm={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Stock units</Form.Label>
                    <Form.Control type="number" name="stock" value={formData.stock} onChange={handleInputChange} min={0} />
                    <div className="admin-form-hint">Warehouse count for this SKU.</div>
                  </Form.Group>
                </Col>
              </Row>
            </section>

            <section className="admin-form-section">
              <h6 className="admin-form-section-title">
                <FaClipboardList aria-hidden /> Product attributes
              </h6>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Audience</Form.Label>
                    <Form.Select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="">Any / not set</option>
                      {genderOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Size / volume label</Form.Label>
                    <Form.Control type="text" name="size" value={formData.size} onChange={handleInputChange} placeholder="e.g. 50 ml, 100 g" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Pack volume</Form.Label>
                    <Form.Control type="text" name="volume" value={formData.volume} onChange={handleInputChange} placeholder="e.g. 250 ml bottle" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Skin type</Form.Label>
                    <Form.Select name="skinType" value={formData.skinType} onChange={handleInputChange}>
                      <option value="">Not applicable</option>
                      {skinTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Hair type</Form.Label>
                    <Form.Select name="hairType" value={formData.hairType} onChange={handleInputChange}>
                      <option value="">Not applicable</option>
                      {hairTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Expiry / best before</Form.Label>
                    <Form.Control type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} />
                  </Form.Group>
                </Col>
              </Row>
            </section>

            <section className="admin-form-section">
              <h6 className="admin-form-section-title">
                <FaAlignLeft aria-hidden /> Copy &amp; ingredients
              </h6>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Ingredients</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      placeholder="Comma-separated or short list"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Key benefits</Form.Label>
                    <Form.Control as="textarea" rows={3} name="benefits" value={formData.benefits} onChange={handleInputChange} placeholder="What the customer gains" />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>How to use</Form.Label>
                    <Form.Control as="textarea" rows={3} name="usage" value={formData.usage} onChange={handleInputChange} placeholder="Steps, frequency, tips" />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Full description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Long-form description for the product page"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </section>

            <section className="admin-form-section">
              <h6 className="admin-form-section-title">
                <FaImage aria-hidden /> Labels, media &amp; ethics
              </h6>
              <div className="admin-form-check-grid mb-3">
                <Form.Check
                  type="checkbox"
                  checked={formData.isNatural}
                  onChange={(e) => setFormData({ ...formData, isNatural: e.target.checked })}
                  label="Natural / plant-forward"
                />
                <Form.Check
                  type="checkbox"
                  checked={formData.isCrueltyFree}
                  onChange={(e) => setFormData({ ...formData, isCrueltyFree: e.target.checked })}
                  label="Cruelty-free"
                />
                <Form.Check
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                  label="Vegan formula"
                />
              </div>
              <Form.Group>
                <Form.Label>
                  Product image {!editingProduct && <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={handleInputChange} required={!editingProduct} />
                <div className="admin-form-hint">{editingProduct ? "Leave empty to keep the current image." : "JPG, PNG or WebP — clear photo on neutral background works best."}</div>
              </Form.Group>
            </section>
          </Modal.Body>
          <Modal.Footer className="admin-modal-surface__footer">
            <div className="admin-modal-footer-actions w-100">
              <Button variant="outline-secondary" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? "Saving…" : editingProduct ? "Save changes" : "Publish product"}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showCustomerModal}
        onHide={() => {
          setShowCustomerModal(false)
          setCustomerDetail(null)
        }}
        size="lg"
        centered
        scrollable
        dialogClassName="admin-customer-dialog"
        contentClassName="admin-modal-surface"
      >
        <Modal.Header closeButton className="admin-modal-surface__header">
          <Modal.Title className="d-flex align-items-center gap-2 fs-5 text-dark">
            <FaUserCircle className="admin-modal-title-icon" aria-hidden />
            Customer profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="admin-product-modal-body admin-modal-surface__body pt-2">
          {loadingCustomerDetail ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small mb-0">Loading profile…</p>
            </div>
          ) : customerDetail?.user ? (
            <>
              <div className="admin-customer-profile-header mb-3">
                <div className="admin-customer-avatar" aria-hidden>
                  {(customerDetail.user.name || "?").slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h5 className="admin-customer-modal-name mb-1">
                    {[customerDetail.user.name, customerDetail.user.middleName].filter(Boolean).join(" ") || "—"}
                  </h5>
                  <p className="mb-0 small text-muted">{customerDetail.user.email}</p>
                </div>
              </div>

              <Row className="g-3 mb-3">
                <Col sm={6} md={4}>
                  <div className="admin-customer-stat-pill">
                    <span className="label">Orders</span>
                    <strong>{customerDetail.summary?.orderCount ?? 0}</strong>
                  </div>
                </Col>
                <Col sm={6} md={4}>
                  <div className="admin-customer-stat-pill">
                    <span className="label">Lifetime spent</span>
                    <strong>{fmtMoney(customerDetail.summary?.totalSpent)}</strong>
                  </div>
                </Col>
                <Col sm={6} md={4}>
                  <div className="admin-customer-stat-pill">
                    <span className="label">Email verified</span>
                    <strong>{customerDetail.user.isEmailVerified ? "Yes" : "No"}</strong>
                  </div>
                </Col>
              </Row>

              <dl className="row admin-customer-dl mb-0">
                <dt className="col-sm-4">Username</dt>
                <dd className="col-sm-8">{customerDetail.user.username || "—"}</dd>
                <dt className="col-sm-4">Phone</dt>
                <dd className="col-sm-8">{customerDetail.user.phone?.trim() ? customerDetail.user.phone : "—"}</dd>
                <dt className="col-sm-4">Address</dt>
                <dd className="col-sm-8">{customerDetail.user.address?.trim() ? customerDetail.user.address : "—"}</dd>
                <dt className="col-sm-4">Role</dt>
                <dd className="col-sm-8">
                  <Badge bg="secondary">{customerDetail.user.role || "user"}</Badge>
                </dd>
                <dt className="col-sm-4">Joined</dt>
                <dd className="col-sm-8">
                  {customerDetail.user.createdAt
                    ? new Date(customerDetail.user.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                    : "—"}
                </dd>
                <dt className="col-sm-4">Last updated</dt>
                <dd className="col-sm-8">
                  {customerDetail.user.updatedAt
                    ? new Date(customerDetail.user.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                    : "—"}
                </dd>
              </dl>

              <h6 className="mt-4 mb-2 text-uppercase small text-muted fw-bold">Recent orders</h6>
              {(customerDetail.orders || []).length === 0 ? (
                <p className="text-muted small mb-0">No orders yet.</p>
              ) : (
                <div className="admin-customer-orders-wrap">
                  <Table responsive size="sm" className="mb-0 admin-customer-orders-light admin-customer-orders-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(customerDetail.orders || []).map((ord) => (
                        <tr key={ord._id}>
                          <td className="font-monospace small text-nowrap">…{String(ord._id).slice(-8)}</td>
                          <td className="small text-nowrap">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—"}
                          </td>
                          <td className="fw-semibold">{fmtMoney(ord.pricing?.total)}</td>
                          <td>
                            <Badge bg="secondary">{ord.payment?.method}</Badge>{" "}
                            <Badge bg={ord.payment?.status === "paid" ? "success" : "warning"}>{ord.payment?.status}</Badge>
                          </td>
                          <td>
                            <Badge bg="info">{ord.orderStatus}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted mb-0">Could not load this profile.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="admin-modal-surface__footer justify-content-between flex-wrap gap-2">
          <Button
            variant="outline-secondary"
            type="button"
            onClick={() => {
              setShowCustomerModal(false)
              setCustomerDetail(null)
            }}
          >
            Close
          </Button>
          {customerDetail?.user && (
            <Button
              variant="danger"
              type="button"
              onClick={() =>
                handleDeleteCustomer(
                  customerDetail.user._id,
                  customerDetail.user.name || customerDetail.user.email || "Customer"
                )
              }
            >
              <FaTrashAlt className="me-2" aria-hidden />
              Delete customer
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AdminDashboard
