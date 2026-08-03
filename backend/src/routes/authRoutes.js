import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { login, logout, me } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";

const authRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Muitas tentativas de login. Tente novamente mais tarde.",
  },
});

authRoutes.post("/login", loginLimiter, login);
authRoutes.post("/logout", requireAuth, logout);
authRoutes.get("/me", requireAuth, me);

export default authRoutes;
