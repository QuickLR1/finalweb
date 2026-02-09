const express = require("express");
const { auth } = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const { deleteAnyNote } = require("../controllers/adminController");

const router = express.Router();

router.delete("/notes/:id", auth, allowRoles("admin", "moderator"), deleteAnyNote);

module.exports = router;
