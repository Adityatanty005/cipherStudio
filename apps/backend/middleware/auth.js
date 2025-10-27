const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

module.exports = async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "missing token" });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user id/email to request
    req.user = { id: payload.sub, email: payload.email };
    // optional: load full user
    try {
      const user = await User.findById(payload.sub).select("-passwordHash");
      if (!user) return res.status(401).json({ error: "invalid user" });
      req.user = { id: user._id, email: user.email, name: user.name };
    } catch (e) {
      // ignore - proceed with payload
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
};
