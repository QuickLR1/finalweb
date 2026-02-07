const Joi = require("joi");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const updateSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional()
}).min(1);

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { error, value } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: "Validation error", details: error.details.map(d => d.message) });

  if (value.email) {
    const exists = await User.findOne({ email: value.email, _id: { $ne: req.user.sub } });
    if (exists) return res.status(409).json({ message: "Email already in use" });
  }

  if (value.username) {
    const exists = await User.findOne({ username: value.username, _id: { $ne: req.user.sub } });
    if (exists) return res.status(409).json({ message: "Username already in use" });
  }

  const user = await User.findByIdAndUpdate(req.user.sub, value, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: "Profile updated", user });
});

module.exports = { getProfile, updateProfile };
