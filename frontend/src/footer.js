import { Container, Row, Col } from "react-bootstrap"
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa"
import GlowCareLogo from "./GlowCareLogo" // Adjust path as necessary
import "./CSS/footer.css"

const Footer = () => {
  return (
    <footer className="site-footer">
      <Container>
        <Row>
          {/* Branding and Social */}
          <Col lg={3} md={6} sm={12}>
            <section className="footer-brand">
              <figure className="footer-logo">
                <GlowCareLogo className="lottie-footer-logo" />
              </figure>
              <p className="footer-description">
                Glow Care is your premium destination for body care and personal
                care products. From hair care to skin care, we offer natural and
                effective solutions for your daily beauty routine.
              </p>
              <nav className="social-nav" aria-label="Social media links">
                <ul className="social-links">
                  {[{ icon: FaFacebookF, url: "/facebook", label: "Facebook" },
                    { icon: FaTwitter, url: "/twitter", label: "Twitter" },
                    { icon: FaLinkedinIn, url: "/linkedin", label: "LinkedIn" },
                    { icon: FaYoutube, url: "/youtube", label: "YouTube" },
                    { icon: FaInstagram, url: "/instagram", label: "Instagram" }].map(({ icon: Icon, url, label }) => (
                      <li key={label}>
                        <a href={url} className="social-link" aria-label={label}>
                          <Icon />
                        </a>
                      </li>
                    ))}
                </ul>
              </nav>
            </section>
          </Col>

          {/* Information */}
          <Col lg={2} md={6} sm={12}>
            <section className="footer-links">
              <h3 className="footer-title">Information</h3>
              <nav className="footer-nav">
                <ul className="footer-menu">
                  <li><a href="/">About Us</a></li>
                  <li><a href="/contact">Contact Us</a></li>
                  <li><a href="/shop">Our Products</a></li>
                  <li><a href="/">Why Choose Us</a></li>
                  <li><a href="/careers">Careers</a></li>
                </ul>
              </nav>
            </section>
          </Col>

          {/* Quicklink */}
          <Col lg={2} md={6} sm={12}>
            <section className="footer-links">
              <h3 className="footer-title">Quicklink</h3>
              <nav className="footer-nav">
                <ul className="footer-menu">
                  <li><a href="/about">About</a></li>
                  <li><a href="/blog">Beauty Tips</a></li>
                  <li><a href="/shop">Shop</a></li>
                  <li><a href="/cart">Cart</a></li>
                  <li><a href="/contact">Contact</a></li>
                </ul>
              </nav>
            </section>
          </Col>

          {/* Support */}
          <Col lg={2} md={6} sm={12}>
            <section className="footer-links">
              <h3 className="footer-title">Support</h3>
              <nav className="footer-nav">
                <ul className="footer-menu">
                  <li><a href="/support">Customer Support</a></li>
                  <li><a href="/shipping-policy">Shipping Policy</a></li>
                  <li><a href="/return-policy">Return Policy</a></li>
                  <li><a href="/privacy-policy">Privacy Policy</a></li>
                  <li><a href="/terms">Terms of Service</a></li>
                </ul>
              </nav>
            </section>
          </Col>

          {/* Store Information */}
          <Col lg={3} md={6} sm={12}>
            <section className="footer-contact">
              <h3 className="footer-title">Store Information</h3>
              <address className="footer-address">
                <p>123 Beauty Lane, Glow Street, Beauty City, BC 12345</p>
                <p><span>Phone:</span> 01254 698 785, 36598 254 987</p>
                <p>
                  <span>Email:</span>{" "}
                  <a href="mailto:hello@glowcare.com" className="footer-email">
                    hello@glowcare.com
                  </a>
                </p>
              </address>
            </section>
          </Col>
        </Row>
      </Container>

      <section className="footer-bottom">
        <Container>
          <p className="copyright">
            Copyright © {new Date().getFullYear()}{" "}
            <a href="/">Glow Care</a> | Premium Body Care Products for Everyone.
          </p>
        </Container>
      </section>
    </footer>
  )
}

export default Footer
