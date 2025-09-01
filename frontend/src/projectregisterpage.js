"use client"

import { useState } from "react"
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/register.css"
import { BASE_URL } from "./config"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    middleName: "",
    email: "",
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
    setSuccess("")
    setLoading(true)

    try {
      // Connect to your backend signup endpoint
      await axios.post(`${BASE_URL}/signup`, formData)

      setSuccess("Account created successfully! Redirecting to login...")

      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.error || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center bg-white">
      <Container className="register-box p-5 shadow-sm">
        <Row>
          <Col className="text-center mb-4">
            <h3 className="register-title">Create Account</h3>
            <p className="text-muted">Please Register using account detail below.</p>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="name"
              placeholder="First Name"
              className="custom-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="middleName"
              placeholder="Middle Name (Optional)"
              className="custom-input"
              value={formData.middleName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="username"
              placeholder="Username"
              className="custom-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              name="email"
              placeholder="Email"
              className="custom-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              className="custom-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Button className="btn-custom" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </Col>
          </Row>

          <Row>
            <Col>
              <Link to="/login" className="text-decoration-none">
                Already have an account? Login
              </Link>
            </Col>
          </Row>
        </Form>
      </Container>
    </Container>
  )
}

export default Register
