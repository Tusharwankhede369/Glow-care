import { useEffect, useState } from "react"
import { Alert, Button, Col, Container, Modal, Row, Spinner } from "react-bootstrap"
import { FaArrowLeft, FaHeart, FaLeaf, FaMinus, FaPlus, FaShieldAlt, FaShoppingBag, FaStar, FaTruck } from "react-icons/fa"
import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import "./CSS/product.css"
import { BASE_URL } from "./config"
import { formatUSD } from "./utils/format"
import { resolveMediaUrl } from "./utils/media"

const CART_LOTTIE = "https://lottie.host/905b1c83-dcab-409c-beff-251d04ce4685/ARmngN7JEZ.lottie"
const CARE_LOTTIE = "https://lottie.host/514afd75-f57b-4a77-836b-1f9a330d9873/8OIKIkXcWj.lottie"

function ProductCard({ item, onAdd }) {
  return <article className="pd-recommendation-card">
    <Link to={`/product/${item._id}`} className="pd-recommendation-image">
      <img src={resolveMediaUrl(item.image)} alt={item.name} onError={(event) => { event.currentTarget.src = "/placeholder.svg" }} />
    </Link>
    <div className="pd-recommendation-body">
      <span>{item.brand || item.category}</span>
      <Link to={`/product/${item._id}`}>{item.name}</Link>
      <strong>{formatUSD(item.price)}</strong>
      <button type="button" onClick={() => onAdd(item)}>Quick add</button>
    </div>
  </article>
}

export default function Product({ cart, setCart }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState(null)
  const inStock = product && product.availability !== "Out of Stock" && product.stock !== 0

  useEffect(() => {
    let active = true
    async function loadProduct() {
      setLoading(true)
      setError("")
      try {
        const { data } = await axios.get(`${BASE_URL}/products/${id}`)
        if (!active) return
        setProduct(data)
        setQuantity(1)
        const related = await axios.get(`${BASE_URL}/products?${data.category ? `category=${encodeURIComponent(data.category)}&` : ""}limit=5`)
        if (active) setRecommendations((related.data.products || []).filter((item) => item._id !== data._id).slice(0, 4))
      } catch {
        if (active) setError("We couldn't load this product. Please try again.")
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProduct()
    return () => { active = false }
  }, [id])

  const addItem = (item, amount = 1, openModal = true) => {
    setCart((current) => ({ ...current, [item._id]: (current[item._id] || 0) + amount }))
    setAddedProduct({ ...item, quantity: amount })
    if (openModal) setShowCartModal(true)
  }

  const buyNow = () => {
    addItem(product, quantity, false)
    navigate("/cart")
  }

  if (loading) return <main className="product-page"><Container className="pd-state"><Spinner animation="border" /><p>Preparing your product details…</p></Container></main>
  if (error || !product) return <main className="product-page"><Container className="pd-state"><Alert variant="danger">{error || "Product not found."}</Alert><Button onClick={() => navigate("/shop")}>Back to shop</Button></Container></main>

  const savings = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0
  const details = [["Category", product.category], ["Brand", product.brand], ["For", product.gender], ["Size", product.size], ["Skin type", product.skinType], ["Hair type", product.hairType]].filter(([, value]) => value)

  return <main className="product-page">
    <Container>
      <Link to="/shop" className="pd-back"><FaArrowLeft /> Continue shopping</Link>
      <section className="pd-hero">
        <Row className="g-0 align-items-stretch">
          <Col lg={6} className="pd-gallery-col">
            <div className="pd-gallery">
              {product.discount > 0 && <span className="pd-sale">Save {product.discount}%</span>}
              <img className="pd-main-image" src={resolveMediaUrl(product.primaryImage || product.image || product.images?.[0])} alt={product.name} onError={(event) => { event.currentTarget.src = "/placeholder.svg" }} />
            </div>
          </Col>
          <Col lg={6} className="pd-info-col">
            <div className="pd-info">
              <div className="pd-kicker"><span>{product.brand || "GlowCare"}</span><button type="button" className={wishlisted ? "is-active" : ""} onClick={() => setWishlisted(!wishlisted)} aria-label="Save product"><FaHeart /></button></div>
              <h1>{product.name}</h1>
              <div className="pd-rating"><FaStar /> <strong>{Number(product.rating || 0).toFixed(1)}</strong><span>({product.numReviews || 0} reviews)</span></div>
              <div className="pd-price-row"><strong>{formatUSD(product.price)}</strong>{product.originalPrice && <del>{formatUSD(product.originalPrice)}</del>}{savings > 0 && <span>Save {formatUSD(savings)}</span>}</div>
              <p className="pd-summary">{product.description || "A thoughtfully selected GlowCare essential, made for your everyday routine."}</p>
              <div className="pd-tags">
                {product.isNatural && <span><FaLeaf /> Natural</span>}
                {product.isVegan && <span><FaLeaf /> Vegan</span>}
                {product.isCrueltyFree && <span><FaShieldAlt /> Cruelty-free</span>}
              </div>
              <div className="pd-stock"><i className={inStock ? "available" : "unavailable"} /> {inStock ? `${product.stock || "Limited"} in stock — ready to ship` : "Currently unavailable"}</div>
              <div className="pd-purchase-row">
                <div className="pd-quantity" aria-label="Quantity selector"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><FaMinus /></button><output>{quantity}</output><button type="button" onClick={() => setQuantity((value) => Math.min(product.stock || 99, value + 1))}><FaPlus /></button></div>
                <button type="button" className="pd-add-button" onClick={() => addItem(product, quantity)} disabled={!inStock}><FaShoppingBag /> Add to bag</button>
              </div>
              <button type="button" className="pd-buy-button" onClick={buyNow} disabled={!inStock}>Buy now · {formatUSD(product.price * quantity)}</button>
            </div>
          </Col>
        </Row>
      </section>

      <section className="pd-benefits">
        <div className="pd-benefit-animation"><DotLottieReact src={CARE_LOTTIE} loop autoplay /></div>
        <div><FaTruck /><h2>Fast, careful delivery</h2><p>Free shipping on qualifying orders over $999.</p></div>
        <div><FaShieldAlt /><h2>Shop with confidence</h2><p>Secure checkout and clear product information.</p></div>
        <div><FaLeaf /><h2>Conscious choices</h2><p>Formula claims are highlighted for easy comparison.</p></div>
      </section>

      <Row className="g-4 pd-details-row">
        <Col lg={7}><section className="pd-panel"><p className="pd-overline">About this product</p><h2>Made to fit your routine</h2><p className="pd-description">{product.description || "Explore this GlowCare favourite and add it to your personalised routine."}</p></section></Col>
        <Col lg={5}><section className="pd-panel"><p className="pd-overline">Product specifications</p><dl className="pd-specs">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section></Col>
      </Row>

      {recommendations.length > 0 && <section className="pd-recommendations"><div><p className="pd-overline">Complete your routine</p><h2>You may also like</h2></div><div className="pd-recommendation-grid">{recommendations.map((item) => <ProductCard key={item._id} item={item} onAdd={(related) => addItem(related)} />)}</div></section>}

      <Modal show={showCartModal} onHide={() => setShowCartModal(false)} centered contentClassName="pd-cart-modal">
        <Modal.Body>{addedProduct && <div className="pd-cart-success"><DotLottieReact src={CART_LOTTIE} loop autoplay /><div><p className="pd-overline">Added to your bag</p><h2>{addedProduct.name}</h2><p>{addedProduct.quantity} {addedProduct.quantity === 1 ? "item" : "items"} · {formatUSD(addedProduct.price * addedProduct.quantity)}</p></div></div>}<div className="pd-modal-actions"><Button variant="outline-secondary" onClick={() => setShowCartModal(false)}>Keep shopping</Button><Button onClick={() => navigate("/cart")}>View bag</Button></div></Modal.Body>
      </Modal>
    </Container>
  </main>
}
