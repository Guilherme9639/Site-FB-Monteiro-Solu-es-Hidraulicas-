import cors from "cors";
import express from "express";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (request, response) => {
  response.status(200).json({
    status: "ok",
    message: "API da FB Monteiro está funcionando!",
  });
});

export default app;

