const express = require("express");
const { auth } = require("../middleware/auth");
const { createNote, getNotes, getNoteById, updateNote, deleteNote } = require("../controllers/notesController");

const router = express.Router();

router.post("/", auth, createNote);
router.get("/", auth, getNotes);
router.get("/:id", auth, getNoteById);
router.put("/:id", auth, updateNote);
router.delete("/:id", auth, deleteNote);

module.exports = router;
