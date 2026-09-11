"use client"

import { useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/register.css"
import { BASE_URL } from "./config"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    middleName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      const payload = {
        name: formData.name.trim(),
        middleName: formData.middleName.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
      }
      const res = await axios.post(`${BASE_URL}/signup`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.status === 201 || res.status === 200) {
        setSuccess("Account created. Check your email for the verification code.")
        setTimeout(() => navigate("/verify-email-otp", { state: { email: res.data.email } }), 800)
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
      <Container fluid className="register-stage">
        <div className="register-box">
          <section className="register-form-panel">
            <span className="register-brand">GLOWCARE</span>
            <div className="register-heading">
              <p className="register-kicker">A calmer routine starts here.</p>
              <h1>Create your account</h1>
              <p>Save your favourites, track orders, and make every care choice feel more personal.</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <div className="register-field-grid">
                <Form.Group className="register-field">
                  <Form.Label>First name</Form.Label>
                  <Form.Control type="text" name="name" placeholder="Your first name" value={formData.name} onChange={handleChange} required autoComplete="given-name" className="custom-input" />
                </Form.Group>
                <Form.Group className="register-field">
                  <Form.Label>Middle name <span>(optional)</span></Form.Label>
                  <Form.Control type="text" name="middleName" placeholder="Middle name" value={formData.middleName} onChange={handleChange} autoComplete="additional-name" className="custom-input" />
                </Form.Group>
              </div>

              <Form.Group className="register-field">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" name="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} required autoComplete="username" className="custom-input" />
              </Form.Group>

              <Form.Group className="register-field">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required autoComplete="email" className="custom-input" />
              </Form.Group>

              <Form.Group className="register-field">
                <Form.Label>Password</Form.Label>
                <div className="gc-password-field"><Form.Control type={showPassword ? "text" : "password"} name="password" placeholder="At least 8 characters" value={formData.password} onChange={handleChange} required minLength={8} className="custom-input" autoComplete="new-password" /><button type="button" className="gc-password-toggle" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div>
              </Form.Group>

              <Form.Group className="register-field register-field-last">
                <Form.Label>Confirm password</Form.Label>
                <div className="gc-password-field"><Form.Control type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} required minLength={8} className="custom-input" autoComplete="new-password" /><button type="button" className="gc-password-toggle" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div>
              </Form.Group>

              <Button type="submit" className="w-100 btn-custom" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
              <div className="register-login-link">Already have an account? <Link to="/login">Log in</Link></div>
            </Form>
          </section>
          <aside className="register-visual" aria-label="GlowCare beauty products">
            <div className="register-visual__copy"><span>GLOWCARE</span><strong>Care that<br />feels like you.</strong><small>Thoughtful essentials for everyday rituals.</small></div>
          </aside>
        </div>
      </Container>
    </div>
  )
}

export default Register
