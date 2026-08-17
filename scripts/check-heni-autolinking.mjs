import { execFileSync } from "node:child_process";
const raw = execFileSync("npx", ["expo-modules-autolinking", "search", "--platform", "android", "--json"], { encoding: "utf8" });
const data = JSON.parse(raw);
const matches = Object.entries(data).filter(([name, value]) => name.toLowerCase().includes("heni") || value?.path?.toLowerCase().includes("heni"));
console.log(JSON.stringify(matches, null, 2));
