// The quick-answer buttons and the fit-check outcomes in Sherlock must always
// point at real written answers, never the fallback.
//
// Run: npm run verify:quick-answers

import { createServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom" });
const { intentById, answerForIntent, findLocalSherlockIntent } = await server.ssrLoadModule("/src/lib/sherlockCorpus.ts");
const { APPS } = await server.ssrLoadModule("/src/data/content.ts");
await server.close();

const QUICK = ["price", "start", "timeline", "ownership", "security"];
let failures = 0;
const fail = (message) => {
  failures += 1;
  console.log(`FAIL  ${message}`);
};

for (const id of QUICK) {
  const intent = intentById(id);
  if (!intent) fail(`quick answer "${id}" has no intent`);
  else if (!answerForIntent(intent, id).trim()) fail(`quick answer "${id}" is empty`);
  const phrase = intent?.prompts[0];
  if (phrase && findLocalSherlockIntent(phrase)?.id !== id) fail(`"${phrase}" does not resolve to "${id}"`);
}
if (!intentById("fallback")) fail("the fallback intent is missing");

for (const app of APPS) {
  if (!app.href.startsWith("https://") || !app.href.endsWith("/?open=1")) fail(`${app.id} link is not an https launch link`);
  if (!app.icon.includes("?v=")) fail(`${app.id} icon has no version tag, so caches could keep an old icon`);
}

if (failures) process.exit(1);
console.log(`OK: ${QUICK.length} quick answers and ${APPS.length} app links are valid.`);
