"use client"
import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Table, Button, Form, Spinner, Alert } from "react-bootstrap"
import { FaTrash, FaShoppingCart } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/cart.css" // Re-added CSS import

const Cart = ({ cart, setCart }) => {
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Fetch product details and calculate cart items whenever cart changes
  const fetchCartItems = useCallback(async () => {
    if (Object.keys(cart).length === 0) {
      setCartItems([])
      setSubtotal(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError("")

      // Get all product IDs from cart
      const productIds = Object.keys(cart)
      console.log("Fetching products for cart:", productIds) // Debug log

      // FIXED: Fetch from actual API instead of using mock data
      const response = await axios.get("http://localhost:5000/products")
      const allProducts = response.data.products || response.data
      console.log("All products fetched from API:", allProducts.length) // Debug log

      // Filter products that are in the cart
      const items = []
      let total = 0

      productIds.forEach((productId) => {
        const product = allProducts.find((p) => p._id === productId)
        console.log(`Looking for product ${productId}:`, product ? "found" : "not found") // Debug log

        if (product && cart[productId] > 0) {
          const quantity = cart[productId]
          const itemTotal = product.price * quantity
          total += itemTotal

          items.push({
            id: product._id, // Use _id from backend
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            total: itemTotal,
            category: product.category,
            brand: product.brand,
          })
        }
      })

      console.log("Cart items processed:", items) // Debug log
      setCartItems(items)
      setSubtotal(total)
    } catch (err) {
      console.error("Error fetching cart items:", err)
      setError("Failed to load cart items. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [cart])

  useEffect(() => {
    fetchCartItems()
  }, [cart, fetchCartItems])

  // Update quantity of an item
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1
    setCart((prevCart) => {
      const newCart = { ...prevCart, [productId]: newQuantity }
      localStorage.setItem("cart", JSON.stringify(newCart)) // Persist to localStorage
      return newCart
    })
  }

  // Remove an item from cart
  const removeItem = (productId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart }
      delete newCart[productId]
      localStorage.setItem("cart", JSON.stringify(newCart)) // Persist to localStorage
      return newCart
    })
  }

  // Clear the entire cart
  const clearCart = () => {
    setCart({})
    localStorage.setItem("cart", JSON.stringify({})) // Clear localStorage
  }

  // Update cart (placeholder for future functionality like saving to server)
  const updateCart = () => {
    localStorage.setItem("cart", JSON.stringify(cart))
    alert("Cart updated successfully!")
  }

  // Continue shopping
  const continueShopping = () => {
    navigate("/shop") // Assuming a /shop route exists in your app
  }

  if (loading) {
    return (
      <main className="cart-page">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading cart...</p>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <Container>
        <h1 className="cart-title">Shopping Cart</h1>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any products to your cart yet.</p>
            <Button variant="primary" onClick={continueShopping}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-table-container">
              <Table responsive className="cart-table">
                <thead>
                  <tr>
                    <th className="image-col">Image</th>
                    <th className="product-col">Product</th>
                    <th className="price-col">Price</th>
                    <th className="quantity-col">Quantity</th>
                    <th className="total-col">Total</th>
                    <th className="remove-col">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="image-col">
                        <img
                          src={item.image ? `http://localhost:5000${item.image}` : "/placeholder.svg"}
                          alt={item.name}
                          className="cart-item-image"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg"
                          }}
                        />
                      </td>
                      <td className="product-col">
                        <div>
                          <strong>{item.name}</strong>
                          <br />
                          <small className="text-muted">
                            {item.category} • {item.brand}
                          </small>
                        </div>
                      </td>
                      <td className="price-col">${item.price.toFixed(2)}</td>
                      <td className="quantity-col">
                        <div className="quantity-control">
                          <Button
                            variant="light"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                            className="quantity-input"
                            min="1"
                          />
                          <Button
                            variant="light"
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="total-col">${item.total.toFixed(2)}</td>
                      <td className="remove-col">
                        <Button variant="link" className="remove-btn" onClick={() => removeItem(item.id)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <Row className="cart-summary">
              <Col md={6}>
                <div className="cart-actions">
                  <Button variant="secondary" className="update-cart-btn" onClick={updateCart}>
                    Update Cart
                  </Button>
                  <Button variant="primary" className="continue-shopping-btn" onClick={continueShopping}>
                    Continue Shopping
                  </Button>
                  <Button variant="danger" className="clear-cart-btn" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </Col>
              <Col md={6}>
                <div className="cart-totals">
                  <h3>Cart Totals</h3>
                  <div className="totals-row">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="totals-row grand-total">
                    <span>Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <Button variant="success" className="checkout-btn">
                    Proceed to Checkout
                  </Button>
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </main>
  )
}

export default Cart
