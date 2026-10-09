import fs from "node:fs";
import path from "node:path";
import { TextEncoder, TextDecoder } from "node:util";
import {
  setImmediate as nodeSetImmediate,
  clearImmediate as nodeClearImmediate,
} from "node:timers";

const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");

  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_]\w*)=(.+)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
});

if (globalThis.setImmediate === undefined) {
  Object.assign(globalThis, {
    setImmediate: nodeSetImmediate,
    clearImmediate: nodeClearImmediate,
  });
}
