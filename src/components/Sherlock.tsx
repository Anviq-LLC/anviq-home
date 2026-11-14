import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUp, X } from "lucide-react";
import { APPS } from "@/data/content";
import { QUESTIONS, recommend, summaryLines, WHO, type Answers, type Who } from "@/data/fit";
import { findNode, type SiteNode } from "@/lib/siteTree";
import { matchNavigationIntent } from "@/lib/chatIntents";
import { answerForIntent, findLocalSherlockIntent, intentById, shouldUseSemanticSherlockMatch } from "@/lib/sherlockCorpus";
import { recordBookingClick, useGuide } from "@/lib/guide";
import { motionOr, SPRING_MORPH } from "@/lib/motion";
import { pushQuestionHistory } from "@/lib/suggest";
import { setNavigatorSurfaceOpen } from "@/lib/navigatorSurface";
import { findTarget, runRoute, type Step } from "@/lib/spotlight";
import { firstSentence, NARRATION } from "@/data/narration";
import { AppIcon, AppLink } from "@/components/AppLauncher";
import { SherlockFace } from "@/components/SherlockFace";

type View =
  | { kind: "home" }
  | { kind: "answer"; query: string; text: string; node?: SiteNode; children?: SiteNode[] }
  | { kind: "fit"; who?: Who; step: number; answers: Answers }
  | { kind: "result"; who: Who; answers: Answers };

const BOOKING = "https://calendly.com/lvoss-anviq/30min?month=2026-09";
const NAVIGATION_WORDS = /\b(open|show|take|go|browse|navigate|read|visit|book|schedule|meet|call)\b/i;
const QUICK: { label: string; intent: string }[] = [
  { label: "How much does it cost?", intent: "price" },
  { label: "How do we start?", intent: "start" },
  { label: "How long does it take?", intent: "timeline" },
  { label: "Who owns the code?", intent: "ownership" },
  { label: "Is it secure?", intent: "security" },
];
const CUE_KEY = "sherlock-cue";
const CUE_PAGES: Record<string, string> = {
  "/explore/services": "Not sure which one fits? Try the 30 second fit check.",
  "/explore/engagement": "Have a case in mind? Three taps and I will point you the right way.",
  "/explore/constraints": "Questions about how we work? Ask me.",
  "/explore/questions": "Did not find your question? Ask me.",
};

function selectorFor(node: SiteNode): string | null {
  if (node.route) return `a[href="${node.route}"]`;
  if (node.href) return `a[href^="${new URL(node.href).origin}"]`;
  return null;
}

// The spotlight only goes to controls that are on screen. When a page is not
// directly linked (the phone layout has just three tabs), it goes through the
// Browse tab first, so it never has to guess.
function routeFor(node: SiteNode): Step[] | null {
  const selector = selectorFor(node);
  if (!selector) return null;
  const external = node.kind === "link";
  const caption = external ? node.name : `Opening ${node.name}`;
  if (findTarget(selector)) return [{ selector, click: !external, caption }];
  const browse = 'a[href="/explore/browse"]';
  if (node.route && findTarget(browse)) return [{ selector: browse, click: true, caption: "Browse" }, { selector, click: true, caption }];
  return null;
}

const isVisible = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
};

// The first real paragraph after a heading, skipping short lines such as dates.
function bodyAfter(heading: Element): string {
  let node = heading.nextElementSibling;
  for (let i = 0; node && i < 6; i++, node = node.nextElementSibling) {
    if (/^H[1-6]$/.test(node.tagName)) break;
    const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text.length > 45 && !/^last updated/i.test(text)) return text;
  }
  // The text may sit in the next section, so take the first real paragraph that follows.
  const root = document.querySelector("main") ?? document.body;
  for (const para of root.querySelectorAll("p")) {
    const text = (para.textContent ?? "").replace(/\s+/g, " ").trim();
    if (heading.compareDocumentPosition(para) & Node.DOCUMENT_POSITION_FOLLOWING && text.length > 45 && !/^last updated/i.test(text)) return text;
  }
  return "";
}

const norm = (text: string | null) => (text ?? "").replace(/\s+/g, " ").trim().toLowerCase();

// A tour of the page the visitor is on. Written lines come first; any page
// without them is read from its own headings and opening sentences.
function tourFor(pathname: string): Step[] {
  const root = document.querySelector("main") ?? document.body;
  document.querySelectorAll("[data-sherlock-tour]").forEach((el) => el.removeAttribute("data-sherlock-tour"));
  const headings = [...root.querySelectorAll<HTMLElement>("h1, h2, h3")].filter(isVisible);
  const steps: Step[] = [];
  const authored = NARRATION[pathname];
  if (authored) {
    authored.forEach((line, index) => {
      let el: HTMLElement | null = null;
      if (line.selector) el = findTarget(line.selector);
      else if (line.find) el = headings.find((h) => norm(h.textContent).startsWith(norm(line.find!))) ?? null;
      if (!el) return;
      el.setAttribute("data-sherlock-tour", String(index));
      steps.push({ selector: `[data-sherlock-tour="${index}"]`, say: line.say });
    });
  } else {
    headings.slice(0, 4).forEach((heading, index) => {
      const sentence = firstSentence(bodyAfter(heading)) || firstSentence(heading.parentElement?.textContent ?? "");
      heading.setAttribute("data-sherlock-tour", String(index));
      const name = (heading.textContent ?? "").trim();
      steps.push({ selector: `[data-sherlock-tour="${index}"]`, say: index === 0 ? `${name}. ${sentence}`.trim() : `Next, ${name}. ${sentence}`.trim() });
    });
  }
  const cta = [...root.querySelectorAll<HTMLElement>(".primary-button, .page-cta a")].find(isVisible);
  if (cta && steps.length) {
    cta.setAttribute("data-sherlock-tour", "cta");
    steps.push({ selector: '[data-sherlock-tour="cta"]', say: "When you are ready, this is where a conversation starts. A short call, no commitment." });
  }
  return steps;
}

function fitText(who: Who, answers: Answers) {
  const rec = recommend(who, answers);
  const app = APPS.find((x) => x.id === rec.app);
  return { rec, app, lines: [...summaryLines(who, answers), `Suggested fit: ${app ? app.name : "a short call first"}`] };
}

// What the visitor told Sherlock travels in the link, as plain category codes,
// so he can pick the conversation up on the real site. No names or free text.
function fitHash(who: Who, answers: Answers) {
  const parts = [`who.${who}`, ...Object.entries(answers).map(([k, v]) => `${k}.${v}`)];
  return `fit=${parts.join("_")}`;
}

function mailFor(who: Who, answers: Answers) {
  const { app, lines } = fitText(who, answers);
  const subject = app ? `${app.name}: fit check` : "A conversation about a workflow";
  const body = ["Hello Leonardo,", "", "I used the fit check on anviq.net.", ...lines, "", "A few lines about my situation:", ""].join("\n");
  return `mailto:lvoss@anviq.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function Sherlock() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [input, setInput] = useState("");
  const [cue, setCue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState(false);
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const guide = useGuide(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const faceRef = useRef<HTMLButtonElement>(null);
  const route = useRef<{ cancel: () => void } | null>(null);
  const requestNumber = useRef(0);
  const titleId = useId();
  const inputId = `${titleId}-input`;
  const path = location.pathname.replace("/explore", "") || "/";
  const lastPage = [...guide.journey].reverse().map((p) => findNode(p)).find((node) => node && node.path !== path && node.route);

  const engage = (next: View = { kind: "home" }) => {
    window.dispatchEvent(new Event("anviq:navigator-open"));
    setNavigatorSurfaceOpen(true);
    setCue(null);
    setView(next);
    setOpen(true);
  };
  const dismiss = () => {
    requestNumber.current += 1;
    setNavigatorSurfaceOpen(false);
    guide.close();
    setOpen(false);
    setView({ kind: "home" });
    setInput("");
  };
  const openPage = (node: SiteNode) => {
    if (node.kind === "link" && node.href) {
      if (node.href.includes("calendly.com")) recordBookingClick();
      window.open(node.href, "_blank", "noopener,noreferrer");
    } else if (node.route) navigate(node.route);
    dismiss();
  };
  const play = (steps: Step[]) => {
    route.current?.cancel();
    const box = faceRef.current?.getBoundingClientRect();
    const from = box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : { x: window.innerWidth - 40, y: window.innerHeight - 40 };
    const run = runRoute(steps, { from });
    route.current = run;
    void run.finished.then(() => {
      if (route.current === run) route.current = null;
    });
  };
  const tour = () => {
    dismiss();
    const steps = tourFor(location.pathname);
    if (steps.length) play(steps);
  };
  const showMe = (node: SiteNode) => {
    const steps = routeFor(node);
    dismiss();
    if (!steps) return openPage(node);
    play(steps);
  };
  const answerFor = (query: string, text: string, node?: SiteNode): View => ({ kind: "answer", query, text, node, children: node?.kind === "folder" ? node.children : undefined });
  const intentView = (query: string, id: string): View => {
    const intent = intentById(id);
    if (!intent) return answerFor(query, answerForIntent(intentById("fallback")!, query));
    const node = intent.route ? findNode(intent.route.replace("/explore", "")) ?? findNode(intent.route) : undefined;
    return answerFor(query, answerForIntent(intent, query), node);
  };

  const ask = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setInput("");
    pushQuestionHistory(text);
    guide.noteSherlockQuestion(text);
    const node = NAVIGATION_WORDS.test(text) ? matchNavigationIntent(text) : undefined;
    if (node && routeFor(node)) return showMe(node);
    if (node) return setView(answerFor(text, node.summary, node));
    const local = findLocalSherlockIntent(text);
    if (local) return setView(intentView(text, local.id));
    if (!shouldUseSemanticSherlockMatch(text)) return setView(intentView(text, "fallback"));
    const request = ++requestNumber.current;
    setView(answerFor(text, "One moment."));
    try {
      const response = await fetch("/api/sherlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text }) });
      const result = (await response.json()) as { intent?: string };
      if (request === requestNumber.current) setView(intentView(text, result.intent ?? "fallback"));
    } catch {
      if (request === requestNumber.current) setView(intentView(text, "fallback"));
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(input);
  };

  useEffect(() => () => route.current?.cancel(), []);

  // Arriving from a sales site's "Find my fit" link opens the fit check.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("sherlock") !== "fit") return;
    engage({ kind: "fit", step: 0, answers: {} });
    params.delete("sherlock");
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        faceRef.current?.focus();
      }
    };
    const onFocusInput = () => inputRef.current?.focus();
    const onLightboxOpen = () => dismiss();
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("anviq:focus-navigator-input", onFocusInput);
    window.addEventListener("anviq:lightbox-open", onLightboxOpen);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("anviq:focus-navigator-input", onFocusInput);
      window.removeEventListener("anviq:lightbox-open", onLightboxOpen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // One quiet cue per visit, and only for a visitor who is clearly reading:
  // on a page where a question is likely, or after a few pages.
  useEffect(() => {
    if (open) return;
    try {
      if (sessionStorage.getItem(CUE_KEY)) return;
    } catch {
      return;
    }
    const text = CUE_PAGES[location.pathname] ?? (guide.journey.length >= 4 ? "Looking for something? I can point you to it." : undefined);
    if (!text) return;
    const timer = window.setTimeout(() => {
      if (document.hidden || document.activeElement?.tagName === "INPUT" || route.current) return;
      try {
        sessionStorage.setItem(CUE_KEY, "1");
      } catch {
        // Storage may be blocked; the cue then repeats per page load.
      }
      setCue(text);
    }, 16000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, open]);
  useEffect(() => {
    if (!cue) return;
    const timer = window.setTimeout(() => setCue(null), 10000);
    return () => window.clearTimeout(timer);
  }, [cue]);

  const back = () => {
    if (view.kind === "fit") {
      if (view.who && view.step > 0) return setView({ ...view, step: view.step - 1 });
      if (view.who) return setView({ kind: "fit", step: 0, answers: {} });
    }
    if (view.kind === "result") {
      const last = QUESTIONS[view.who].length - 1;
      return setView({ kind: "fit", who: view.who, step: last, answers: view.answers });
    }
    setView({ kind: "home" });
  };
  const copySummary = async (who: Who, answers: Answers) => {
    try {
      await navigator.clipboard.writeText(fitText(who, answers).lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be blocked; the email button still carries the same summary.
    }
  };

  return (
    <div className={`sherlock${open ? " is-open" : ""}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            className="sherlock-panel"
            role="dialog"
            aria-label="Sherlock"
            initial={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={motionOr(reducedMotion, SPRING_MORPH)}
          >
            <div className="sherlock-head">
              {view.kind !== "home" ? (
                <button type="button" className="sherlock-back" onClick={back}>
                  <ArrowLeft size={16} aria-hidden="true" /> Back
                </button>
              ) : (
                <span>Sherlock</span>
              )}
              <button type="button" className="icon-button" aria-label="Close Sherlock" onClick={dismiss}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="sherlock-body" aria-live="polite">
              {view.kind === "home" && (
                <>
                  <p className="sherlock-text">How can I help?</p>
                  <div className="sherlock-actions">
                    <button type="button" className="sherlock-primary" onClick={() => setView({ kind: "fit", step: 0, answers: {} })}>
                      Find my fit
                    </button>
                    <a className="sherlock-secondary" href={BOOKING} target="_blank" rel="noopener noreferrer" onClick={() => recordBookingClick()}>
                      Talk to a person
                    </a>
                  </div>
                  <p className="sherlock-label">Or let me talk you through it</p>
                  <div className="sherlock-chips">
                    <button type="button" className="sherlock-chip" onClick={tour}>
                      Walk me through this page
                    </button>
                  </div>
                  <p className="sherlock-label">Quick answers</p>
                  <div className="sherlock-chips">
                    {QUICK.map((q) => (
                      <button key={q.intent} type="button" className="sherlock-chip" onClick={() => setView(intentView(q.label, q.intent))}>
                        {q.label}
                      </button>
                    ))}
                  </div>
                  {lastPage && (
                    <>
                      <p className="sherlock-label">Pick up where you left off</p>
                      <div className="sherlock-chips">
                        <button type="button" className="sherlock-chip" onClick={() => showMe(lastPage)}>
                          Back to {lastPage.name}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
              {view.kind === "answer" && (
                <>
                  <p className="sherlock-query">{view.query}</p>
                  <p className="sherlock-text">{view.text}</p>
                  <div className="sherlock-actions">
                    {view.node && (
                      <button type="button" className="sherlock-primary" onClick={() => showMe(view.node!)}>
                        Show me
                      </button>
                    )}
                    <a className="sherlock-secondary" href={BOOKING} target="_blank" rel="noopener noreferrer" onClick={() => recordBookingClick()}>
                      Talk to a person
                    </a>
                  </div>
                  {view.children && (
                    <div className="sherlock-chips">
                      {view.children.map((child) => (
                        <button key={child.path} type="button" className="sherlock-chip" onClick={() => setView(answerFor(child.name, child.summary, child))}>
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {view.kind === "fit" && !view.who && (
                <>
                  <p className="sherlock-text">Who is this for?</p>
                  <div className="sherlock-options">
                    {WHO.map((w) => (
                      <button key={w.value} type="button" onClick={() => setView({ kind: "fit", who: w.value as Who, step: 0, answers: {} })}>
                        {w.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {view.kind === "fit" && view.who && (
                <>
                  <p className="sherlock-progress">
                    Question {view.step + 1} of {QUESTIONS[view.who].length}
                  </p>
                  <p className="sherlock-text">{QUESTIONS[view.who][view.step].text}</p>
                  {view.step + 1 === QUESTIONS[view.who].length && (
                    <p className="sherlock-note">After this one, I will open the site that fits you in a new tab and start the walkthrough there.</p>
                  )}
                  <div className="sherlock-options">
                    {QUESTIONS[view.who][view.step].options.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => {
                          const answers = { ...view.answers, [QUESTIONS[view.who!][view.step].id]: o.value };
                          if (view.step + 1 < QUESTIONS[view.who!].length) setView({ kind: "fit", who: view.who, step: view.step + 1, answers });
                          else {
                            const { app } = fitText(view.who!, answers);
                            let win: Window | null = null;
                            if (app) {
                              win = window.open(`${app.href}#${fitHash(view.who!, answers)}`, "_blank");
                              if (win) win.opener = null;
                            }
                            setOpened(Boolean(win));
                            setView({ kind: "result", who: view.who!, answers });
                          }
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {view.kind === "result" && (() => {
                const { rec, app } = fitText(view.who, view.answers);
                return (
                  <>
                    {app && opened && (
                      <p className="sherlock-note" role="status">
                        I opened {app.name} in a new tab and I am walking you through it there. Everything below stays here if you want it.
                      </p>
                    )}
                    {app ? (
                      <div className="sherlock-result">
                        <span className="sherlock-result-icon">
                          <AppIcon app={app} />
                        </span>
                        <div>
                          <p className="sherlock-result-name">{rec.headline}</p>
                          <p className="sherlock-query">{app.tag}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="sherlock-result-name">{rec.headline}</p>
                    )}
                    <p className="sherlock-label">Why this fits</p>
                    <ul className="sherlock-list">
                      {rec.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    {rec.note && <p className="sherlock-note">{rec.note}</p>}
                    <p className="sherlock-label">What to bring to the first call</p>
                    <ul className="sherlock-list">
                      {rec.bring.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                    <div className="sherlock-actions">
                      {app && (
                        <AppLink app={app} className="sherlock-primary" hash={fitHash(view.who, view.answers)}>
                          {opened ? `Open ${app.name} again` : `Take me to ${app.name}`}
                        </AppLink>
                      )}
                      <a className={app ? "sherlock-secondary" : "sherlock-primary"} href={BOOKING} target="_blank" rel="noopener noreferrer" onClick={() => recordBookingClick()}>
                        Book a call
                      </a>
                      <a className="sherlock-secondary" href={mailFor(view.who, view.answers)}>
                        Email my answers
                      </a>
                      <button type="button" className="sherlock-secondary" onClick={() => void copySummary(view.who, view.answers)}>
                        {copied ? "Copied" : "Copy my summary"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
            <form className="sherlock-form" onSubmit={submit}>
              <label htmlFor={inputId} className="sr-only">
                Ask Sherlock about Anviq
              </label>
              <input id={inputId} ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Or type a question" autoComplete="off" spellCheck={false} />
              <button type="submit" className="sherlock-send" aria-label="Ask" disabled={!input.trim()}>
                <ArrowUp size={18} aria-hidden="true" />
              </button>
            </form>
            <p className="sherlock-trust">The answers here are written by Anviq.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {cue && !open && (
        <div className="sherlock-cue" role="region" aria-label="Sherlock suggestion">
          <button type="button" className="sherlock-cue-go" onClick={() => engage(location.pathname === "/explore/services" || location.pathname === "/explore/engagement" ? { kind: "fit", step: 0, answers: {} } : { kind: "home" })}>
            {cue}
          </button>
          <button type="button" className="sherlock-cue-x" aria-label="Dismiss suggestion" onClick={() => setCue(null)}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
      <button ref={faceRef} type="button" className="sherlock-fab" aria-label="Open Sherlock" aria-expanded={open} onClick={open ? dismiss : () => engage()}>
        <SherlockFace />
      </button>
    </div>
  );
}
