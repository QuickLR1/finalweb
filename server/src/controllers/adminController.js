const mongoose = require("mongoose");
const Note = require("../models/Note");
const { asyncHandler } = require("../utils/asyncHandler");

const deleteAnyNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid note id" });

  const note = await Note.findByIdAndDelete(id);
  if (!note) return res.status(404).json({ message: "Note not found" });

  res.json({ message: "Admin deleted note", noteId: id });
});

module.exports = { deleteAnyNote };
