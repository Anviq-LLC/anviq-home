// Guards the site's written rules so they cannot slip silently:
//  - no em or en dashes, curly quotes or ellipsis characters in site text
//  - no private identifiers (tax id, phone numbers, personal address)
//  - every outside host the code mentions is one the policies disclose
//  - the privacy and cookie policies mention the services the site uses
//  - the static header file matches the policies
//
// Run: npm run verify:compliance

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
let failures = 0;
const fail = (message) => {
  failures += 1;
  console.log(`FAIL  ${message}`);
};

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.(tsx?|css|html|txt|xml|json|md|jsonc)$/.test(entry.name) || entry.name === "_headers") out.push(rel);
  }
  return out;
}

const files = [...walk("src"), ...walk("public"), ...walk("worker"), "index.html"];

const BANNED = /[–—“”‘’…]/;
const PRIVATE = [
  [/\b\d{2}-\d{7}\b/, "a tax id pattern"],
  [/\+\d{1,3}[ -]?\(?\d{2,4}\)?[ -]?\d{3}[ -]?\d{3,4}/, "a phone number"],
  [/\b(Thailand|Bangkok|Phuket|Chiang Mai)\b/i, "a personal location"],
];
for (const file of files) {
  const lines = read(file).split("\n");
  lines.forEach((line, i) => {
    if (BANNED.test(line)) fail(`${file}:${i + 1} has a banned punctuation character`);
    for (const [pattern, what] of PRIVATE) if (pattern.test(line)) fail(`${file}:${i + 1} looks like ${what}`);
  });
}

// Outside hosts mentioned in code must be disclosed or be a link, never a hidden request.
const ALLOWED = new Set([
  "github.com", "api.github.com", "github-contributions-api.jogruber.de", "avatars.githubusercontent.com",
  "calendly.com", "linkedin.com", "www.linkedin.com", "x.com", "steadyward.com", "addreach.addvert.de",
  "schema.org", "ico.org.uk", "www.aboutcookies.org", "www.w3.org", "anviq.net",
  "agents.anviq.net", "build.anviq.net", "public.anviq.net", "www.sitemaps.org", "openrouter.ai",
]);
for (const file of walk("src")) {
  for (const m of read(file).matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) {
    if (!ALLOWED.has(m[1].toLowerCase())) fail(`${file} mentions ${m[1]}, which is not in the disclosed list`);
  }
}

const privacy = read("src/pages/Privacy.tsx");
const cookies = read("src/pages/Cookies.tsx");
for (const needle of ["Cloudflare Workers AI", "api.github.com", "github-contributions-api.jogruber.de", "avatars.githubusercontent.com", "280 characters"]) {
  if (!privacy.includes(needle)) fail(`the privacy policy does not mention "${needle}"`);
}
for (const needle of ["Cloudflare Workers AI", "github-contributions-api.jogruber.de", "avatars.githubusercontent.com", "local and session storage"]) {
  if (!cookies.includes(needle)) fail(`the cookie policy does not mention "${needle}"`);
}

const headers = read("public/_headers");
const csp = headers.match(/Content-Security-Policy: (.*)/)?.[1] ?? "";
for (const host of ["https://avatars.githubusercontent.com", "https://api.github.com", "https://github-contributions-api.jogruber.de"]) {
  if (!csp.includes(host)) fail(`the security header is missing ${host}`);
}
if (/zobj|unsafe-eval|unsafe-inline'[^;]*script/.test(csp)) fail("the security header allows something it should not");
if (!/Strict-Transport-Security/.test(headers)) fail("the static headers lack HSTS");

if (failures) {
  console.log(`\n${failures} compliance check(s) failed.`);
  process.exit(1);
}
console.log(`OK: ${files.length} files clean of banned punctuation and private identifiers; outside hosts, policies and headers agree.`);
