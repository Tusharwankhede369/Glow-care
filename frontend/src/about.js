"use client"

import { useState } from "react"
import "./CSS/about.css"

export default function About() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <main className="about">
      {/* Hero */}
      <section className="about__hero" aria-labelledby="about-hero-title">
        <div className="about__hero-inner">
          <h1 id="about-hero-title" className="about__title text-balance fade-in">
            Body care that loves your skin—and the planet
          </h1>
          <p className="about__subtitle text-pretty fade-in delay-1">
            Glow Care crafts everyday body essentials with gentle, effective ingredients. Clean. Cruelty-free.
            Dermatologist tested.
          </p>
          <div className="about__cta fade-in delay-2">
            <a href="/products" className="about__button animated-button">
              Shop Body Care
            </a>
            <button
              type="button"
              className="about__link animated-link"
              onClick={() => setShowInfo((v) => !v)}
              aria-expanded={showInfo}
              aria-controls="about-icons-row"
            >
              Our Story
            </button>
          </div>

          {showInfo && (
            <div id="about-icons-row" className="about__icons fade-in delay-3" role="group" aria-label="Quick info">
              <a href="#location" className="about__icon-btn animated-icon-btn" aria-label="Location">
                <svg className="about__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M12 22s7-6.58 7-12a7 7 0 1 0-14 0c0 5.42 7 12 7 12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <span>Location</span>
              </a>
              <a href="/contact" className="about__icon-btn animated-icon-btn" aria-label="Contact">
                <svg className="about__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M22 16.92V19a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.12.86.33 1.7.63 2.5a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.37 6.37l1.27-1.27a2 2 0 0 1 2.11-.45c.8.3 1.64.51 2.5.63A2 2 0 0 1 22 16.92Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Contact</span>
              </a>
              <a href="/support" className="about__icon-btn animated-icon-btn" aria-label="Support">
                <svg className="about__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M18 19a3 3 0 0 1-3 3h-2l-2 0a3 3 0 0 1-3-3v-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 15v-3a6 6 0 0 1 12 0v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Support</span>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Three pillars */}
      <section className="about__pillars" aria-label="Glow Care pillars">
        <div className="about__grid">
          <article className="about__card fade-in delay-4">
            <h2 className="about__card-title">Our Promise</h2>
            <ul className="about__list">
              <li>Clean, transparent formulas</li>
              <li>Cruelty-free and vegan-friendly</li>
              <li>Dermatologist tested for sensitive skin</li>
            </ul>
          </article>

          <article className="about__card fade-in delay-5">
            <h2 className="about__card-title">Thoughtful Ingredients</h2>
            <ul className="about__list">
              <li>Shea butter for moisture</li>
              <li>Aloe vera for soothing hydration</li>
              <li>Vitamin E to support skin barrier</li>
            </ul>
          </article>

          <article className="about__card fade-in delay-6">
            <h2 className="about__card-title">Sustainable by Design</h2>
            <ul className="about__list">
              <li>Recyclable packaging</li>
              <li>Responsible suppliers</li>
              <li>Small-batch production to reduce waste</li>
            </ul>
          </article>
        </div>
      </section>

      {/* Founder note */}
      <section className="about__founder" aria-labelledby="founder-note-title">
        <div className="about__founder-inner fade-in delay-7">
          <h2 id="founder-note-title" className="about__section-title">
            Why Glow Care?
          </h2>
          <p className="about__founder-text text-pretty">
            We started Glow Care to make body care simpler and safer. No harsh additives, only what your skin
            needs—thoughtfully made, honestly priced.
          </p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="about__newsletter" aria-labelledby="newsletter-title">
        <div className="about__newsletter-inner fade-in delay-8">
          <h2 id="newsletter-title" className="about__section-title">
            Join the Glow List
          </h2>
          <p className="about__newsletter-text">Get product updates, simple skin tips, and early access to launches.</p>
          {submitted ? (
            <p className="about__success" role="status">
              Thanks! You’re subscribed with {email}.
            </p>
          ) : (
            <form className="about__form" onSubmit={handleSubmit}>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="about__input animated-input"
                aria-label="Email address"
              />
              <button type="submit" className="about__button animated-button">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="about__footer fade-in delay-9">
        <p className="about__footer-copy">© {new Date().getFullYear()} Glow Care. All rights reserved.</p>
      </footer>
    </main>
  )
}
