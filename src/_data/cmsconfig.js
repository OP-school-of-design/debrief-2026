// The dashboard's settings (src/admin/config.txt), built into admin/index.html so the dashboard
// doesn't have to fetch them separately when it opens (saves one round trip, about 0.7 s).
// Edit src/admin/config.txt as before; every build picks up the change.
import fs from "node:fs";
import yaml from "js-yaml";

export default function () {
  return yaml.load(fs.readFileSync("src/admin/config.txt", "utf8"));
}
