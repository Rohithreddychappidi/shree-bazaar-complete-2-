const express = require("express");
const upload = require("../middleware/upload");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

// POST /api/uploads — admin only. Accepts up to 8 files under the field name "images".
// Returns the public URLs (served by the static /uploads route in app.js) so the
// admin panel can attach them to a product.
router.post("/", requireStaff, upload.array("images", 8), (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const urls = (req.files || []).map((f) => `${baseUrl}/uploads/${f.filename}`);
  res.json({ urls });
});

module.exports = router;
