const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendWelcomeEmail } = require("../utils/email");

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(72).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(72).required()
});

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: "Validation error", details: error.details.map(d => d.message) });

  const { username, email, password } = value;

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) return res.status(409).json({ message: "User already exists (email or username)" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash, role: "user" });

  try { await sendWelcomeEmail(user.email, user.username); } catch (e) { console.warn("Email send failed:", e.message); }

  const token = signToken(user);
  res.status(201).json({
    message: "Registered",
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role }
  });
});

const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: "Validation error", details: error.details.map(d => d.message) });

  const { email, password } = value;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.json({
    message: "Logged in",
    token,
    user: { id: user._id, username: user.username, email: user.email, role: user.role }
  });
});

module.exports = { register, login };
