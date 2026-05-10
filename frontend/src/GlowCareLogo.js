import React from "react"
import "./CSS/GlowCareLogo.css"

const GlowCareLogo = ({ className, compact = false, tone = "default" }) => (
  <div
    className={`glowcare-logo ${compact ? "glowcare-logo--compact" : ""} ${
      tone === "nav" ? "glowcare-logo--nav" : ""
    } ${className || ""}`}
  >
    <div className="glowcare-logo__mark" aria-hidden="true">
      <span className="glowcare-logo__monogram">GC</span>
    </div>
    <div className="glowcare-logo__text" translate="no">
      <span className="glowcare-logo__glow">Glow</span>
      <span className="glowcare-logo__care">Care</span>
    </div>
    <span className="glowcare-logo__spark" aria-hidden="true" />
  </div>
)

export default GlowCareLogo
