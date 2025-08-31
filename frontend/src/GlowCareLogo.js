import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import React from "react"
import "./CSS/GlowCareLogo.css"

const GlowCareLogo = ({ className }) => (
  <div className={`glowcare-logo ${className || ""}`}>
    <div className="lottie-wrapper" aria-hidden="true">
      <DotLottieReact
        src="https://lottie.host/2e2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/leaf.json"
        loop
        autoplay
        className="lottie-logo"
      />
    </div>
    <div className="logo-text">
      <span className="glow-text">Glow</span>
      <span className="care-text">Care</span>
    </div>
  </div>
)

export default GlowCareLogo
