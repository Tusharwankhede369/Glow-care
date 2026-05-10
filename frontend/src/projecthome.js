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
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { BASE_URL } from "./config"
import { resolveMediaUrl } from "./utils/media"
import { formatUSD } from "./utils/format"
import "./CSS/home.css"

const banner1 = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=max&w=1600&q=82"
const banner2 = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=max&w=1600&q=82"
const banner3 = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=max&w=1600&q=82"
const premiumGiftSet1 = "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=max&w=800&q=82"
const premiumGiftSet2 = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=max&w=800&q=82"
const premiumGiftSet3 = "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=max&w=800&q=82"
const premiumGiftSet4 = "https://images.unsplash.com/photo-1601612628452-9e99ced43524?auto=format&fit=max&w=800&q=82"

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
      const response = await axios.get(`${BASE_URL}/products?limit=20`)
      const allProducts = response.data.products || response.data

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
            src={resolveMediaUrl(product.image)}
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
              {formatUSD(product.price)}
              {product.originalPrice && (
                <span className="original-price ms-2">{formatUSD(product.originalPrice)}</span>
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

  const CategoryCard = ({ image, title, subtitle, link }) => (
    <Link to={link} className="gc-category-card-link">
      <article className="gc-category-card">
        <div className="gc-category-card__media">
          <img
            src={image || "/placeholder.svg"}
            alt=""
            className="gc-category-card__img"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
        </div>
        <div className="gc-category-card__footer">
          <h3 className="gc-category-card__title">{title}</h3>
          {subtitle ? <p className="gc-category-card__sub">{subtitle}</p> : null}
        </div>
      </article>
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
      <section className="top-categories-section" aria-labelledby="home-categories-heading">
        <Container>
          <div className="gc-category-intro">
            <h2 id="home-categories-heading" className="gc-category-intro__title">
              Shop by category
            </h2>
            <p className="gc-category-intro__text">
              Curated edits that match our warm in-store palette — tap through to the full catalog.
            </p>
          </div>
          <Row className="g-3 g-lg-4">
            <Col lg={3} md={6} sm={6}>
              <CategoryCard
                image={premiumGiftSet4}
                title="Grooming range"
                subtitle="Hair & body care"
                link="/shop?category=Haircare"
              />
            </Col>
            <Col lg={3} md={6} sm={6}>
              <CategoryCard
                image={premiumGiftSet1}
                title="Perfume range"
                subtitle="Scents & layering"
                link="/shop?category=Perfume"
              />
            </Col>
            <Col lg={3} md={6} sm={6}>
              <CategoryCard
                image={premiumGiftSet2}
                title="Premium gift set"
                subtitle="Ready to gift"
                link="/shop?search=gift"
              />
            </Col>
            <Col lg={3} md={6} sm={6}>
              <CategoryCard
                image={premiumGiftSet3}
                title="Personalised gift box"
                subtitle="Make it theirs"
                link="/shop?search=personalised"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Hero Banner Section with Image Carousel */}
      <section className="hero-banner-section">
        <Container>
          <div className="d-flex justify-content-center mb-3">
            <DotLottieReact
              src="https://lottie.host/8b5f2f5f-dde9-4e32-8dfa-56fbc22969ca/vaF6P2uDi1.lottie"
              loop
              autoplay
              style={{ width: 160, height: 160 }}
            />
          </div>
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
                key={currentBanner}
                src={bannerImages[currentBanner] || "/placeholder.svg"}
                alt={`Glow Care spotlight ${currentBanner + 1}`}
                className="hero-banner-image-full"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
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
