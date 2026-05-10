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
import { BASE_URL } from "./config"
import ForgotPassword from "./auth/ForgotPassword"
import ResetPassword from "./auth/ResetPassword"
import VerifyEmail from "./auth/VerifyEmail"

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

function RequireAdmin({ children }) {
  const location = useLocation()
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null
  if (!token) return <Navigate to="/admin/login" replace state={{ from: location }} />
  return children
}

function AppShell({ cart, setCart, user, setUser }) {
  const location = useLocation()
  const showStoreChrome = !location.pathname.startsWith("/admin")
  const cartItemCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)

  return (
    <>
      {showStoreChrome && <Navbar cartItemCount={cartItemCount} user={user} setUser={setUser} />}
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin/login" element={<AdminLoginpro />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        <Route path="/" element={<RequireAuth><Home cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/shop" element={<RequireAuth><Shop cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/product/:id" element={<RequireAuth><Product cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/blog" element={<RequireAuth><h2>Blog Page</h2></RequireAuth>} />
        <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
        <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
        <Route path="/cart" element={<RequireAuth><Cart cart={cart} setCart={setCart} /></RequireAuth>} />
        <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/profile" element={<RequireAuth><Profile cart={cart} /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showStoreChrome && <Footer />}
    </>
  )
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

  // Authorization for axios is handled in axiosSetup.js (shop vs admin tokens).

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios
        .get(`${BASE_URL}/profile`, {
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

  return (
    <Router>
      <AppShell cart={cart} setCart={setCart} user={user} setUser={setUser} />
    </Router>
  )
}

export default Project
