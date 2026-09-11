const HomeContent = require("../models/HomeContent")

async function listHomeContent(req, res) {
  const query = req.query.kind ? { kind: req.query.kind, active: true } : { active: true }
  const content = await HomeContent.find(query).sort({ kind: 1, order: 1, createdAt: 1 })
  res.json(content)
}

async function adminListHomeContent(req, res) {
  const query = req.query.kind ? { kind: req.query.kind } : {}
  res.json(await HomeContent.find(query).sort({ kind: 1, order: 1, createdAt: 1 }))
}

function contentPayload(req) {
  const body = req.body || {}
  return {
    kind: body.kind,
    key: body.key || "",
    title: body.title || "",
    caption: body.caption || "",
    link: body.link || "",
    order: Number(body.order || 0),
    active: body.active !== "false" && body.active !== false,
    ...(req.file ? { image: `/uploads/${req.file.filename}` } : body.image ? { image: body.image } : {}),
  }
}

async function createHomeContent(req, res) {
  const payload = contentPayload(req)
  if (!payload.kind || !payload.image) return res.status(400).json({ error: "A content type and image are required." })
  res.status(201).json(await HomeContent.create(payload))
}

async function updateHomeContent(req, res) {
  const content = await HomeContent.findByIdAndUpdate(req.params.id, contentPayload(req), { new: true, runValidators: true })
  if (!content) return res.status(404).json({ error: "Homepage item not found." })
  res.json(content)
}

async function deleteHomeContent(req, res) {
  const content = await HomeContent.findByIdAndDelete(req.params.id)
  if (!content) return res.status(404).json({ error: "Homepage item not found." })
  res.json({ message: "Deleted" })
}

module.exports = { listHomeContent, adminListHomeContent, createHomeContent, updateHomeContent, deleteHomeContent }
