"use client"
import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Button, Form, Spinner, Alert } from "react-bootstrap"
import { FaTrash, FaShoppingCart, FaArrowRight } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/cart.css"
import { BASE_URL } from "./config"
import { resolveMediaUrl } from "./utils/media"
import { formatUSD } from "./utils/format"

const SHIPPING_FLAT = 79
const FREE_SHIPPING_AT = 999

const Cart = ({ cart, setCart }) => {
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const navigate = useNavigate()

  const shipping = subtotal > FREE_SHIPPING_AT ? 0 : subtotal > 0 ? SHIPPING_FLAT : 0
  const orderTotal = subtotal + shipping

  const fetchCartItems = useCallback(async () => {
    const productIds = Object.keys(cart || {}).filter((id) => Number(cart[id]) > 0)
    if (productIds.length === 0) {
      setCartItems([])
      setSubtotal(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")
      const results = await Promise.all(
        productIds.map((productId) =>
          axios.get(`${BASE_URL}/products/${productId}`).then((r) => r.data).catch(() => null)
        )
      )

      const items = []
      let total = 0
      productIds.forEach((productId, i) => {
        const product = results[i]
        if (!product) return
        const quantity = Number(cart[productId]) || 0
        if (quantity < 1) return
        const line = product.price * quantity
        total += line
        items.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          total: line,
          category: product.category,
          brand: product.brand,
        })
      })
      setCartItems(items)
      setSubtotal(total)
    } catch (err) {
      setError("We couldn’t load your cart. Please refresh or try again.")
    } finally {
      setLoading(false)
    }
  }, [cart])

  useEffect(() => {
    fetchCartItems()
  }, [fetchCartItems])

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1
    setCart((prevCart) => {
      const newCart = { ...prevCart, [productId]: newQuantity }
      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }

  const removeItem = (productId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      delete newCart[productId]
      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }

  const clearCart = () => {
    setCart({})
    localStorage.setItem("cart", JSON.stringify({}))
  }

  const syncNotice = () => {
    setNotice("Cart saved.")
    setTimeout(() => setNotice(""), 2500)
  }

  const continueShopping = () => {
    navigate("/shop")
  }

  if (loading) {
    return (
      <main className="gc-cart-page">
        <Container>
          <div className="gc-cart-loading text-center py-5">
            <Spinner animation="border" role="status" className="text-primary" />
            <p className="mt-3 text-muted mb-0">Loading your bag…</p>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="gc-cart-page">
      <Container>
        <header className="gc-cart-header">
          <h1 className="gc-cart-title">Your bag</h1>
          <p className="gc-cart-lead text-muted">
            Prices and availability match our catalog. Checkout uses the same totals you see here.
          </p>
        </header>

        {notice && <Alert variant="success" className="gc-cart-alert">{notice}</Alert>}
        {error && (
          <Alert variant="danger" className="gc-cart-alert">
            {error}
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <div className="gc-cart-empty">
            <div className="gc-cart-empty__icon-wrap">
              <FaShoppingCart className="gc-cart-empty__icon" aria-hidden />
            </div>
            <h2 className="gc-cart-empty__title">Your bag is empty</h2>
            <p className="gc-cart-empty__text text-muted">
              Explore the shop and add products curated by Glow Care.
            </p>
            <Button className="gc-btn-primary" onClick={continueShopping}>
              Continue shopping <FaArrowRight className="ms-2" />
            </Button>
          </div>
        ) : (
          <Row className="g-4 align-items-start">
            <Col lg={8}>
              <ul className="gc-cart-list list-unstyled mb-0">
                {cartItems.map((item) => (
                  <li key={item.id} className="gc-cart-line">
                    <Link to={`/product/${item.id}`} className="gc-cart-line__thumb-link">
                      <img
                        src={resolveMediaUrl(item.image)}
                        alt=""
                        className="gc-cart-line__thumb"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </Link>
                    <div className="gc-cart-line__body">
                      <Link to={`/product/${item.id}`} className="gc-cart-line__name">
                        {item.name}
                      </Link>
                      <p className="gc-cart-line__meta text-muted small mb-2">
                        {item.brand}
                        {item.category ? ` · ${item.category}` : ""}
                      </p>
                      <div className="gc-cart-line__row">
                        <div className="gc-cart-qty">
                          <button
                            type="button"
                            className="gc-cart-qty__btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <Form.Control
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value, 10) || 1)}
                            className="gc-cart-qty__input"
                          />
                          <button
                            type="button"
                            className="gc-cart-qty__btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="gc-cart-line__price">
                          <span className="gc-cart-line__unit text-muted small">
                            {formatUSD(item.price)} each
                          </span>
                          <span className="gc-cart-line__line-total">{formatUSD(item.total)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="gc-cart-line__remove"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="gc-cart-actions mt-3">
                <Button variant="outline-secondary" className="me-2" onClick={syncNotice}>
                  Save bag
                </Button>
                <Button variant="outline-danger" onClick={clearCart}>
                  Clear bag
                </Button>
                <Button variant="link" className="text-decoration-none" onClick={continueShopping}>
                  Continue shopping
                </Button>
              </div>
            </Col>

            <Col lg={4}>
              <aside className="gc-cart-summary-card">
                <h2 className="gc-cart-summary-card__title">Order summary</h2>
                <div className="gc-cart-summary-rows">
                  <div className="gc-cart-summary-row">
                    <span>Subtotal</span>
                    <span>{formatUSD(subtotal)}</span>
                  </div>
                  <div className="gc-cart-summary-row">
                    <span>Shipping (US)</span>
                    <span>
                      {shipping === 0 && subtotal > 0 ? (
                        <span className="text-success">Free</span>
                      ) : subtotal === 0 ? (
                        "—"
                      ) : (
                        formatUSD(shipping)
                      )}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal <= FREE_SHIPPING_AT && (
                    <p className="gc-cart-ship-hint small text-muted mb-0">
                      Add {formatUSD(FREE_SHIPPING_AT - subtotal)} more for free shipping on orders over{" "}
                      {formatUSD(FREE_SHIPPING_AT)}.
                    </p>
                  )}
                  <div className="gc-cart-summary-row gc-cart-summary-row--total">
                    <span>Estimated total</span>
                    <span>{formatUSD(orderTotal)}</span>
                  </div>
                </div>
                <Button className="gc-btn-primary w-100 mb-2" size="lg" disabled>
                  Checkout (coming soon)
                </Button>
                <p className="small text-muted mb-0 text-center">
                  Secure checkout will connect to your payment provider. Totals include flat US shipping under{" "}
                  {formatUSD(FREE_SHIPPING_AT)}.
                </p>
              </aside>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  )
}

export default Cart
