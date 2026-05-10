import { useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"
import axios from "axios"
import { Link } from "react-router-dom"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { BASE_URL } from "../config"
import "../CSS/login.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}/auth/forgot-password`, { email })
      setMessage(res.data?.message || "If the email exists, a reset link has been sent.")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to request password reset.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-box">
        <div className="d-flex justify-content-center mb-3">
          <DotLottieReact
            src="https://lottie.host/cc6ce3bd-2f68-4fc1-8c4b-3d1f662b5d7b/0oAq0Hf3Bz.lottie"
            loop
            autoplay
            style={{ width: 160, height: 160 }}
          />
        </div>
        <h3 className="mb-2 text-center">Forgot password</h3>
        <p className="text-muted text-center" style={{ fontSize: 13 }}>
          We will email you a reset link.
        </p>

        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Button className="w-100" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </Container>
  )
}

