const User = require("../models/User")

async function updateProfile(req, res) {
  const update = {
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
  }
  if (req.file) update.avatar = `/uploads/${req.file.filename}`
  const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select("-password")
  return res.json(user)
}

module.exports = { updateProfile }
