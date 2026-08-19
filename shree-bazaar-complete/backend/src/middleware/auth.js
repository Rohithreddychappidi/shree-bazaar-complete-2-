const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const COOKIE_NAME = "sb_token";

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function setAuthCookie(res, user) {
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

// Attaches req.user if a valid token cookie is present. Does not block the request
// if there's no token — routes that require login use `requireAuth` below.
async function attachUser(req, _res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (user) req.user = user;
    next();
  } catch {
    next(); // invalid/expired token — treat as logged out rather than erroring
  }
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });
  next();
}

// Master admin OR sub-admin — used for the routes sub-admins are allowed to touch
// (products, categories, coupons). Anything more sensitive (orders, settings,
// managing other sub-admins) stays behind requireAdmin (master admin only).
function requireStaff(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== "ADMIN" && req.user.role !== "SUB_ADMIN") {
    return res.status(403).json({ error: "Staff access required" });
  }
  next();
}

module.exports = { COOKIE_NAME, signToken, setAuthCookie, clearAuthCookie, attachUser, requireAuth, requireAdmin, requireStaff };
