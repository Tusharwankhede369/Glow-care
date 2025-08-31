"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Form, Modal, Button, Spinner, Alert } from "react-bootstrap"
import "./CSS/product.css"
import { FaShoppingCart } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

const Product = ({ cart, setCart }) => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState("")
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [relatedProducts, setRelatedProducts] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [youMayAlsoLike, setYouMayAlsoLike] = useState([])
  const [youMayAlsoLikeLoading, setYouMayAlsoLikeLoading] = useState(false)

  // Cart confirmation modal state
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState(null)

  // Auth check for UI
  const isAuthed = Boolean(typeof window !== "undefined" && localStorage.getItem("token"))

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/products/${id}`)
        setProduct(response.data)
        setMainImage(response.data.image ? `http://localhost:5000${response.data.image}` : "/placeholder.svg")
        setError("")
        if (response.data.category) {
          fetchRelatedProducts(response.data.category, response.data._id)
        }
        fetchYouMayAlsoLike(response.data._id)
      } catch {
        setError("Failed to load product. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  const fetchRelatedProducts = async (category, currentProductId) => {
    try {
      setRelatedLoading(true)
      const response = await axios.get(
        `http://localhost:5000/products?category=${encodeURIComponent(category)}&limit=4`
      )
      const filtered = response.data.products.filter((p) => p._id !== currentProductId)
      setRelatedProducts(filtered)
    } catch {
      setRelatedProducts([])
    } finally {
      setRelatedLoading(false)
    }
  }

  const fetchYouMayAlsoLike = async (currentProductId) => {
    try {
      setYouMayAlsoLikeLoading(true)
      const response = await axios.get(`http://localhost:5000/products?limit=4`)
      const filtered = response.data.products.filter((p) => p._id !== currentProductId)
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 4)
      setYouMayAlsoLike(shuffled)
    } catch {
      setYouMayAlsoLike([])
    } finally {
      setYouMayAlsoLikeLoading(false)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const handleQuantityChange = (e) => {
    setQuantity(Number.parseInt(e.target.value))
  }

  const addToCart = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true, state: { from: { pathname: `/product/${id}` } } })
      return
    }
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      newCart[product._id] = (newCart[product._id] || 0) + quantity
      return newCart
    })
    setAddedProduct({
      name: product.name,
      quantity: quantity,
      price: product.price,
    })
    setShowCartModal(true)
  }

  const buyNow = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true, state: { from: { pathname: `/product/${id}` } } })
      return
    }
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      newCart[product._id] = (newCart[product._id] || 0) + quantity
      return newCart
    })
    navigate("/cart")
  }

  const addRelatedToCart = (relatedProduct) => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { replace: true, state: { from: { pathname: `/product/${id}` } } })
      return
    }
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      newCart[relatedProduct._id] = (newCart[relatedProduct._id] || 0) + 1
      return newCart
    })
    setAddedProduct({
      name: relatedProduct.name,
      quantity: 1,
      price: relatedProduct.price,
    })
    setShowCartModal(true)
  }

  const viewCart = () => {
    setShowCartModal(false)
    navigate("/cart")
  }

  const continueShopping = () => {
    setShowCartModal(false)
  }

  if (loading) {
    return (
      <main className="product-page">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading product...</p>
          </div>
        </Container>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="product-page">
        <Container>
          <div className="text-center py-5">
            <Alert variant="danger">{error || "Product not found"}</Alert>
            <Button variant="primary" onClick={() => navigate("/shop")}>
              Back to Shop
            </Button>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="product-page">
      <Container>
        <Row>
          <Col md={6} className="product-images-container">
            <figure className="main-image-container">
              <img src={mainImage || "/placeholder.svg"} alt={product.name} className="main-product-image" />
            </figure>
          </Col>

          <Col md={6} className="product-details-container">
            <Form className="product-details-form">
              <h2 className="product-title">{product.name}</h2>
              <div className="product-badges mb-2">
                {product.isNatural && <span className="badge bg-success me-2">Natural</span>}
                {product.isVegan && <span className="badge bg-info me-2">Vegan</span>}
                {product.isCrueltyFree && <span className="badge bg-warning text-dark me-2">Cruelty Free</span>}
              </div>
              <p className="product-price">
                <span className="current-price">₹{product.price}</span>
                {product.originalPrice && <span className="original-price ms-2">₹{product.originalPrice}</span>}
              </p>
              <p className="product-availability">{product.availability}</p>
              <section className="quantity-selection">
                <span className="option-label">Quantity:</span>
                <section className="quantity-selector">
                  <button type="button" className="quantity-btn" onClick={decreaseQuantity}>
                    -
                  </button>
                  <input type="text" className="quantity-input" value={quantity} onChange={handleQuantityChange} readOnly />
                  <button type="button" className="quantity-btn" onClick={increaseQuantity}>
                    +
                  </button>
                </section>
              </section>
            </Form>

            <section className="product-actions">
              <button
                type="button"
                className="add-to-cart-btn"
                onClick={addToCart}
                disabled={!isAuthed}
                title={isAuthed ? "Add to cart" : "Login to add to cart"}
              >
                Add to cart
              </button>
              <button
                type="button"
                className="buy-now-btn"
                onClick={buyNow}
                disabled={!isAuthed}
                title={isAuthed ? "Buy now" : "Login to continue"}
              >
                Buy it now
              </button>
              {!isAuthed && <p className="text-muted mt-2" style={{ fontSize: 12 }}>Please log in to add items to your cart.</p>}
            </section>
          </Col>
        </Row>

        <section className="related-products">
          <h2 className="section-title">Related Products</h2>
          <p className="section-subtitle">You can check the related product for your shopping collection.</p>

          {relatedLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
              <p className="mt-2">Loading related products...</p>
            </div>
          ) : relatedProducts.length > 0 ? (
            <Row>
              {relatedProducts.map((product) => (
                <Col md={3} sm={6} key={product._id} className="related-product-col">
                  <article className="product-card">
                    {product.discount > 0 && <span className="product-badge sale">SALE</span>}
                    <figure className="product-image">
                      <img src={`http://localhost:5000${product.image}` || "/placeholder.svg"} alt={product.name} className="product-thumbnail" />
                    </figure>
                    <section className="product-card-body">
                      <h3 className="product-card-title">{product.name}</h3>
                      <p className="product-card-price">
                        ₹{product.price}
                        {product.originalPrice && <span className="original-price"> ₹{product.originalPrice}</span>}
                      </p>
                      <button
                        className="quick-add-btn"
                        onClick={() => addRelatedToCart(product)}
                        disabled={!isAuthed}
                        title={isAuthed ? "Add to cart" : "Login to add to cart"}
                      >
                        Add to Cart
                      </button>
                    </section>
                  </article>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No related products found.</p>
            </div>
          )}
        </section>

        <h2 className="section-title">You May Also Like</h2>
        <p className="section-subtitle">Most of the customers choose our products. You may also like our product.</p>

        {youMayAlsoLikeLoading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="mt-2">Loading products...</p>
          </div>
        ) : youMayAlsoLike.length > 0 ? (
          <Row>
            {youMayAlsoLike.map((product) => (
              <Col md={3} sm={6} key={`like-${product._id}`} className="related-product-col">
                <article className="product-card">
                  {product.discount > 0 && <span className="product-badge sale">SALE</span>}
                  <figure className="product-image">
                    <img src={`http://localhost:5000${product.image}` || "/placeholder.svg"} alt={product.name} className="product-thumbnail" />
                  </figure>
                  <section className="product-card-body">
                    <h3 className="product-card-title">{product.name}</h3>
                    <p className="product-card-price">
                      ₹{product.price}
                      {product.originalPrice && <span className="original-price"> ₹{product.originalPrice}</span>}
                    </p>
                    <button
                      className="quick-add-btn"
                      onClick={() => addRelatedToCart(product)}
                      disabled={!isAuthed}
                      title={isAuthed ? "Add to cart" : "Login to add to cart"}
                    >
                      Add to Cart
                    </button>
                  </section>
                </article>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">No products available at the moment.</p>
          </div>
        )}

        <Modal show={showCartModal} onHide={continueShopping} centered className="cart-confirmation-modal">
          <Modal.Header closeButton>
            <Modal.Title>Added to Cart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {addedProduct && (
              <div className="added-product-info">
                <div className="added-product-icon">
                  <FaShoppingCart size={30} />
                </div>
                <div className="added-product-details">
                  <h5>{addedProduct.name}</h5>
                  <p>
                    {addedProduct.quantity} {addedProduct.quantity > 1 ? "items" : "item"} added to your cart
                  </p>
                  <p className="added-product-price">Total: ₹{(addedProduct.price * addedProduct.quantity).toFixed(2)}</p>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={continueShopping}>
              Continue Shopping
            </Button>
            <Button variant="primary" onClick={viewCart}>
              View Cart
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </main>
  )
}

export default Product
