import jwt from "jsonwebtoken";
const COOKIE_NAME = process.env.COOKIE_NAME || "auth_token";

export const requireAuth = (req, res, next) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    if (payload.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
