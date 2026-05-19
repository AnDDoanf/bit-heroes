import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const NOJEKYLL_FILE = path.join(OUT_DIR, ".nojekyll");

if (fs.existsSync(OUT_DIR)) {
  fs.writeFileSync(NOJEKYLL_FILE, "");
  console.log("Created out/.nojekyll");
} else {
  console.log("No out directory found, skipping .nojekyll creation");
}
