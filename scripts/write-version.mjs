import { writeFileSync, mkdirSync, existsSync } from "node:fs";

// Writes a fresh version stamp on every build so the running client can detect
// a new deployment by polling /version.json.
const version = Date.now().toString();
if (!existsSync("public")) mkdirSync("public", { recursive: true });
writeFileSync("public/version.json", JSON.stringify({ version }));
console.log(`write-version: public/version.json -> ${version}`);
