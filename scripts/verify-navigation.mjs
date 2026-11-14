// Resolves every siteTree node by its display name through Sherlock's typed
// navigation matcher and checks it lands on the node's own route or link.
// Headless, so it does not cover real browser navigation.
//
// Run: npm run verify:navigation

import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom" });
const { flattenRoutes } = await server.ssrLoadModule("/src/lib/siteTree.ts");
const { matchNavigationIntent } = await server.ssrLoadModule("/src/lib/chatIntents.ts");
await server.close();

let failures = 0;
let checked = 0;
for (const node of flattenRoutes()) {
  if (node.path === "/" || node.path === "/contact") continue;
  checked += 1;
  const hit = matchNavigationIntent(`open ${node.name}`);
  const ok = hit && (hit.path === node.path || (hit.route && hit.route === node.route) || (hit.href && hit.href === node.href));
  if (!ok) {
    failures += 1;
    console.log(`FAIL  "open ${node.name}" -> ${hit ? hit.path : "(nothing)"}  (expected ${node.path})`);
  }
}
if (failures) {
  console.log(`\n${failures} of ${checked} pages did not resolve by name.`);
  process.exit(1);
}
console.log(`OK: all ${checked} pages resolve by name through Sherlock's matcher.`);
