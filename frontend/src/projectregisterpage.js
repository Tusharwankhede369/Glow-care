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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await axios.post(`${BASE_URL}/signup`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.status === 201 || res.status === 200) {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Registration failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Container className="register-box p-5 shadow-sm">
        <Row>
          <Col className="text-center mb-4">
            <h3 className="register-title">Create Account</h3>
            <p className="text-muted">
              Please register using account details below.
            </p>
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
              value={formData.middleName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              name="username"
              placeholder="Username"
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
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </Button>

          <div className="text-center mt-3">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </Form>
      </Container>
    </div>
  )
}

export default Register
