import { useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/login.css"
import { BASE_URL } from "./config"

const API_BASE_URL = BASE_URL

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const payload = {
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
      }

      const loginRes = await axios.post(
        `${API_BASE_URL}/login`,
        payload
      )

      const token = loginRes.data.token
      localStorage.setItem("token", token)

      const profileRes = await axios.get(
        `${API_BASE_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setUser(profileRes.data)
      navigate(location.state?.from?.pathname || "/")
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Invalid username or password"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Container
        fluid
        className="d-flex justify-content-center align-items-center min-vh-100"
      >
        <div className="login-box">
          <div className="login-heading text-center">
            <h3>Welcome back</h3>
            <p>Sign in to manage your orders and checkout securely.</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="username"
                placeholder="Username or Email"
                value={formData.username}
                onChange={handleChange}
                required
                className="login-input"
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
                className="login-input"
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 btn-signin"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>

            <div className="mt-3 text-center">
              <Link to="/register">Create account</Link>
            </div>
            <div className="mt-2 text-center" style={{ fontSize: 13 }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </Form>
        </div>
      </Container>
    </>
  )
}

export default Login
