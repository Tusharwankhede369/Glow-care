import { useState } from "react"
import { Container, Form, Button, Alert } from "react-bootstrap"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import "./CSS/login.css"
import { BASE_URL } from "./config"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const API_BASE_URL = BASE_URL

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpEmail, setOtpEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (otpStep) {
        const verifyRes = await axios.post(`${API_BASE_URL}/auth/verify-login-otp`, { email: otpEmail, otp })
        localStorage.setItem("token", verifyRes.data.token)
        const profileRes = await axios.get(`${API_BASE_URL}/profile`, { headers: { Authorization: `Bearer ${verifyRes.data.token}` } })
        setUser(profileRes.data)
        navigate(location.state?.from?.pathname || "/")
        return
      }

      const payload = {
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
      }

      const loginRes = await axios.post(
        `${API_BASE_URL}/login`,
        payload
      )

      if (loginRes.data.requiresOtp) {
        setOtpEmail(loginRes.data.email)
        setOtpStep(true)
        return
      }

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

  const resendOtp = async () => {
    setError("")
    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/auth/resend-login-otp`, { email: otpEmail })
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send a new code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <Container fluid className="login-stage">
        <div className="login-box">
          <section className="login-form-panel">
            <span className="login-brand">GLOWCARE</span>
            <div className="login-heading">
              <p className="login-kicker">Your everyday care, considered.</p>
              <h1>{otpStep ? "Verify your sign in" : "Welcome back"}</h1>
              <p>{otpStep ? `Enter the code sent to ${otpEmail}.` : "Sign in to continue your GlowCare routine."}</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              {!otpStep ? <>
              <Form.Group className="login-field" controlId="loginIdentity">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="you@example.com"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="login-input"
                />
              </Form.Group>

              <Form.Group className="login-field" controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <div className="gc-password-field"><Form.Control type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required autoComplete="current-password" className="login-input" /><button type="button" className="gc-password-toggle" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div>
              </Form.Group>
              <div className="login-options">
                <label><input type="checkbox" /> <span>Remember me</span></label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              </> : <Form.Group className="login-field" controlId="loginOtp">
                <Form.Label>Six-digit sign-in code</Form.Label>
                <Form.Control type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required className="login-input otp-input" />
              </Form.Group>}

              <Button type="submit" className="w-100 btn-signin" disabled={loading}>
                {loading ? "Please wait..." : otpStep ? "Verify and sign in" : "Log in"}
              </Button>

              {!otpStep ? <div className="login-create">New to GlowCare? <Link to="/register">Create an account</Link></div> : <div className="login-create"><Button variant="link" onClick={resendOtp} disabled={loading}>Send a new code</Button></div>}
            </Form>
          </section>
          <aside className="login-visual" aria-label="GlowCare lifestyle image">
            <div className="login-visual__copy"><span>GLOWCARE</span><strong>Make space<br />for care.</strong></div>
          </aside>
        </div>
      </Container>
    </main>
  )
}

export default Login
