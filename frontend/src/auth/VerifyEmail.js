import { useEffect, useMemo, useState } from "react"
import { Container, Alert, Button } from "react-bootstrap"
import axios from "axios"
import { Link, useSearchParams } from "react-router-dom"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { BASE_URL } from "../config"
import "../CSS/login.css"

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = useMemo(() => params.get("token") || "", [params])
  const email = useMemo(() => params.get("email") || "", [params])

  const [loading, setLoading] = useState(true)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      setMessage("")
      try {
        const res = await axios.get(`${BASE_URL}/auth/verify-email`, { params: { token, email } })
        setOk(true)
        setMessage(res.data?.message || "Email verified successfully.")
      } catch (err) {
        setOk(false)
        setError(err.response?.data?.error || "Verification failed.")
      } finally {
        setLoading(false)
      }
    }
    if (!token || !email) {
      setOk(false)
      setError("Verification link is missing token/email.")
      setLoading(false)
      return
    }
    run()
  }, [token, email])

  return (
    <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="login-box">
        <div className="d-flex justify-content-center mb-3">
          <DotLottieReact
            src="https://lottie.host/3d9a2a6d-3a0c-4c64-bd5c-8f5b34b1fb1a/9GZcYjYt2o.lottie"
            loop
            autoplay
            style={{ width: 160, height: 160 }}
          />
        </div>
        <h3 className="mb-2 text-center">Verify email</h3>

        {loading ? <Alert variant="info">Verifying...</Alert> : null}
        {!loading && ok ? <Alert variant="success">{message}</Alert> : null}
        {!loading && !ok ? <Alert variant="danger">{error}</Alert> : null}

        <div className="d-flex gap-2 justify-content-center mt-3">
          <Button as={Link} to="/login" variant="primary">
            Go to login
          </Button>
          <Button as={Link} to="/register" variant="outline-secondary">
            Create account
          </Button>
        </div>
      </div>
    </Container>
  )
}

