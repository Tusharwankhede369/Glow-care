import { useState } from "react"
import { Alert, Button, Container, Form } from "react-bootstrap"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { BASE_URL } from "../config"
import "../CSS/login.css"

export default function VerifyEmailOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email || "")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const verify = async (event) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/verify-email-otp`, { email, otp })
      setMessage(data.message)
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      setError(err.response?.data?.error || "We could not verify that code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/resend-email-otp`, { email })
      setMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send a new code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <Container fluid className="d-flex justify-content-center align-items-center min-vh-100 px-3">
        <div className="login-box">
          <div className="login-heading text-center">
            <span className="auth-eyebrow">GlowCare security</span>
            <h3>Verify your email</h3>
            <p>Enter the six-digit code sent to your email. It expires in 10 minutes.</p>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={verify}>
            <Form.Group className="mb-3" controlId="verificationEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="login-input" />
            </Form.Group>
            <Form.Group className="mb-4" controlId="verificationOtp">
              <Form.Label>Verification code</Form.Label>
              <Form.Control type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required className="login-input otp-input" />
            </Form.Group>
            <Button type="submit" className="w-100 btn-signin" disabled={loading}>{loading ? "Verifying..." : "Verify email"}</Button>
          </Form>
          <div className="text-center mt-3">
            <Button variant="link" className="p-0" onClick={resend} disabled={loading || !email}>Send a new code</Button>
            <span className="mx-2 text-muted">·</span><Link to="/login">Back to login</Link>
          </div>
        </div>
      </Container>
    </main>
  )
}
