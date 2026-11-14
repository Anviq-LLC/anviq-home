// Browser smoke test against a running copy of the built site.
//
// Run: npm run build && npx vite preview --port 4173 &  node scripts/smoke.mjs
// Env: CHROME  path to a Chrome or Edge executable
//      BASE    site address (default http://127.0.0.1:4173)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE || "http://127.0.0.1:4173";
const CANDIDATES = [process.env.CHROME, "/usr/bin/google-chrome", "/usr/bin/chromium", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe"].filter(Boolean);
const executablePath = CANDIDATES.find((p) => fs.existsSync(p));
if (!executablePath) throw new Error("No Chrome or Edge found. Set CHROME.");
const axeSource = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../node_modules/axe-core/axe.min.js"), "utf8");

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  dumpio: !!process.env.CI,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
};
const open = async (route, width = 1280, mobile = false) => {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 800, isMobile: mobile, hasTouch: mobile });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + route, { waitUntil: "load" });
  await sleep(2500);
  return { page, errors };
};
const axe = async (page, label) => {
  await page.evaluate(axeSource);
  const found = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] } })).violations.map((v) => v.id));
  check(`accessibility: ${label}`, found.length === 0, found.join(","));
};

// the home page loads, contacts nobody else, and its navigation works
{
  const page = await browser.newPage();
  const hosts = new Set();
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.protocol.startsWith("http") && u.origin !== new URL(BASE).origin) hosts.add(u.host);
  });
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await sleep(3000);
  check("home page contacts no outside host", hosts.size === 0, [...hosts].join(","));
  check("home page shows the three apps", (await page.$$eval(".app-tile .app-name", (e) => e.length)) === 3);
  check("no cookies are set", (await page.cookies()).length === 0);
  await axe(page, "home");
  for (const [label, route] of [["What we do", "/explore/services"], ["Engagement", "/explore/engagement"], ["Overview", "/"]]) {
    await page.evaluate((l) => [...document.querySelectorAll(".nav-link")].find((a) => a.textContent.trim() === l).click(), label);
    await sleep(700);
    check(`navigation: ${label}`, new URL(page.url()).pathname === route);
  }
  await page.close();
}

// policy pages render their full content
for (const [route, needle] of [["/explore/privacy", "Cloudflare Workers AI"], ["/explore/cookies", "Notes kept in your browser"]]) {
  const { page, errors } = await open(route);
  check(`${route} renders and mentions "${needle}"`, (await page.evaluate(() => document.body.innerText)).includes(needle) && errors.length === 0, errors[0] ?? "");
  await axe(page, route);
  await page.close();
}

// Sherlock: opens, fit check works, the cursor appears and can be stopped
{
  const { page, errors } = await open("/");
  await page.click(".sherlock-fab");
  await sleep(1000);
  const labels = await page.$$eval(".sherlock-panel button, .sherlock-panel a", (e) => e.map((x) => x.textContent.trim()));
  check("Sherlock opens with its main actions", ["Find my fit", "Talk to a person", "Walk me through this page"].every((l) => labels.includes(l)));
  await axe(page, "Sherlock panel");
  await page.evaluate(() => [...document.querySelectorAll(".sherlock-primary")].find((c) => c.textContent === "Find my fit").click());
  await sleep(300);
  await page.evaluate(() => [...document.querySelectorAll(".sherlock-options button")].find((c) => c.textContent.startsWith("A public body")).click());
  for (let i = 0; i < 5; i++) {
    await sleep(250);
    await page.evaluate(() => document.querySelector(".sherlock-options button").click());
  }
  await sleep(300);
  check("fit check recommends Anviq Public", (await page.$eval(".sherlock-result-name", (e) => e.textContent).catch(() => "")).includes("Anviq Public"));
  let others = [];
  for (let i = 0; i < 20 && !others.some((tab) => tab.url().includes("public.anviq.net")); i += 1) {
    await sleep(250);
    others = (await browser.pages()).filter((tab) => tab !== page);
  }
  check("the last answer opens the matching site in a new tab", others.some((tab) => tab.url().includes("public.anviq.net")));
  for (const tab of others) await tab.close();
  await page.bringToFront();
  await page.click(".sherlock-close, .sherlock-head .icon-button");
  await sleep(500);
  await page.click(".sherlock-fab");
  await sleep(700);
  await page.evaluate(() => [...document.querySelectorAll(".sherlock-chip")].find((c) => c.textContent === "Walk me through this page").click());
  let cursor = false;
  for (let i = 0; i < 20 && !cursor; i++) {
    await sleep(150);
    cursor = !!(await page.$(".sherlock-ghost"));
  }
  check("the tour shows a cursor and a Stop button", cursor && !!(await page.$(".sherlock-stop")));
  await page.click(".sherlock-stop");
  await sleep(500);
  check("Stop ends the tour", !(await page.$(".sherlock-stop")));
  check("no page errors", errors.length === 0, errors[0] ?? "");
  await page.close();
}

// phone layout
{
  const { page } = await open("/", 390, true);
  await axe(page, "home on a phone");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check("no sideways scroll on a phone", !overflow);
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} smoke check(s) failed.` : "\nSmoke test passed.");
process.exit(failures ? 1 : 0);
