const mongoose = require("mongoose");
const Note = require("../models/Note");
const { asyncHandler } = require("../utils/asyncHandler");

const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find()
    .populate("user", "username email role")
    .sort({ pinned: -1, updatedAt: -1 });

  res.json(notes);
});


const deleteAnyNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid note id" });

  const note = await Note.findByIdAndDelete(id);
  if (!note) return res.status(404).json({ message: "Note not found" });

  res.json({ message: "Deleted (admin/moderator)", noteId: id });
});

module.exports = { getAllNotes, deleteAnyNote };
