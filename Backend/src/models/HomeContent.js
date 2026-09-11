const mongoose = require("mongoose")

// Homepage assets are intentionally separate from product media. `kind` keeps
// banners, category tiles, and editorial images independently manageable.
const homeContentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["banner", "category", "image"], required: true, index: true },
    key: { type: String, default: "" },
    title: { type: String, default: "" },
    caption: { type: String, default: "" },
    link: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

homeContentSchema.index({ kind: 1, key: 1 })
module.exports = mongoose.model("HomeContent", homeContentSchema)
