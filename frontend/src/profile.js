import { useState, useEffect } from "react"
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./CSS/profile.css"

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    username: "",
    avatar: "",
    address: "",
    phone: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
    axios
      .get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch(() => navigate("/login"))
  }, [navigate])

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
        res = await axios.put("http://localhost:5000/profile", formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
      } else {
        res = await axios.put(
          "http://localhost:5000/profile",
          {
            name: profile.name,
            address: profile.address,
            phone: profile.phone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      setProfile(res.data)
      setMessage("Profile updated successfully!")
      setEditMode(false)
      setAvatarFile(null)
      setAvatarPreview("")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.")
    }
  }

  return (
    <div className="profile-bg">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={9} lg={7}>
            <Card className="shadow profile-glass-card">
              <Card.Body>
                <div className="profile-header">
                  <div className="profile-header-left">
                    <img
                      src={
                        avatarPreview ||
                        (profile.avatar
                          ? profile.avatar.startsWith("/uploads/")
                            ? `http://localhost:5000${profile.avatar}`
                            : profile.avatar
                          : "/placeholder.svg")
                      }
                      alt="avatar"
                      className="profile-avatar-img-xl"
                      title={editMode ? "You can change your avatar" : ""}
                    />
                    <div className="profile-header-info">
                      <div className="profile-header-name">{profile.name}</div>
                      <div className="profile-header-username">@{profile.username}</div>
                    </div>
                  </div>
                  <div>
                    {!editMode && (
                      <Button className="profile-edit-btn" onClick={() => setEditMode(true)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form
                  onSubmit={handleSubmit}
                  className="profile-form-grid"
                  style={{
                    opacity: editMode ? 1 : 0.9,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  <Form.Group>
                    <Form.Label className="profile-label">Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-label">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-label">Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={profile.username}
                      disabled
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-label">Avatar</Form.Label>
                    <Form.Control
                      type="file"
                      name="avatarFile"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      disabled={!editMode}
                    />
                    <Form.Text className="text-muted">Change your avatar image.</Form.Text>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-label">Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="profile-input"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className="profile-label">Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="profile-input"
                    />
                  </Form.Group>
                  {editMode && (
                    <div className="profile-edit-actions">
                      <Button className="profile-btn-primary" type="submit">
                        Save
                      </Button>
                      <Button className="profile-btn-secondary" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Profile
