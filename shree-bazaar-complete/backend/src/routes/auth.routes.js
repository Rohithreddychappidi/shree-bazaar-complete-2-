const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("../config/passport");
const prisma = require("../config/prisma");
const { setAuthCookie, clearAuthCookie, requireAuth } = require("../middleware/auth");

const router = express.Router();

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  phone: u.phone,
  whatsappNumber: u.whatsappNumber,
  marketingConsent: u.marketingConsent,
  profileCompletedAt: u.profileCompletedAt,
  avatarUrl: u.avatarUrl,
  role: u.role,
});

// Step 1: send the user to Google's consent screen.
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// Step 2: Google redirects back here with the result.
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google` }),
  (req, res) => {
    // req.user was set by the GoogleStrategy verify callback (see config/passport.js)
    setAuthCookie(res, req.user);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

// POST /auth/login — email + password login, for sub-admin accounts the master admin
// creates from /admin/staff. Regular customers and the master admin sign in with Google
// only; this only works for a user that actually has a password set.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  setAuthCookie(res, user);
  res.json(publicUser(user));
});

// Returns the logged-in user (or 401), so the frontend can check auth state on load.
router.get("/me", requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

// PATCH /auth/me — update the logged-in user's own name/phone/WhatsApp number/marketing
// consent. Email is intentionally not editable here since it's tied to the Google
// account (or set by the master admin for sub-admins) used to sign in. Setting
// profileCompletedAt marks that they've been through the post-login details prompt, so
// the frontend stops showing it on future visits.
router.patch("/me", requireAuth, async (req, res) => {
  const { name, phone, whatsappNumber, marketingConsent, markProfileComplete } = req.body;
  const data = { name, phone, whatsappNumber, marketingConsent };
  if (markProfileComplete) data.profileCompletedAt = new Date();

  const updated = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json(publicUser(updated));
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

module.exports = router;
