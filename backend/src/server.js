import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT ?? 3000;
const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Servidor disponível em http://${host}:${port}`);
});
