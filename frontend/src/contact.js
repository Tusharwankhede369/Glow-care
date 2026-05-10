import React, { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap"
import { HiLocationMarker, HiPhone, HiMail, HiClock } from "react-icons/hi"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { Link } from "react-router-dom"
import "./CSS/contact.css"

const CONTACT_LOTTIE =
  "https://lottie.host/1035f7ef-a131-4a7c-b320-636ec9e1e316/PvWGJQmbFV.lottie"

const Contact = () => {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" })

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    setSent(true)
    setForm({ name: "", email: "", subject: "", message: "" })
    setTimeout(() => setSent(false), 6000)
  }

  return (
    <main className="gc-contact-page">
      <Container>
        <Row className="justify-content-center text-center mb-5">
          <Col lg={10}>
            <div className="gc-contact-lottie-wrap mx-auto mb-3" aria-hidden="true">
              <DotLottieReact src={CONTACT_LOTTIE} loop autoplay style={{ width: 140, height: 140 }} />
            </div>
            <h1 className="gc-contact-title">We’re here for you</h1>
            <p className="gc-contact-lead text-muted mx-auto">
              Glow Care serves customers across the United States with responsive support, transparent shipping
              estimates at checkout, and product guidance from our care team.
            </p>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          <Col md={6} lg={3}>
            <Card className="gc-contact-card h-100">
              <Card.Body>
                <div className="gc-contact-icon-wrap">
                  <HiLocationMarker className="gc-contact-icon" aria-hidden />
                </div>
                <Card.Title as="h2" className="gc-contact-card-title">
                  Headquarters
                </Card.Title>
                <Card.Text className="gc-contact-card-text mb-0">
                  Glow Care Inc.
                  <br />
                  1200 Commerce Drive, Suite 400
                  <br />
                  Austin, TX 78701
                  <br />
                  United States
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="gc-contact-card h-100">
              <Card.Body>
                <div className="gc-contact-icon-wrap">
                  <HiPhone className="gc-contact-icon" aria-hidden />
                </div>
                <Card.Title as="h2" className="gc-contact-card-title">
                  Phone
                </Card.Title>
                <Card.Text className="gc-contact-card-text">
                  <a href="tel:+18885550199" className="gc-contact-link">
                    +1 (888) 555-0199
                  </a>
                  <br />
                  <span className="text-muted small">Order & product questions</span>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="gc-contact-card h-100">
              <Card.Body>
                <div className="gc-contact-icon-wrap">
                  <HiMail className="gc-contact-icon" aria-hidden />
                </div>
                <Card.Title as="h2" className="gc-contact-card-title">
                  Email
                </Card.Title>
                <Card.Text className="gc-contact-card-text">
                  <a href="mailto:care@glowcare.com" className="gc-contact-link">
                    care@glowcare.com
                  </a>
                  <br />
                  <a href="mailto:orders@glowcare.com" className="gc-contact-link">
                    orders@glowcare.com
                  </a>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="gc-contact-card h-100">
              <Card.Body>
                <div className="gc-contact-icon-wrap">
                  <HiClock className="gc-contact-icon" aria-hidden />
                </div>
                <Card.Title as="h2" className="gc-contact-card-title">
                  Hours
                </Card.Title>
                <Card.Text className="gc-contact-card-text mb-0">
                  Monday–Saturday
                  <br />
                  9:00 a.m. – 8:00 p.m. CT
                  <br />
                  <span className="text-muted small">Typical reply within one business day</span>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 align-items-start pb-5">
          <Col lg={7}>
            <Card className="gc-contact-form-card">
              <Card.Body className="p-4 p-md-5">
                <h2 className="h4 mb-2">Send a message</h2>
                <p className="text-muted small mb-4">
                  For wholesale or press, mention it in the subject line. This form is a demo front-end; wire it to your
                  API when ready.
                </p>
                {sent && (
                  <Alert variant="success" className="mb-4">
                    Thanks — your message has been recorded. We’ll follow up by email.
                  </Alert>
                )}
                <Form onSubmit={onSubmit}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          name="name"
                          value={form.name}
                          onChange={onChange}
                          required
                          className="gc-contact-input"
                          placeholder="Your name"
                          autoComplete="name"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={onChange}
                          required
                          className="gc-contact-input"
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      className="gc-contact-input"
                      placeholder="Order #, product question, etc."
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      required
                      className="gc-contact-input"
                      placeholder="How can we help?"
                    />
                  </Form.Group>
                  <Button type="submit" className="gc-contact-submit px-4">
                    Send message
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={5}>
            <div className="gc-contact-aside p-4 p-md-5">
              <h2 className="h5 mb-3">Before you write</h2>
              <ul className="gc-contact-list">
                <li>
                  <strong>Orders:</strong> include your order ID (from your{" "}
                  <Link to="/profile" className="gc-contact-inline-link">
                    account
                  </Link>
                  ) for faster service.
                </li>
                <li>
                  <strong>Returns:</strong> unused items in original packaging within 30 days of delivery where
                  applicable.
                </li>
                <li>
                  <strong>Ingredients:</strong> full labels are on each product page and match what ships from our US
                  fulfillment partners.
                </li>
              </ul>
              <p className="small text-muted mb-0">
                Glow Care is a demonstration brand for your storefront; replace addresses and numbers with your live
                operations details.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  )
}

export default Contact
