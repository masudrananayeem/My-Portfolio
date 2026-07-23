require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const blogRoutes = require("./routes/blogRoutes");
const contactRoutes = require("./routes/contactRoutes");
const statsRoutes = require("./routes/statsRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

connectDB();

/* ===================================================
   Security
=================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://my-portfolio-gold-seven-79.vercel.app",
    ],
    credentials: true,
  })
);

/* ===================================================
   Body Parser
=================================================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

/* ===================================================
   Rate Limiter
=================================================== */

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
});

app.use("/api", limiter);

/* ===================================================
   Static Files
=================================================== */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ===================================================
   Health Check
=================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API Running Successfully",
  });
});

/* ===================================================
   Routes
=================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upload", uploadRoutes);

/* ===================================================
   Error Handler
=================================================== */

app.use(notFound);
app.use(errorHandler);

/* ===================================================
   Server
=================================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`
  );
});