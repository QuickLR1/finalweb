const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, default: "", trim: true, maxlength: 5000 },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    pinned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
