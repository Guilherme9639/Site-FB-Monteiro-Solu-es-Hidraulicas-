import cors from "cors";
import express from "express";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json());
app.use("/api/contatos", contactRoutes);

app.get("/api/health", (request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API da FB Monteiro está funcionando!",
  });
});

export default app;

