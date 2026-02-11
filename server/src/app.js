const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== Core Middleware =====
app.use(express.json({ limit: "1mb" }));

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : "*";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);

// ===== Health check =====
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ===== API Routes =====
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/usersRoutes");
const noteRoutes = require("./routes/noteRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);

// ===== Serve Frontend (client) =====

const clientDir = path.join(__dirname, "../../client");
app.use(express.static(clientDir));

// For SPA-like behavior (and to open index.html from root URL)
app.get("/", (req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
});

module.exports = app;
