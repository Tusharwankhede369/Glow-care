"use client"

import { useState } from "react"
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/admin.css"

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    try {
      await axios.post("http://localhost:5000/admin/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      setSuccess("Admin account created successfully! Redirecting to login...")
      setTimeout(() => {
        navigate("/admin/login")
      }, 2000)
    } catch (err) {
      console.error("Admin registration error:", err)
      setError(err.response?.data?.error || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-register-page">
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
        <Row className="w-100 justify-content-center">
          <Col md={8} lg={6}>
            <Card className="admin-register-card">
              <Card.Body className="p-5">
                <header className="text-center mb-4">
                  <h2 className="admin-title">Admin Registration</h2>
                  <p className="text-muted">Create your admin account</p>
                </header>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit} noValidate>
                  <Form.Group className="mb-3" controlId="adminName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="adminEmail">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="adminPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                        />
                        <Form.Text className="text-muted">Password must be at least 6 characters long</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="adminConfirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          minLength={6}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button type="submit" className="w-100 admin-register-btn" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Admin Account"}
                  </Button>
                </Form>

                <footer className="text-center mt-3">
                  <p className="mb-0">
                    Already have an admin account?{" "}
                    <Button variant="link" className="p-0" onClick={() => navigate("/admin/login")}>
                      Login here
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

export default AdminRegister
