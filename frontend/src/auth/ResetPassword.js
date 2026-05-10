import { useMemo, useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"
import axios from "axios"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { BASE_URL } from "../config"
import "../CSS/login.css"

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const token = useMemo(() => params.get("token") || "", [params])
  const email = useMemo(() => params.get("email") || "", [params])

  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      const res = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token,
        email,
        newPassword,
      })
      setMessage(res.data?.message || "Password reset successfully.")
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-box">
        <div className="d-flex justify-content-center mb-3">
          <DotLottieReact
            src="https://lottie.host/5d8c66ff-9f53-4b3f-9b4c-3a26e0b6f9b7/U9G0lYBf3s.lottie"
            loop
            autoplay
            style={{ width: 160, height: 160 }}
          />
        </div>
        <h3 className="mb-2 text-center">Reset password</h3>

        {!token || !email ? (
          <Alert variant="warning">
            Reset link is missing token/email. Please request a new reset link.
          </Alert>
        ) : null}

        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <Form onSubmit={submit}>
          <Form.Group className="mb-2">
            <Form.Label style={{ fontSize: 13 }} className="text-muted">
              Email
            </Form.Label>
            <Form.Control type="email" value={email} disabled />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: 13 }} className="text-muted">
              New password
            </Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              required
              disabled={!token || !email}
            />
          </Form.Group>

          <Button className="w-100" type="submit" disabled={loading || !token || !email}>
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </Container>
  )
}

