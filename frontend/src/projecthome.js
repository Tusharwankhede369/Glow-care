"use client"
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, ToastContainer, Toast } from "react-bootstrap"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  FaStar,
  FaRegStar,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaGem,
  FaTags,
  FaPercent,
} from "react-icons/fa"
import axios from "axios"
import "./CSS/home.css"

// Import banner images - Fixed paths
import banner1 from "./images/home page banner.png"
import banner2 from "./images/homepagebanner2.png"
import banner3 from "./images/homepagebanner3.png"

// Import category images - Fixed paths
import premiumGiftSet1 from "./images/premium giftset.png"
import premiumGiftSet2 from "./images/premiumgiftset2.png"
import premiumGiftSet3 from "./images/premiumgiftset3.png"
import premiumGiftSet4 from "./images/premiumgiftset4.png"

const Home = ({ cart = {}, setCart = () => {} }) => {
  const [bestSaleProducts, setBestSaleProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [currentBanner, setCurrentBanner] = useState(0)

  // Banner images array - Using imported images
  const bannerImages = [banner1, banner2, banner3]

  // Auto-rotate banner images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1))
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [bannerImages.length])

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await axios.get("http://localhost:5000/products?limit=20")
      const allProducts = response.data.products || response.data
      console.log("Fetched products:", allProducts)

      // Filter products for best sale (products with originalPrice/discount)
      const saleProducts = allProducts
        .filter((product) => product.originalPrice && product.originalPrice > product.price)
        .slice(0, 4)
        .map((product) => ({
          ...product,
          id: product._id,
          badge: "SALE",
          rating: product.rating || 4,
          numReviews: product.numReviews || 10,
        }))

      const featured = allProducts.map((product) => ({
        ...product,
        id: product._id,
        badge: product.featured
          ? "NEW"
          : product.originalPrice && product.originalPrice > product.price
            ? "SALE"
            : null,
        rating: product.rating || 4,
        numReviews: product.numReviews || 10,
      }))

      setBestSaleProducts(saleProducts)
      setFeaturedProducts(featured)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Modified addToCart to handle adding/removing specific amounts
  const updateCart = (product, changeAmount) => {
    const productId = product.id || product._id
    setCart((prevCart) => {
      const currentQuantity = prevCart[productId] || 0
      const newQuantity = currentQuantity + changeAmount
      const updatedCart = { ...prevCart }

      if (newQuantity > 0) {
        updatedCart[productId] = newQuantity
      } else {
        delete updatedCart[productId]
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart))
      console.log("Cart updated:", updatedCart)

      if (changeAmount > 0) {
        setToastMessage(`${product.name} added to cart!`)
      } else if (changeAmount < 0 && newQuantity >= 0) {
        setToastMessage(`${product.name} removed from cart.`)
      }
      setShowToast(true)

      return updatedCart
    })
  }

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "SALE":
        return "danger"
      case "NEW":
        return "primary"
      case "SOLDOUT":
        return "secondary"
      default:
        return "dark"
    }
  }

  // Product Card Component - Enhanced with Cart Status
  const ProductCard = ({ product, cart, updateCart }) => {
    const currentQuantityInCart = cart[product.id] || 0
    const isInCart = currentQuantityInCart > 0

    return (
      <Card className="product-card h-100 shadow-sm">
        {product.badge && (
          <Badge bg={getBadgeColor(product.badge)} className="product-badge">
            {product.badge}
          </Badge>
        )}
        <div className="product-image-container">
          <Card.Img
            variant="top"
            src={product.image ? `http://localhost:5000${product.image}` : "/placeholder.svg"}
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = "/placeholder.svg"
            }}
          />
        </div>
        <Card.Body className="text-center d-flex flex-column justify-content-between">
          <div>
            <Card.Title className="product-name">{product.name}</Card.Title>
            <div className="star-rating">
              {[...Array(5)].map((_, i) =>
                i < (product.rating || 0) ? (
                  <FaStar key={i} className="star-filled" />
                ) : (
                  <FaRegStar key={i} className="star-empty" />
                ),
              )}
              <span className="review-count">({product.numReviews || 0})</span>
            </div>
            <Card.Text className="product-price">
              Rs. {product.price.toFixed(2)}
              {product.originalPrice && (
                <span className="original-price ms-2">Rs. {product.originalPrice.toFixed(2)}</span>
              )}
            </Card.Text>
          </div>
          <div className="product-actions">
            {!isInCart ? (
              <Button variant="primary" className="add-to-cart-btn w-100" onClick={() => updateCart(product, 1)}>
                <FaShoppingCart className="cart-icon" /> ADD TO CART
              </Button>
            ) : (
              <div className="cart-management w-100">
                <div className="cart-status">
                  <FaShoppingCart className="cart-status-icon" />
                  <span>
                    In Cart: {currentQuantityInCart} item{currentQuantityInCart > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="quantity-controls">
                  <Button variant="light" className="quantity-button" onClick={() => updateCart(product, -1)}>
                    <FaMinus />
                  </Button>
                  <span className="quantity-display">{currentQuantityInCart}</span>
                  <Button variant="light" className="quantity-button" onClick={() => updateCart(product, 1)}>
                    <FaPlus />
                  </Button>
                </div>
                <div className="cart-actions">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="remove-from-cart-btn"
                    onClick={() => {
                      const updatedCart = { ...cart }
                      delete updatedCart[product.id]
                      setCart(updatedCart)
                      localStorage.setItem("cart", JSON.stringify(updatedCart))
                      setToastMessage(`${product.name} removed from cart!`)
                      setShowToast(true)
                    }}
                  >
                    Remove Item
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    )
  }

  // Category Card Component
  const CategoryCard = ({ image, title, subtitle, link }) => (
    <Link to={link} className="category-card-link">
      <div className="main-category-card">
        <div className="category-image-container">
          <img src={image || "/placeholder.svg"} alt={title} className="main-category-image" />
        </div>
        <div className="category-content">
          <h3 className="category-main-title">{title}</h3>
          {subtitle && <p className="category-subtitle">{subtitle}</p>}
        </div>
      </div>
    </Link>
  )

  // Elegant Sparkle Animation Component
  const SparkleAnimation = () => (
    <div className="sparkle-container">
      <div className="sparkle sparkle-1">✨</div>
      <div className="sparkle sparkle-2">💎</div>
      <div className="sparkle sparkle-3">⭐</div>
      <div className="sparkle sparkle-4">✨</div>
    </div>
  )

  if (loading) {
    return (
      <main className="home-page">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading products...</p>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="home-page">
      {error && (
        <Container>
          <Alert variant="danger" className="mt-3">
            {error}
            <Button variant="link" onClick={fetchProducts} className="ms-2">
              Try Again
            </Button>
          </Alert>
        </Container>
      )}

      {/* Top Category Cards Section */}
      <section className="top-categories-section">
        <Container>
          <Row className="g-3">
            <Col lg={3} md={6} sm={6}>
              <CategoryCard image={premiumGiftSet4} title="GROOMING RANGE" link="/shop?category=grooming" />
            </Col>
            <Col lg={3} md={6} sm={6}>
              <CategoryCard image={premiumGiftSet1} title="PERFUME RANGE" link="/shop?category=perfume" />
            </Col>
            <Col lg={3} md={6} sm={6}>
              <CategoryCard image={premiumGiftSet2} title="PREMIUM GIFT SET" link="/shop?category=gift-sets" />
            </Col>
            <Col lg={3} md={6} sm={6}>
              <CategoryCard image={premiumGiftSet3} title="PERSONALISED GIFT BOX" link="/shop?category=personalised" />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Hero Banner Section with Image Carousel */}
      <section className="hero-banner-section">
        <Container>
          <div className="hero-banner">
            <button
              className="hero-nav-btn hero-nav-left"
              onClick={() => setCurrentBanner(currentBanner === 0 ? bannerImages.length - 1 : currentBanner - 1)}
            >
              <FaChevronLeft />
            </button>
            <button
              className="hero-nav-btn hero-nav-right"
              onClick={() => setCurrentBanner(currentBanner === bannerImages.length - 1 ? 0 : currentBanner + 1)}
            >
              <FaChevronRight />
            </button>

            {/* Full Image Display */}
            <div className="hero-image-full">
              <img
                src={bannerImages[currentBanner] || "/placeholder.svg"}
                alt={`Banner ${currentBanner + 1}`}
                className="hero-banner-image-full"
                onError={(e) => {
                  e.target.src = "/placeholder.svg?height=400&width=600"
                }}
              />
            </div>

            {/* Banner Indicators */}
            <div className="banner-indicators">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentBanner ? "active" : ""}`}
                  onClick={() => setCurrentBanner(index)}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Premium Deals Section - Updated with elegant heading */}
      {/* Hide Premium Deals section per request */}
      {false && (
        <section className="best-sale-section py-5">
          <Container>
            <header className="text-center mb-5">
              <div className="section-title-container">
                <SparkleAnimation />
                <h2 className="section-title premium-deals-title">
                  <FaGem className="gem-icon" />
                  PREMIUM DEALS
                  <FaTags className="tags-icon" />
                </h2>
                <div className="deals-badge">
                  <FaPercent className="percent-icon" />
                  <span className="deals-text">EXCLUSIVE SAVINGS</span>
                  <FaPercent className="percent-icon" />
                </div>
              </div>
              <p className="section-subtitle premium-deals-subtitle">
                Discover our handpicked collection of premium products at exceptional prices.
                <strong> Limited-time offers on luxury items you'll love!</strong>
              </p>
            </header>
            <Row>
              {bestSaleProducts.map((product) => (
                <Col lg={3} md={6} sm={6} key={product.id} className="mb-4">
                  <ProductCard product={product} cart={cart} updateCart={updateCart} />
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="featured-products-section py-5">
          <Container>
            <header className="text-center mb-5">
              <h2 className="section-title">FEATURED PRODUCTS</h2>
              <p className="section-subtitle">
                All best seller products are now available for you and you can buy these products from here any time,
                anywhere. Shop now!
              </p>
            </header>
            <Row>
              {featuredProducts.map((product) => (
                <Col lg={3} md={6} sm={6} key={product.id} className="mb-4">
                  <ProductCard product={product} cart={cart} updateCart={updateCart} />
                </Col>
              ))}
            </Row>
            <div className="text-center mt-4">
              <Button as={Link} to="/shop" variant="outline-primary" size="lg">
                View All Products
              </Button>
            </div>
          </Container>
        </section>
      )}

      <ToastContainer position="bottom-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide className="custom-toast">
          <Toast.Header className="custom-toast-header">
            <strong className="me-auto">Cart Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
  )
}

export default Home
