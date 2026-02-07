const Joi = require("joi");
const mongoose = require("mongoose");
const Note = require("../models/Note");
const { asyncHandler } = require("../utils/asyncHandler");

const createSchema = Joi.object({
  title: Joi.string().min(1).max(120).required(),
  content: Joi.string().allow("").max(5000).default(""),
  tags: Joi.array().items(Joi.string().max(30)).default([]),
  pinned: Joi.boolean().default(false)
});

const updateSchema = Joi.object({
  title: Joi.string().min(1).max(120).optional(),
  content: Joi.string().allow("").max(5000).optional(),
  tags: Joi.array().items(Joi.string().max(30)).optional(),
  pinned: Joi.boolean().optional()
}).min(1);

const createNote = asyncHandler(async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: "Validation error", details: error.details.map(d => d.message) });

  const note = await Note.create({ ...value, user: req.user.sub });
  res.status(201).json(note);
});

const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user.sub }).sort({ pinned: -1, updatedAt: -1 });
  res.json(notes);
});

const getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid note id" });

  const note = await Note.findOne({ _id: id, user: req.user.sub });
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json(note);
});

const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid note id" });

  const { error, value } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: "Validation error", details: error.details.map(d => d.message) });

  const note = await Note.findOneAndUpdate({ _id: id, user: req.user.sub }, value, { new: true });
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json(note);
});

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid note id" });

  const note = await Note.findOneAndDelete({ _id: id, user: req.user.sub });
  if (!note) return res.status(404).json({ message: "Note not found" });
  res.json({ message: "Deleted" });
});

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };
