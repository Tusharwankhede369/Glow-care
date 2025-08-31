"use client"

import { useState } from "react"
import { Navbar, Nav, Container, Badge, Form, InputGroup, Button, Dropdown } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import { FaShoppingCart, FaSearch, FaUserCircle, FaSignOutAlt } from "react-icons/fa"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./CSS/projectnavbar.css" // Ensure this CSS file is in the same directory


const Navigation = ({ cartItemCount = 0, user, setUser }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token") // Clear token
    setUser(null)
    navigate("/login")
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <Navbar expand="lg" className="py-4 border-bottom sticky-navbar fresh-navbar">
      <Container fluid className="px-4">
        {" "}
        {/* Use fluid for full width, adjust padding */}
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <span className="logo-animation-wrapper">
            {" "}
            {/* Wrapper for animation */}
            <DotLottieReact
              src="https://lottie.host/2e2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/leaf.json"
              loop
              autoplay
              className="lottie-logo"
            />
          </span>
          <span className="fresh-text">Glow</span>
          <span className="basket-text">Care</span>
        </Navbar.Brand>
        {/* Search Bar - Desktop */}
        <div className="search-container d-none d-lg-flex mx-4 flex-grow-1">
          <Form onSubmit={handleSearch} className="w-100">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search for hair care, skin care, body care..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <Button type="submit" className="search-btn-custom">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
        </div>
        <div className="d-flex order-lg-last ms-auto me-2 me-lg-0 align-items-center">
          {/* Cart Icon with Badge */}
          <Link to="/cart" className="cart-indicator nav-link me-3">
            <FaShoppingCart style={{ marginRight: "6px", fontSize: "1.1em" }} /> Cart
            {cartItemCount > 0 && (
              <Badge pill bg="danger" className="ms-1">
                {cartItemCount}
              </Badge>
            )}
          </Link>
        </div>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Search Bar - Mobile */}
          <div className="search-container-mobile d-lg-none mb-3 mt-3">
            <Form onSubmit={handleSearch}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <Button type="submit" className="search-btn-custom">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Form>
          </div>

          {/* Center Navigation Links */}
          <Nav className="mx-auto main-nav-links">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/shop">
              Products
            </Nav.Link>
            <Nav.Link as={Link} to="/about">
              About
            </Nav.Link>
            <Nav.Link as={Link} to="/contact">
              Contact
            </Nav.Link>
          </Nav>

          {/* Right Side - Profile or Auth Links */}
          <Nav className="ms-auto profile-auth-links">
            {user ? (
              <Dropdown align="end" className="profile-dropdown">
                <Dropdown.Toggle variant="link" className="profile-toggle">
                  <FaUserCircle className="profile-icon" />
                </Dropdown.Toggle>
                <Dropdown.Menu className="profile-menu">
                  <div className="profile-details p-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaUserCircle size={48} className="profile-avatar-lg me-2" />
                      <div>
                        <div className="fw-bold">{user.name || user.username}</div>
                        <div className="text-muted small">{user.email}</div>
                      </div>
                    </div>
                    <div className="mb-1">
                      <strong>Address:</strong> {user.address || "Not set"}
                    </div>
                    <div className="mb-1">
                      <strong>Phone:</strong> {user.phone || "Not set"}
                    </div>
                  </div>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center">
                    <FaUserCircle className="me-2" /> Profile
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center">
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="auth-link">
                  Login
                </Nav.Link>
                <span className="auth-separator mx-2">|</span>
                <Nav.Link as={Link} to="/register" className="auth-link">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation
