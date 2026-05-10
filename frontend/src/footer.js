import { useState } from "react"
import { Link } from "react-router-dom"
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaLock,
} from "react-icons/fa"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import GlowCareLogo from "./GlowCareLogo"
import "./CSS/footer.css"

const CONTACT_LOTTIE_SRC =
  "https://lottie.host/1035f7ef-a131-4a7c-b320-636ec9e1e316/PvWGJQmbFV.lottie"

function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [agree, setAgree] = useState(false)

  const onSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    // Hook to your API later
    setEmail("")
  }

  return (
    <footer className="gc-footer">
      {/* —— Newsletter (top band, warm gradient like reference) —— */}
      <section className="gc-footer-newsletter">
        <div className="gc-footer-newsletter__inner">
          <div className="gc-footer-newsletter__copy">
            <h2 className="gc-footer-newsletter__title">Subscribe to our newsletter</h2>
            <p className="gc-footer-newsletter__text">
              Get offers, new arrivals, and body-care tips. Unsubscribe anytime — we respect your inbox.
            </p>
            <form className="gc-footer-newsletter__form" onSubmit={onSubscribe}>
              <div className="gc-footer-newsletter__row">
                <input
                  type="email"
                  className="gc-footer-newsletter__input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email for newsletter"
                />
                <button type="submit" className="gc-footer-newsletter__btn">
                  Subscribe
                </button>
              </div>
              <label className="gc-footer-newsletter__consent">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  I agree to the processing of my data per the{" "}
                  <a href="/privacy-policy">Privacy Policy</a>.
                </span>
              </label>
            </form>
          </div>
          <div className="gc-footer-newsletter__visual" aria-hidden="true">
            <div className="gc-footer-newsletter__logo">
              <GlowCareLogo className="gc-footer-newsletter__glow-logo" />
            </div>
            <div className="gc-footer-newsletter__lottie">
              <DotLottieReact
                src={CONTACT_LOTTIE_SRC}
                loop
                autoplay
                className="gc-footer-dotlottie"
              />
            </div>
          </div>
        </div>
      </section>

      {/* —— Main link grid (cream panel) —— */}
      <section className="gc-footer-main">
        <div className="gc-footer-main__inner">
          <div className="gc-footer-columns">
            <div className="gc-footer-col">
              <h3 className="gc-footer-col__title">Shop</h3>
              <ul className="gc-footer-col__list">
                <li>
                  <Link to="/shop">All products</Link>
                </li>
                <li>
                  <Link to="/shop">Skin care</Link>
                </li>
                <li>
                  <Link to="/shop">Hair &amp; body</Link>
                </li>
                <li>
                  <Link to="/shop">Bath &amp; wellness</Link>
                </li>
              </ul>
            </div>
            <div className="gc-footer-col">
              <h3 className="gc-footer-col__title">Company</h3>
              <ul className="gc-footer-col__list">
                <li>
                  <Link to="/about">About us</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
                <li>
                  <Link to="/blog">Beauty tips</Link>
                </li>
                <li>
                  <a href="/careers">Careers</a>
                </li>
              </ul>
            </div>
            <div className="gc-footer-col">
              <h3 className="gc-footer-col__title">Orders</h3>
              <ul className="gc-footer-col__list">
                <li>
                  <Link to="/cart">Your cart</Link>
                </li>
                <li>
                  <Link to="/profile">Account</Link>
                </li>
                <li>
                  <a href="/shipping-policy">Shipping</a>
                </li>
                <li>
                  <a href="/return-policy">Returns</a>
                </li>
              </ul>
            </div>
            <div className="gc-footer-col">
              <h3 className="gc-footer-col__title">Policies</h3>
              <ul className="gc-footer-col__list">
                <li>
                  <a href="/support">Help center</a>
                </li>
                <li>
                  <a href="/privacy-policy">Privacy</a>
                </li>
                <li>
                  <a href="/terms">Terms of service</a>
                </li>
                <li>
                  <a href="/terms">Secure shopping</a>
                </li>
              </ul>
            </div>
            <div className="gc-footer-col">
              <h3 className="gc-footer-col__title">Account</h3>
              <ul className="gc-footer-col__list">
                <li>
                  <Link to="/register">Create account</Link>
                </li>
                <li>
                  <Link to="/login">Sign in</Link>
                </li>
                <li>
                  <Link to="/contact">Support</Link>
                </li>
                <li>
                  <Link to="/profile">Profile</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* —— Bottom bar (dark green + gold line) —— */}
      <section className="gc-footer-bar">
        <div className="gc-footer-bar__inner">
          <p className="gc-footer-bar__copy">
            Copyright © {year}{" "}
            <Link to="/">Glow Care</Link>. All rights reserved.
          </p>
          <nav className="gc-footer-bar__social" aria-label="Social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </nav>
          <div className="gc-footer-bar__payments">
            <span className="gc-footer-pay">Mastercard</span>
            <span className="gc-footer-pay">Visa</span>
            <span className="gc-footer-ssl">
              <FaLock aria-hidden />
              256-bit SSL
            </span>
          </div>
        </div>
      </section>
    </footer>
  )
}

export default Footer
