import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import adminProjectRoutes from "./routes/adminProjectRoutes.js";
import adminSiteImageRoutes from "./routes/adminSiteImageRoutes.js";
import adminWorkCarouselRoutes from "./routes/adminWorkCarouselRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminContactRoutes from "./routes/adminContactRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import publicContentRoutes from "./routes/publicContentRoutes.js";
import workCarouselRoutes from "./routes/workCarouselRoutes.js";
import { optionalAuth, requireAuth } from "./middlewares/auth.js";

const app = express();
const allowedOrigins = new Set([
  process.env.FRONTEND_URL ?? "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não autorizada pelo CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "32kb" }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Muitas solicitações. Tente novamente mais tarde.",
  },
});

app.use("/api/contatos", contactLimiter, contactRoutes);
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/contacts", requireAuth, adminContactRoutes);
app.use("/api/admin/projects", requireAuth, adminProjectRoutes);
app.use("/api/admin/site-images", requireAuth, adminSiteImageRoutes);
app.use("/api/admin/work-carousel", requireAuth, adminWorkCarouselRoutes);
app.use("/api/media", optionalAuth, mediaRoutes);
app.use("/api", publicContentRoutes);
app.use("/api/work-carousel", workCarouselRoutes);

app.get("/api/health", (request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API da FB Monteiro está funcionando!",
  });
});

app.use((error, request, response, next) => {
  if (error.name === "MulterError" && error.code !== "LIMIT_FILE_SIZE") {
    return response.status(400).json({
      message: "Não foi possível processar o upload.",
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return response.status(413).json({
      message: "A imagem excede o limite permitido.",
    });
  }

  if (error.code === "LIMIT_FILE_COUNT") {
    return response.status(400).json({
      message: "A quantidade de imagens excede o limite permitido.",
    });
  }

  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ message: "JSON inválido." });
  }

  if (error.code === "P2002") {
    return response.status(409).json({ message: "Registro duplicado." });
  }

  console.error(error);

  return response.status(error.status ?? 500).json({
    message:
      error.status && error.status < 500
        ? error.message
        : "Não foi possível concluir a solicitação.",
  });
});

export default app;
