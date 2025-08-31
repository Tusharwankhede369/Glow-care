"use client"

import { useState } from "react"
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/admin.css"

const AdminLoginpro = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/admin/login", formData)

      // Store admin token
      localStorage.setItem("adminToken", response.data.token)
      localStorage.setItem("adminUser", JSON.stringify(response.data.admin))

      // Redirect to admin dashboard
      navigate("/admin/dashboard")
    } catch (err) {
      console.error("Admin login error:", err)
      setError(err.response?.data?.error || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100 justify-content-center">
          <Col md={6} lg={4}>
            <Card className="admin-login-card">
              <Card.Body className="p-5">
                <header className="text-center mb-4">
                  <h2 className="admin-title">Admin Login</h2>
                  <p className="text-muted">Access your admin dashboard</p>
                </header>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter admin email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" className="w-100 admin-login-btn" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Form>

                <footer className="text-center mt-3">
                  <p className="mb-0">
                    Don't have an admin account?{" "}
                    <Button variant="link" className="p-0" onClick={() => navigate("/admin/register")}>
                      Register here
                    </Button>
                  </p>
                </footer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default AdminLoginpro
