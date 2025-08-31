import { useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/login.css"

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: "",
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
      const response = await axios.post("http://localhost:5000/login", formData)
      localStorage.setItem("token", response.data.token)
      const profileRes = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${response.data.token}` },
      })
      setUser(profileRes.data)
      navigate("/")
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.error || "Login failed. Please check your username and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="login-bg-animated" />
      <div className="floating-circles">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="login-box">
          <div className="login-heading">
            <h3>Login</h3>
            <p>Please login using account detail below.</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                className="login-input"
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
                className="login-input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button className="btn-signin" type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
              <Link to="/forgot-password" className="forgot-link">Forgot your password?</Link>
            </div>

            <div className="text-start">
              <Link to="/register" className="create-link">Create account</Link>
            </div>
          </Form>
        </div>
      </Container>
    </>
  )
}

export default Login
