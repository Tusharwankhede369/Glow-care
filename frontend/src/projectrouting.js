"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Navbar from "./projectnavbar"
import Login from "./loginproject"
import Register from "./projectregisterpage"
import Contact from "./contact"
import Shop from "./shop"
import Product from "./product"
import Cart from "./cart"
import Footer from "./footer"
import About from "./about"
import Home from "./projecthome"
import AdminRegister from "./AdminRegister"
import AdminDashboard from "./AdminDashboard"
import AdminLoginpro from "./admin-login"
import Profile from "./profile"
import axios from "axios"

// Authentication wrapper to protect routes
function RequireAuth({ children }) {
  const location = useLocation()
  
  // Access token from localStorage, guarding for SSR/next.js environments
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  if (!token) {
    // Redirect to login with state to return post-login to intended page
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}


function Project() {
  const [cart, setCart] = useState({})
  const [user, setUser] = useState(null)

  // Load saved cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error)
        setCart({})
      }
    }
  }, [])

  // Save cart in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  // Setup axios header with token if available
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [])

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios
        .get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token invalid or expired; cleanup and redirect enforced via RequireAuth
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
          setUser(null)
        })
    } else {
      setUser(null)
    }
  }, [])

  const cartItemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)

  return (
    <Router>
      <Navbar cartItemCount={cartItemCount} user={user} setUser={setUser} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLoginpro />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Protected Routes */}
        <Route path="/" element={<RequireAuth><Home cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/shop" element={<RequireAuth><Shop cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/product/:id" element={<RequireAuth><Product cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/blog" element={<RequireAuth><h2>Blog Page</h2></RequireAuth>} />
        <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
        <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth><Cart cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Redirect unknown routes to home or custom 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default Project
