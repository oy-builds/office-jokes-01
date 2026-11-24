import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The joke ships in entry.txt beside this script; the embedded copy is only a
// fallback so the program still produces a valid entry if the file is missing.
const FALLBACK =
  "My performance review said I exceed expectations, which is awkward, because my only expectation this year was to quietly quit in March.";

function loadEntry(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidate = join(here, "entry.txt");
  if (existsSync(candidate)) {
    return readFileSync(candidate, "utf8");
  }
  return FALLBACK;
}

function main(): void {
  const text = loadEntry();
  if (text.trim().length === 0) {
    throw new Error("entry text is empty; nothing to write");
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", text, "utf8");
  // Read back what landed on disk so a truncated or mangled write fails loudly
  // here instead of silently producing an invalid entry.
  const written = readFileSync("/output/entry.txt", "utf8");
  if (written !== text) {
    throw new Error("read-back mismatch: /output/entry.txt differs from the entry text");
  }
}

try {
  main();
} catch (err) {
  console.error(`office-jokes: failed to write entry: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
