import { useState, useEffect, useMemo } from "react"
import { Container, Form, Button, Alert, Row, Col, Card, Table, Badge } from "react-bootstrap"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import "./CSS/profile.css"
import { BASE_URL } from "./config"
import { resolveMediaUrl } from "./utils/media"
import { formatUSD } from "./utils/format"

const Profile = ({ cart = {} }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    avatar: "",
    address: "",
    phone: "",
    isEmailVerified: false,
    createdAt: "",
  })
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [profileLoading, setProfileLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const navigate = useNavigate()

  const cartItemCount = useMemo(
    () => Object.values(cart).reduce((sum, q) => sum + (Number(q) || 0), 0),
    [cart]
  )

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
    setProfileLoading(true)
    axios
      .get(`${BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch(() => navigate("/login"))
      .finally(() => setProfileLoading(false))
  }, [navigate])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    setOrdersLoading(true)
    setOrdersError("")
    axios
      .get(`${BASE_URL}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrdersError("Could not load orders."))
      .finally(() => setOrdersLoading(false))
  }, [])

  const memberSince =
    profile.createdAt &&
    new Date(profile.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + (Number(order?.pricing?.total) || 0), 0),
    [orders]
  )

  const lastOrderDate = useMemo(() => {
    if (!orders.length) return ""
    const first = orders[0]
    if (!first?.createdAt) return ""
    return new Date(first.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }, [orders])

  const avatarSrc =
    avatarPreview ||
    (profile.avatar ? resolveMediaUrl(profile.avatar) : "/placeholder.svg")

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0]
    setAvatarFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setAvatarPreview(ev.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setAvatarPreview("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")
    const token = localStorage.getItem("token")
    try {
      let res
      if (avatarFile) {
        const formData = new FormData()
        formData.append("name", profile.name)
        formData.append("address", profile.address)
        formData.append("phone", profile.phone)
        formData.append("avatarFile", avatarFile)
        res = await axios.put(`${BASE_URL}/profile`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        res = await axios.put(
          `${BASE_URL}/profile`,
          {
            name: profile.name,
            address: profile.address,
            phone: profile.phone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      setProfile(res.data)
      setMessage("Profile updated successfully.")
      setEditMode(false)
      setAvatarFile(null)
      setAvatarPreview("")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.")
    }
  }

  if (profileLoading) {
    return (
      <div className="gc-profile-page">
        <Container className="py-5">
          <Card className="gc-profile-card">
            <Card.Body className="py-5 text-center text-muted">Loading your profile dashboard…</Card.Body>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="gc-profile-page">
      <Container className="py-5">
        <header className="gc-profile-hero mb-4">
          <h1 className="gc-profile-title">My account</h1>
          <p className="gc-profile-lead text-muted">
            Manage your profile, shipping details, and review recent Glow Care orders.
          </p>
        </header>

        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="gc-profile-stat-card h-100">
              <Card.Body>
                <div className="gc-profile-stat-label">Bag</div>
                <div className="gc-profile-stat-value">{cartItemCount} items</div>
                <Link to="/cart" className="gc-profile-stat-link">
                  View cart
                </Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="gc-profile-stat-card h-100">
              <Card.Body>
                <div className="gc-profile-stat-label">Orders</div>
                <div className="gc-profile-stat-value">{orders.length}</div>
                <span className="gc-profile-stat-muted">Placed on this account</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="gc-profile-stat-card h-100">
              <Card.Body>
                <div className="gc-profile-stat-label">Member</div>
                <div className="gc-profile-stat-value">{memberSince || "—"}</div>
                <span className="gc-profile-stat-muted">Glow Care customer</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="gc-profile-stat-card h-100">
              <Card.Body>
                <div className="gc-profile-stat-label">Total spent</div>
                <div className="gc-profile-stat-value">{formatUSD(totalSpent)}</div>
                <span className="gc-profile-stat-muted">Across all completed orders</span>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={4}>
            <Card className="gc-profile-stat-card h-100">
              <Card.Body>
                <div className="gc-profile-stat-label">Last order</div>
                <div className="gc-profile-stat-value gc-profile-stat-value--small">{lastOrderDate || "No orders yet"}</div>
                <span className="gc-profile-stat-muted">Most recent checkout date</span>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 align-items-start">
          <Col lg={5}>
            <Card className="gc-profile-card">
              <Card.Body>
                <div className="gc-profile-identity">
                  <img
                    src={avatarSrc}
                    alt=""
                    className="gc-profile-avatar"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div>
                    <h2 className="gc-profile-name h5 mb-1">{profile.name || "Member"}</h2>
                    <p className="text-muted small mb-2">@{profile.username}</p>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      {profile.isEmailVerified ? (
                        <Badge bg="success" className="gc-profile-badge">
                          Email verified
                        </Badge>
                      ) : (
                        <Badge bg="warning" text="dark" className="gc-profile-badge">
                          Email not verified
                        </Badge>
                      )}
                      <Badge bg="light" text="dark" className="gc-profile-badge border">
                        Shopper
                      </Badge>
                    </div>
                  </div>
                </div>
                <dl className="gc-profile-dl mt-4 mb-0">
                  <div>
                    <dt>Email</dt>
                    <dd>{profile.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{profile.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt>Default address</dt>
                    <dd>{profile.address || "—"}</dd>
                  </div>
                </dl>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card className="gc-profile-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Account details</h2>
                  {!editMode && (
                    <Button className="gc-btn-primary" size="sm" onClick={() => setEditMode(true)}>
                      Edit
                    </Button>
                  )}
                </div>
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit} className="gc-profile-form">
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Full name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="gc-profile-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={profile.email} disabled className="gc-profile-input" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" name="username" value={profile.username} disabled className="gc-profile-input" />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="gc-profile-input"
                          placeholder="+1 (555) 000-0000"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Shipping address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="address"
                          value={profile.address}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="gc-profile-input"
                          placeholder="Street, city, state, ZIP"
                        />
                      </Form.Group>
                    </Col>
                    {editMode && (
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Profile photo</Form.Label>
                          <Form.Control type="file" name="avatarFile" accept="image/*" onChange={handleAvatarFileChange} />
                          <Form.Text className="text-muted">JPG or PNG, shown across your account.</Form.Text>
                        </Form.Group>
                      </Col>
                    )}
                  </Row>
                  {editMode && (
                    <div className="gc-profile-actions mt-3">
                      <Button className="gc-btn-primary" type="submit">
                        Save changes
                      </Button>
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => {
                          setEditMode(false)
                          setAvatarPreview("")
                          setAvatarFile(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <section className="mt-5">
          <h2 className="h5 mb-3">Order history</h2>
          <Card className="gc-profile-card gc-profile-orders">
            <Card.Body className="p-0">
              {ordersLoading ? (
                <p className="text-muted p-4 mb-0">Loading orders…</p>
              ) : ordersError ? (
                <p className="text-danger p-4 mb-0">{ordersError}</p>
              ) : orders.length === 0 ? (
                <p className="text-muted p-4 mb-0">
                  No orders yet.{" "}
                  <Link to="/shop" className="gc-inline-link">
                    Browse the shop
                  </Link>
                  .
                </p>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 gc-orders-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="font-monospace small">{String(order._id).slice(-8).toUpperCase()}</td>
                          <td>
                            <Badge bg="light" text="dark" className="border text-capitalize">
                              {order.orderStatus || "placed"}
                            </Badge>
                          </td>
                          <td>{order.items?.length ?? 0}</td>
                          <td className="text-end fw-semibold">{formatUSD(order.pricing?.total ?? 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </section>
      </Container>
    </div>
  )
}

export default Profile
