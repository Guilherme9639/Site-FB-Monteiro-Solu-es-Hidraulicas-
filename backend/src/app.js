import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
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

app.get("/api/health", (request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API da FB Monteiro está funcionando!",
  });
});

app.use((error, request, response, next) => {
  console.error(error);

  return response.status(500).json({
    message: "Não foi possível concluir a solicitação.",
  });
});

export default app;
