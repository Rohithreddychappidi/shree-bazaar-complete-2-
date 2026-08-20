const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("./config/passport"); // registers the Google strategy

const { attachUser } = require("./middleware/auth");

const authRoutes = require("./routes/auth.routes");
const categoriesRoutes = require("./routes/categories.routes");
const productsRoutes = require("./routes/products.routes");
const uploadsRoutes = require("./routes/uploads.routes");
const addressesRoutes = require("./routes/addresses.routes");
const ordersRoutes = require("./routes/orders.routes");
const adminRoutes = require("./routes/admin.routes");
const webhooksRoutes = require("./routes/webhooks.routes");
const settingsRoutes = require("./routes/settings.routes");
const heroSlidesRoutes = require("./routes/hero-slides.routes");
const staffRoutes = require("./routes/staff.routes");
const myRoutes = require("./routes/my.routes");
const couponsRoutes = require("./routes/coupons.routes");
const marketingRoutes = require("./routes/marketing.routes");

const app = express();

// FRONTEND_URL can be a single origin or a comma-separated list — needed because
// browsers treat www.yourdomain.com and yourdomain.com as two different origins for
// CORS purposes, even though they're "the same site" to a person visiting either.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header (e.g. server-to-server requests, curl) — allow.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true, // required so the httpOnly auth cookie is sent/received
  })
);
// `verify` stashes the raw request body alongside Express's parsed req.body — the
// Razorpay webhook handler needs the exact raw bytes to compute its HMAC signature;
// re-serializing req.body with JSON.stringify() can reorder keys and break verification.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());
app.use(attachUser); // populates req.user on every request if a valid cookie is present

// Uploaded product images are served directly from disk on the VPS.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhooks", webhooksRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/hero-slides", heroSlidesRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/my", myRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/marketing", marketingRoutes);

// Centralized error handler (e.g. multer file-type/size errors land here)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
});

module.exports = app;