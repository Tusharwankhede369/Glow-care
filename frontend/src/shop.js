"use client"
import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Form, Badge, Card, Spinner, Alert, Button } from "react-bootstrap"
import { FaPlus, FaMinus, FaShoppingCart, FaFilter } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/shop.css"

const Shop = ({ cart, setCart }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [totalItems, setTotalItems] = useState(0)
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: [],
    subcategories: [],
    genders: [],
    skinTypes: [],
    hairTypes: [],
    sizes: [],
    priceRange: { minPrice: 0, maxPrice: 100 },
  })
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    subcategory: "",
    gender: "",
    skinType: "",
    hairType: "",
    size: "",
    minPrice: "",
    maxPrice: "",
    search: "",
    isNatural: false,
    isCrueltyFree: false,
    isVegan: false,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasPrev: false,
    hasNext: false,
  })

  const navigate = useNavigate()

  // Calculate total items in cart
  useEffect(() => {
    const count = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
    setTotalItems(count)
  }, [cart])

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/products/filters/options")
      setFilterOptions(response.data)
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key])
        }
      })
      params.append("page", pagination.currentPage)
      params.append("limit", 12)
      const response = await axios.get(`http://localhost:5000/products?${params}`)
      setProducts(response.data.products || [])
      setPagination(response.data.pagination || {})
      setError("")
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch products. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.currentPage])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
    setPagination((prev) => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      subcategory: "",
      gender: "",
      skinType: "",
      hairType: "",
      size: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      isNatural: false,
      isCrueltyFree: false,
      isVegan: false,
    })
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  // Compute auth state to disable cart controls when not logged in (UI + safety)
  const isAuthed = Boolean(typeof window !== "undefined" && localStorage.getItem("token"))

  // Helper function to ensure authentication or redirect
  const ensureAuthedOrRedirect = (redirectTo) => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true, state: { from: { pathname: redirectTo } } })
      return false
    }
    return true
  }

  // Guard add to cart by auth
  const addToCart = (productId) => {
    if (!ensureAuthedOrRedirect("/shop")) return
    console.log("Adding to cart:", productId) // Debug log
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      newCart[productId] = (newCart[productId] || 0) + 1
      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(newCart))
      console.log("Cart updated:", newCart) // Debug log
      return newCart
    })
  }

  // Guard remove from cart by auth
  const removeFromCart = (productId) => {
    if (!ensureAuthedOrRedirect("/shop")) return
    console.log("Removing from cart:", productId) // Debug log
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      if (newCart[productId] > 0) {
        newCart[productId] -= 1
        if (newCart[productId] === 0) {
          delete newCart[productId]
        }
      }
      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(newCart))
      console.log("Cart updated:", newCart) // Debug log
      return newCart
    })
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <main className="enhanced-shop-page">
      <Container>
        <Link to="/cart" className="cart-indicator">
          <FaShoppingCart />
          <Badge pill bg="danger">
            {totalItems}
          </Badge>
        </Link>

        <Row className="align-items-start">
          {/* Sidebar Filters */}
          <Col lg={3} className="sidebar">
            <Card className="filter-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaFilter className="me-2" />
                  Filters
                </h5>
                <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </Card.Header>
              <Card.Body>
                {/* Search */}
                <section className="filter-section">
                  <h6 className="filter-title">Search</h6>
                  <Form.Control
                    type="text"
                    placeholder="Search products..."
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </section>

                {/* Price Range */}
                <section className="filter-section">
                  <h6 className="filter-title">Price Range</h6>
                  <Row>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        placeholder="Min"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        placeholder="Max"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        min="0"
                      />
                    </Col>
                  </Row>
                  <small className="text-muted">
                    Range: ${filterOptions.priceRange.minPrice} - ${filterOptions.priceRange.maxPrice}
                  </small>
                </section>

                {/* Category Filter */}
                <section className="filter-section">
                  <h6 className="filter-title">Category</h6>
                  <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    {(filterOptions.categories || []).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </section>

                {/* Brand Filter */}
                <section className="filter-section">
                  <h6 className="filter-title">Brand</h6>
                  <Form.Select name="brand" value={filters.brand} onChange={handleFilterChange}>
                    <option value="">All Brands</option>
                    {(filterOptions.brands || []).map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </Form.Select>
                </section>

                {/* Size Filter */}
                <section className="filter-section">
                  <h6 className="filter-title">Size</h6>
                  <Form.Select name="size" value={filters.size} onChange={handleFilterChange}>
                    <option value="">All Sizes</option>
                    {(filterOptions.sizes || []).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </Form.Select>
                </section>
              </Card.Body>
            </Card>
          </Col>

          {/* Product Grid */}
          <Col lg={9}>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Results Header */}
            <section className="results-header mb-4">
              <h4>Products ({pagination.totalProducts} found)</h4>
              {Object.values(filters).some((filter) => filter) && (
                <p className="text-muted">Showing filtered results</p>
              )}
            </section>

            {loading ? (
              <section className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading products...</p>
              </section>
            ) : products.length === 0 ? (
              <section className="text-center py-5">
                <h5>No products found</h5>
                <p className="text-muted">Try adjusting your filters or search terms</p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </section>
            ) : (
              <Row className="products-grid">
                {products.map((product) => (
                  <Col lg={4} md={6} sm={6} key={product._id} className="product-col">
                    <Link to={`/product/${product._id}`} className="text-decoration-none">
                      <Card className="product-card h-100">
                        {product.discount > 0 && (
                          <Badge bg="danger" className="product-discount-badge">
                            -{product.discount}%
                          </Badge>
                        )}
                        {product.featured && (
                          <Badge bg="success" className="product-featured-badge">
                            Featured
                          </Badge>
                        )}
                        <Card.Img
                          variant="top"
                          src={product.image ? `http://localhost:5000${product.image}` : "/placeholder.svg"}
                          alt={product.name}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                          }}
                        />
                        <Card.Body className="product-info">
                          <Card.Title className="product-name">{product.name}</Card.Title>
                          <Card.Text className="product-category text-muted">
                            {product.category} • {product.brand}
                          </Card.Text>
                          <Card.Text className="product-price">
                            ${product.price.toFixed(2)}
                            {product.originalPrice && (
                              <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                            )}
                          </Card.Text>

                          {/* Product Details */}
                          <section className="product-details mb-2">
                            {product.color && (
                              <Badge bg="light" text="dark" className="me-1 mb-1">
                                {product.color}
                              </Badge>
                            )}
                            {product.size && (
                              <Badge bg="light" text="dark" className="me-1 mb-1">
                                Size: {product.size}
                              </Badge>
                            )}
                            {product.material && (
                              <Badge bg="light" text="dark" className="me-1 mb-1">
                                {product.material}
                              </Badge>
                            )}
                          </section>

                          <section className="cart-controls has-bg" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="cart-btn remove-btn"
                              aria-label="Decrease quantity"
                              onClick={() => removeFromCart(product._id)}
                              disabled={!isAuthed || !cart[product._id]}
                              title={isAuthed ? "Decrease quantity" : "Login to modify cart"}
                            >
                              <FaMinus />
                            </Button>
                            <span className="cart-quantity mx-2">{cart[product._id] || 0}</span>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="cart-btn add-btn"
                              aria-label="Increase quantity"
                              onClick={() => addToCart(product._id)}
                              disabled={!isAuthed}
                              title={isAuthed ? "Add to cart" : "Login to add to cart"}
                            >
                              <FaPlus />
                            </Button>
                          </section>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav className="pagination-nav mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${!pagination.hasPrev ? "disabled" : ""}`}>
                    <Button
                      variant="outline-primary"
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      Previous
                    </Button>
                  </li>
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1
                    return (
                      <li key={page} className={`page-item ${page === pagination.currentPage ? "active" : ""}`}>
                        <Button
                          variant={page === pagination.currentPage ? "primary" : "outline-primary"}
                          onClick={() => handlePageChange(page)}
                          className="mx-1"
                        >
                          {page}
                        </Button>
                      </li>
                    )
                  })}
                  <li className={`page-item ${!pagination.hasNext ? "disabled" : ""}`}>
                    <Button
                      variant="outline-primary"
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      Next
                    </Button>
                  </li>
                </ul>
              </nav>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Shop
