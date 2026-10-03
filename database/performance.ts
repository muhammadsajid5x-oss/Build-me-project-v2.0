import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const { db, connection } = await import("./index.ts");

const iterations = 20;
const durations: number[] = [];

try {
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    await db.execute(sql`SELECT 1`);

    const duration = performance.now() - start;
    durations.push(duration);
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const average =
    durations.reduce((total, value) => total + value, 0) / durations.length;
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];

  if (process.env.DEBUG_PERFORMANCE === "1") {
    console.info("Database Performance Results", {
      iterations,
      average: `${average.toFixed(2)}ms`,
      p95: `${p95.toFixed(2)}ms`,
    });
  }
} finally {
  await connection.end();
}
