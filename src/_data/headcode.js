// Extra <head> code for every page: whatever is between the "head code start" and "head code end"
// markers in src/_includes/head-code.html (kept out of the dashboard on purpose). It's read as plain
// text, so {{ }} in pasted code is left alone, and the instructions in that file aren't published.
import fs from "node:fs";

export default function () {
  let text = "";
  try {
    text = fs.readFileSync("src/_includes/head-code.html", "utf8");
  } catch {
    return "";
  }
  const match = text.match(/<!-- head code start -->([\s\S]*?)<!-- head code end -->/);
  return match ? match[1].trim() : "";
}
