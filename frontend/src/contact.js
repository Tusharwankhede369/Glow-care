import React from "react"
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap"
import { HiLocationMarker, HiPhone, HiMail } from "react-icons/hi"
import './CSS/contact.css'

const Contact = () => {
  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      
      <Row className="mb-5 text-center">
        <Col md={4}>
          <Card className="contact-card">
            <Card.Body>
              <div className="icon-circle mb-3">
                <HiLocationMarker className="contact-icon" />
              </div>
              <Card.Title className="fw-bold">Our Location</Card.Title>
              <Card.Text>
                123 Main Street, City, Country <br />
                (800) 123 456 789 <br />
                <a href="mailto:info@example.com" style={{ color: '#fa8072', textDecoration: 'none' }}>
                  info@example.com
                </a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="contact-card">
            <Card.Body>
              <div className="icon-circle mb-3">
                <HiPhone className="contact-icon" />
              </div>
              <Card.Title className="fw-bold">Contact us Anytime</Card.Title>
              <Card.Text>
                Mobile: 012 345 678 <br />
                Fax: 123 456 789
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="contact-card">
            <Card.Body>
              <div className="icon-circle mb-3">
                <HiMail className="contact-icon" />
              </div>
              <Card.Title className="fw-bold">Support</Card.Title>
              <Card.Text>
                <a href="mailto:Support24/7@example.com" style={{ color: '#fa8072', textDecoration: 'none' }}>
                  Support24/7@example.com
                </a> <br />
                <a href="mailto:info@example.com" style={{ color: '#fa8072', textDecoration: 'none' }}>
                  info@example.com
                </a>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h5 className="fw-bold">GET IN TOUCH</h5>

      <Form>
        <Row className="mb-3">
          <Col md={6} className="mb-3 mb-md-0">
            <Form.Control type="text" placeholder="Name" className="custom-input" />
          </Col>
          <Col md={6}>
            <Form.Control type="email" placeholder="Email" className="custom-input" />
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Control type="text" placeholder="Subject" className="custom-input" />
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Control as="textarea" rows={5} placeholder="Message" className="custom-input" />
        </Form.Group>
        <div className="d-flex justify-content-center">
          <Button className="btn-custom" type="submit">Send a Message</Button>
        </div>
      </Form>
    </Container>
  )
}

export default Contact
