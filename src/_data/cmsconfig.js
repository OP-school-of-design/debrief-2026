// The dashboard's settings (src/admin/config.txt), built into admin/index.html so the dashboard
// doesn't have to fetch them separately when it opens (saves one round trip, about 0.7 s).
// Edit src/admin/config.txt as before; every build picks up the change.
//
// Site settings > Dashboard > How Save works (src/_data/dashboard.json) can switch off the approval
// steps for the launch period: with "Publish straight away", Save makes changes live immediately.
import fs from "node:fs";
import yaml from "js-yaml";

export default function () {
  const config = yaml.load(fs.readFileSync("src/admin/config.txt", "utf8"));
  let mode = "workflow";
  try {
    mode = JSON.parse(fs.readFileSync("src/_data/dashboard.json", "utf8")).publishMode || "workflow";
  } catch {}
  if (mode === "direct") delete config.publish_mode;
  return config;
}
