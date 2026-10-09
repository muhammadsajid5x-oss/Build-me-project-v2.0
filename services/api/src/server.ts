import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});
const { default: app } = await import("./app.js");
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  if (process.env.NODE_ENV !== "production") {
    console.info(`Build Me API running on port ${port}`);
  }
});
