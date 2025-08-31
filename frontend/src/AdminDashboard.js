"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt } from "react-icons/fa"
import axios from "axios"
import "./CSS/admin.css"

const AdminDashboard = () => {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    price: "",
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
  })

  const productCategories = [
    { value: "hair-care", label: "Hair Care", subcategories: ["shampoo", "conditioner", "hair-oil", "hair-gel", "hair-wax", "hair-serum", "dry-shampoo"] },
    { value: "skin-care", label: "Skin Care", subcategories: ["face-wash", "moisturizer", "serum", "toner", "face-mask", "sunscreen", "scrub"] },
    { value: "body-care", label: "Body Care", subcategories: ["body-wash", "body-lotion", "body-scrub", "body-butter", "deodorant", "hand-cream", "foot-cream"] },
    { value: "grooming", label: "Grooming", subcategories: ["razor", "shaving-cream", "beard-trimmer", "hair-removal", "epilator", "nail-care"] },
    { value: "oral-care", label: "Oral Care", subcategories: ["toothpaste", "toothbrush", "mouthwash", "dental-floss", "tongue-cleaner"] },
    { value: "fragrances", label: "Fragrances", subcategories: ["perfume", "body-mist", "aftershave", "roll-on", "cologne"] }
  ]

  const genderOptions = [
    { value: "men", label: "For Men" },
    { value: "women", label: "For Women" },
    { value: "unisex", label: "Unisex" }
  ]

  const skinTypeOptions = [
    { value: "normal", label: "Normal" },
    { value: "dry", label: "Dry" },
    { value: "oily", label: "Oily" },
    { value: "combination", label: "Combination" },
    { value: "sensitive", label: "Sensitive" }
  ]

  const hairTypeOptions = [
    { value: "normal", label: "Normal" },
    { value: "dry", label: "Dry" },
    { value: "oily", label: "Oily" },
    { value: "curly", label: "Curly" },
    { value: "straight", label: "Straight" },
    { value: "wavy", label: "Wavy" }
  ]

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin/products")
      setProducts(response.data)
    } catch (err) {
      console.error("Error fetching products:", err)
      if (err.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("adminToken")
        navigate("/admin/login")
      } else {
        setError("Failed to fetch products")
      }
    }
  }, [navigate])



  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      navigate("/admin/login")
      return
    }

    // Set axios default header
    axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`
    fetchProducts()
  }, [navigate, fetchProducts])

  const handleInputChange = (e) => {
    const { name, value, files } = e.target
    if (name === "image") {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.brand || !formData.category) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }

      // For new products, image is required
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
        await axios.put(`http://localhost:5000/admin/products/${editingProduct._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setSuccess("Product updated successfully!")
      } else {
        await axios.post("http://localhost:5000/admin/products", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setSuccess("Product added successfully!")
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
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
    })
    setShowModal(true)
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/admin/products/${productId}`)
        setSuccess("Product deleted successfully!")
        fetchProducts()
      } catch (err) {
        console.error("Error deleting product:", err)
        setError("Failed to delete product")
      }
    }
  }



  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
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
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    delete axios.defaults.headers.common["Authorization"]
    navigate("/admin/login")
  }

  const openAddModal = () => {
    setEditingProduct(null)
    resetForm()
    setShowModal(true)
  }

  return (
    <main className="admin-dashboard">
      <Container fluid>
        {/* Header */}
        <Row className="admin-header py-3 mb-4">
          <Col>
            <section className="d-flex justify-content-between align-items-center">
              <h1 className="admin-dashboard-title">Admin Dashboard</h1>
              <Button variant="outline-danger" onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Logout
              </Button>
            </section>
          </Col>
        </Row>

        {/* Alerts */}
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

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body>
                <h5>Total Products</h5>
                <h2 className="text-primary">{products.length}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body>
                <h5>Active Products</h5>
                <h2 className="text-success">{products.filter((p) => p.status === "active").length}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body>
                <h5>Categories</h5>
                <h2 className="text-info">{new Set(products.map((p) => p.category)).size}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stats-card">
              <Card.Body>
                <h5>Brands</h5>
                <h2 className="text-warning">{new Set(products.map((p) => p.brand)).size}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Products Section */}
        <Row>
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Products Management</h4>
                <Button variant="primary" onClick={openAddModal}>
                  <FaPlus className="me-2" />
                  Add Product
                </Button>
              </Card.Header>
              <Card.Body>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            className="rounded"
                          />
                        </td>
                        <td>{product.name}</td>
                        <td>
                          ${product.price}
                          {product.originalPrice && (
                            <small className="text-muted ms-2">
                              <s>${product.originalPrice}</s>
                            </small>
                          )}
                        </td>
                        <td>{product.brand}</td>
                        <td>{product.category}</td>
                        <td>
                          <Badge bg={product.status === "active" ? "success" : "secondary"}>{product.status}</Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(product)}
                          >
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
              </Card.Body>
            </Card>
          </Col>
        </Row>


      </Container>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? "Edit Product" : "Add New Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control type="text" name="brand" value={formData.brand} onChange={handleInputChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Original Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discount (%)</Form.Label>
                  <Form.Control type="number" name="discount" value={formData.discount} onChange={handleInputChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    {productCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subcategory</Form.Label>
                  <Form.Select name="subcategory" value={formData.subcategory} onChange={handleInputChange}>
                    <option value="">Select Subcategory</option>
                    {formData.category && productCategories.find(cat => cat.value === formData.category)?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Size</Form.Label>
                  <Form.Control type="text" name="size" value={formData.size} onChange={handleInputChange} placeholder="e.g., 50ml, 100g, etc." />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Skin Type (for skin care products)</Form.Label>
                  <Form.Select name="skinType" value={formData.skinType} onChange={handleInputChange}>
                    <option value="">Select Skin Type</option>
                    {skinTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hair Type (for hair care products)</Form.Label>
                  <Form.Select name="hairType" value={formData.hairType} onChange={handleInputChange}>
                    <option value="">Select Hair Type</option>
                    {hairTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Volume/Quantity</Form.Label>
                  <Form.Control type="text" name="volume" value={formData.volume} onChange={handleInputChange} placeholder="e.g., 250ml, 50g" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Ingredients</Form.Label>
                  <Form.Control as="textarea" rows={2} name="ingredients" value={formData.ingredients} onChange={handleInputChange} placeholder="List main ingredients separated by commas" />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Benefits</Form.Label>
                  <Form.Control as="textarea" rows={2} name="benefits" value={formData.benefits} onChange={handleInputChange} placeholder="Key benefits of the product" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Usage Instructions</Form.Label>
                  <Form.Control as="textarea" rows={2} name="usage" value={formData.usage} onChange={handleInputChange} placeholder="How to use the product" />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isNatural"
                    checked={formData.isNatural}
                    onChange={(e) => setFormData({...formData, isNatural: e.target.checked})}
                    label="Natural Product"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isCrueltyFree"
                    checked={formData.isCrueltyFree}
                    onChange={(e) => setFormData({...formData, isCrueltyFree: e.target.checked})}
                    label="Cruelty Free"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isVegan"
                    checked={formData.isVegan}
                    onChange={(e) => setFormData({...formData, isVegan: e.target.checked})}
                    label="Vegan"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Product Image {!editingProduct && <span className="text-danger">*</span>}</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleInputChange}
                required={!editingProduct}
              />
              {!editingProduct && <Form.Text className="text-muted">Image is required for new products</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <section className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </section>
          </Form>
        </Modal.Body>
      </Modal>


    </main>
  )
}

export default AdminDashboard
