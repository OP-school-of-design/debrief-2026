// Warns about files/folders with UPPERCASE letters or spaces in src/.
// Windows and macOS don't care about capitals, but the live web server (Linux) does:
// "Photo.JPG" and "photo.jpg" are two different files there, so a mismatch = a broken image.
import fs from "node:fs";
import path from "node:path";

const strict = process.argv.includes("--strict");
const bad = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue; // created by macOS Finder; never published
    if (/[A-Z ]/.test(entry.name)) bad.push(path.join(dir, entry.name));
    if (entry.isDirectory()) walk(path.join(dir, entry.name));
  }
})("src");

if (bad.length) {
  console.warn("\n\u26A0  File names with capital letters or spaces (rename to lowercase-with-hyphens):");
  bad.forEach((f) => console.warn("   - " + f));
  console.warn("");
  if (strict) process.exit(1);
} else {
  console.log("\u2713 All file names in src/ are lowercase.");
}
