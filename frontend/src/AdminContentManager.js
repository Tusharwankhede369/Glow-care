import { useEffect, useState } from "react"
import { Button, Container, Form, Alert, Table } from "react-bootstrap"
import { Link } from "react-router-dom"
import axios from "axios"
import { BASE_URL } from "./config"
import { resolveMediaUrl } from "./utils/media"
import "./CSS/admin-content.css"

const initial = { kind: "banner", key: "", title: "", caption: "", link: "", order: 0, active: true, image: null }
const labels = { banner: "Homepage banners", category: "Shop by Category tiles", image: "Homepage content images" }

export default function AdminContentManager() {
  const [kind, setKind] = useState("banner")
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initial)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setItems((await axios.get(`${BASE_URL}/admin/home-content?kind=${kind}`)).data) }
    catch { setError("Could not load homepage content.") }
  }
  useEffect(() => { setForm({ ...initial, kind }); setEditing(null); load() }, [kind]) // eslint-disable-line react-hooks/exhaustive-deps

  const change = (e) => setForm((old) => ({ ...old, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }))
  const edit = (item) => { setEditing(item); setForm({ ...item, image: null }); window.scrollTo({ top: 0, behavior: "smooth" }) }
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setNotice("")
    try {
      const data = new FormData()
      Object.entries({ ...form, kind }).forEach(([key, value]) => { if (key !== "_id" && key !== "image" && value !== undefined) data.append(key, value) })
      if (form.image instanceof File) data.append("image", form.image)
      if (editing) await axios.put(`${BASE_URL}/admin/home-content/${editing._id}`, data)
      else await axios.post(`${BASE_URL}/admin/home-content`, data)
      setNotice(editing ? "Homepage item updated." : "Homepage item added."); setEditing(null); setForm({ ...initial, kind }); load()
    } catch (err) { setError(err.response?.data?.error || "Could not save homepage content.") }
    finally { setSaving(false) }
  }
  const remove = async (id) => {
    if (!window.confirm("Delete this homepage item?")) return
    try { await axios.delete(`${BASE_URL}/admin/home-content/${id}`); setNotice("Homepage item deleted."); load() }
    catch { setError("Could not delete this item.") }
  }

  return <main className="gc-admin-content"><Container>
    <div className="gc-admin-content__head"><div><p className="gc-admin-content__eyebrow">Content management</p><h1>Homepage assets</h1><p>These sections are independent from product photos.</p></div><Button as={Link} to="/admin/dashboard" variant="outline-secondary">Back to dashboard</Button></div>
    <div className="gc-admin-content__tabs">{Object.entries(labels).map(([value, label]) => <button key={value} type="button" onClick={() => setKind(value)} className={kind === value ? "active" : ""}>{label}</button>)}</div>
    {error && <Alert variant="danger">{error}</Alert>}{notice && <Alert variant="success">{notice}</Alert>}
    <section className="gc-admin-content__panel"><h2>{editing ? `Edit ${labels[kind].slice(0, -1)}` : `Add ${labels[kind].slice(0, -1)}`}</h2><Form onSubmit={submit}>
      {kind === "category" && <Form.Group className="mb-3"><Form.Label>Category key</Form.Label><Form.Control required name="key" value={form.key || ""} onChange={change} placeholder="e.g. skin-care" /><Form.Text>Use the same value as the product category for correct shop navigation.</Form.Text></Form.Group>}
      <Form.Group className="mb-3"><Form.Label>Title</Form.Label><Form.Control name="title" value={form.title || ""} onChange={change} placeholder={kind === "banner" ? "Seasonal essentials" : "Tile title"} /></Form.Group>
      <Form.Group className="mb-3"><Form.Label>Caption</Form.Label><Form.Control name="caption" value={form.caption || ""} onChange={change} /></Form.Group>
      <Form.Group className="mb-3"><Form.Label>Link</Form.Label><Form.Control name="link" value={form.link || ""} onChange={change} placeholder="/shop?category=skin-care" /></Form.Group>
      <Form.Group className="mb-3"><Form.Label>Display order</Form.Label><Form.Control type="number" name="order" value={form.order ?? 0} onChange={change} /></Form.Group>
      <Form.Group className="mb-3"><Form.Label>Image</Form.Label><Form.Control required={!editing} type="file" accept="image/*" onChange={(e) => setForm((old) => ({ ...old, image: e.target.files[0] || null }))} /></Form.Group>
      <Form.Check className="mb-3" name="active" checked={Boolean(form.active)} onChange={change} label="Visible on homepage" />
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add item"}</Button>{editing && <Button className="ms-2" variant="outline-secondary" onClick={() => { setEditing(null); setForm({ ...initial, kind }) }}>Cancel</Button>}
    </Form></section>
    <section className="gc-admin-content__panel"><h2>{labels[kind]}</h2>{items.length === 0 ? <p className="mb-0 text-muted">No items yet.</p> : <Table responsive hover><thead><tr><th>Preview</th><th>Title</th><th>Order</th><th>Visible</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item._id}><td><img className="gc-admin-content__thumb" src={resolveMediaUrl(item.image)} alt="" /></td><td>{item.title || item.key || "Untitled"}<small className="d-block text-muted">{item.link}</small></td><td>{item.order}</td><td>{item.active ? "Yes" : "No"}</td><td><Button size="sm" variant="outline-primary" onClick={() => edit(item)}>Edit</Button><Button size="sm" variant="outline-danger" className="ms-2" onClick={() => remove(item._id)}>Delete</Button></td></tr>)}</tbody></Table>}</section>
  </Container></main>
}
