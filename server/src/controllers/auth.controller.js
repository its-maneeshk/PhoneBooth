import jwt from "jsonwebtoken";
import User from "../models/User.js";

const COOKIE_NAME = process.env.COOKIE_NAME || "auth_token";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false // set true in production behind HTTPS
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ message: "Logged in", user: { email: user.email, role: user.role } });
  } catch (e) { next(e); }
};

export const logout = async (_req, res, _next) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: false });
  res.json({ message: "Logged out" });
};

export const me = async (req, res) => {
  res.json({ user: req.user }); // set by middleware
};
