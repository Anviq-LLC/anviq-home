import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowUp, X } from "lucide-react";
import { APPS } from "@/data/content";
import { findNode, type SiteNode } from "@/lib/siteTree";
import { matchNavigationIntent } from "@/lib/chatIntents";
import { answerForIntent, findLocalSherlockIntent, intentById, shouldUseSemanticSherlockMatch } from "@/lib/sherlockCorpus";
import { recordBookingClick, useGuide } from "@/lib/guide";
import { motionOr, SPRING_MORPH } from "@/lib/motion";
import { pushQuestionHistory } from "@/lib/suggest";
import { setNavigatorSurfaceOpen } from "@/lib/navigatorSurface";
import { findTarget, runRoute, type Step } from "@/lib/spotlight";
import { AppIcon, AppLink } from "@/components/AppLauncher";
import { SherlockFace } from "@/components/SherlockFace";

type App = (typeof APPS)[number];
type View =
  | { kind: "home" }
  | { kind: "answer"; query: string; text: string; node?: SiteNode; children?: SiteNode[] }
  | { kind: "fit"; step: "who" | "problem"; who?: string }
  | { kind: "result"; app?: App; who: string; problem?: string };

const BOOKING = "https://calendly.com/lvoss-anviq/30min?month=2026-09";
const NAVIGATION_WORDS = /\b(open|show|take|go|browse|navigate|read|visit|book|schedule|meet|call)\b/i;
const QUICK: { label: string; intent: string }[] = [
  { label: "How much does it cost?", intent: "price" },
  { label: "How do we start?", intent: "start" },
  { label: "How long does it take?", intent: "timeline" },
  { label: "Who owns the code?", intent: "ownership" },
  { label: "Is it secure?", intent: "security" },
];
const PROBLEMS: { label: string; app?: string }[] = [
  { label: "Repetitive work people do by hand", app: "agents" },
  { label: "Systems that do not talk to each other", app: "build" },
  { label: "An idea for new software", app: "build" },
  { label: "I am not sure yet" },
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

const OVERVIEW_TOUR: Step[] = [
  ...APPS.map((app, index) => ({ selector: `.apps-grid > a:nth-child(${index + 1})`, caption: `${app.name}: ${app.tag}`, hold: 1500 })),
  { selector: 'a[href="/explore/projects"]', caption: "Selected work: what we have built", hold: 1500 },
  { selector: ".welcome-section .primary-button, .files-welcome-document a", caption: "Start here when you are ready", hold: 1800 },
];

const isVisible = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
};

// A short tour of the page the visitor is on: its headings in order, then the
// button that starts a conversation.
function tourFor(pathname: string): Step[] {
  if (pathname === "/") return OVERVIEW_TOUR.filter((step) => findTarget(step.selector));
  const root = document.querySelector("main") ?? document.body;
  document.querySelectorAll("[data-sherlock-tour]").forEach((el) => el.removeAttribute("data-sherlock-tour"));
  const steps: Step[] = [];
  [...root.querySelectorAll<HTMLElement>("h1, h2")].filter(isVisible).slice(0, 5).forEach((heading, index) => {
    heading.setAttribute("data-sherlock-tour", String(index));
    steps.push({ selector: `[data-sherlock-tour="${index}"]`, caption: (heading.textContent ?? "").trim().slice(0, 46) || "This part", hold: 1500 });
  });
  const cta = [...root.querySelectorAll<HTMLElement>(".primary-button, .page-cta a")].find(isVisible);
  if (cta) {
    cta.setAttribute("data-sherlock-tour", "cta");
    steps.push({ selector: '[data-sherlock-tour="cta"]', caption: "Start here when you are ready", hold: 1800 });
  }
  return steps;
}

function mailFor(app: App | undefined, who: string, problem?: string) {
  const subject = app ? `${app.name}: fit check` : "A conversation about a workflow";
  const lines = ["Hello Leonardo,", "", "I used the fit check on anviq.net.", `Who it is for: ${who}`];
  if (problem) lines.push(`Biggest headache: ${problem}`);
  lines.push("", "A few lines about my situation:", "");
  return `mailto:lvoss@anviq.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}

export function Sherlock() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ kind: "home" });
  const [input, setInput] = useState("");
  const [cue, setCue] = useState<string | null>(null);
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

  const back = () => setView({ kind: "home" });

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
                    <button type="button" className="sherlock-primary" onClick={() => setView({ kind: "fit", step: "who" })}>
                      Find my fit
                    </button>
                    <a className="sherlock-secondary" href={BOOKING} target="_blank" rel="noopener noreferrer" onClick={() => recordBookingClick()}>
                      Talk to a person
                    </a>
                  </div>
                  <p className="sherlock-label">Or let me show you around</p>
                  <div className="sherlock-chips">
                    <button type="button" className="sherlock-chip" onClick={tour}>
                      Watch a short tour
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
              {view.kind === "fit" && view.step === "who" && (
                <>
                  <p className="sherlock-text">Who is this for?</p>
                  <div className="sherlock-options">
                    <button type="button" onClick={() => setView({ kind: "fit", step: "problem", who: "A business or team" })}>
                      A business or team
                    </button>
                    <button type="button" onClick={() => setView({ kind: "result", app: APPS.find((a) => a.id === "public"), who: "A public body" })}>
                      A public body: city, county, school, library
                    </button>
                  </div>
                </>
              )}
              {view.kind === "fit" && view.step === "problem" && (
                <>
                  <p className="sherlock-text">What is the biggest headache?</p>
                  <div className="sherlock-options">
                    {PROBLEMS.map((p) => (
                      <button key={p.label} type="button" onClick={() => setView({ kind: "result", app: APPS.find((a) => a.id === p.app), who: view.who ?? "A business or team", problem: p.label })}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {view.kind === "result" && (
                <>
                  {view.app ? (
                    <div className="sherlock-result">
                      <span className="sherlock-result-icon">
                        <AppIcon app={view.app} />
                      </span>
                      <div>
                        <p className="sherlock-result-name">{view.app.name}</p>
                        <p className="sherlock-query">{view.app.tag}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="sherlock-text">Not sure yet is a fine place to start. A short call is the quickest way to find out.</p>
                  )}
                  {view.app && <p className="sherlock-text">{view.app.body}</p>}
                  <div className="sherlock-actions">
                    {view.app && (
                      <AppLink app={view.app} className="sherlock-primary">
                        Open {view.app.name}
                      </AppLink>
                    )}
                    <a className={view.app ? "sherlock-secondary" : "sherlock-primary"} href={BOOKING} target="_blank" rel="noopener noreferrer" onClick={() => recordBookingClick()}>
                      Book a call
                    </a>
                    <a className="sherlock-secondary" href={mailFor(view.app, view.who, view.problem)}>
                      Email my answers
                    </a>
                  </div>
                </>
              )}
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
          <button type="button" className="sherlock-cue-go" onClick={() => engage(location.pathname === "/explore/services" || location.pathname === "/explore/engagement" ? { kind: "fit", step: "who" } : { kind: "home" })}>
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
