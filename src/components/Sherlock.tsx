import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, X } from "lucide-react";
import { findNode, type SiteNode } from "@/lib/siteTree";
import { matchNavigationIntent } from "@/lib/chatIntents";
import { contextQuestion, pageGuide } from "@/lib/sherlockGuide";
import { answerForIntent, findLocalSherlockIntent, intentById, shouldUseSemanticSherlockMatch, type SherlockIntent } from "@/lib/sherlockCorpus";
import { hasOnce, isEvergreenHint, markMetSherlock, markOnce, recordBookingClick, useGuide } from "@/lib/guide";
import { GREETING_LINES, GREETING_REPLY, NODE_OPENER_LINES } from "@/lib/tone";
import { FADE, motionOr, SPRING_MORPH } from "@/lib/motion";
import { pushQuestionHistory } from "@/lib/suggest";
import { setNavigatorSurfaceOpen } from "@/lib/navigatorSurface";
import { findTarget, runRoute, type Step } from "@/lib/ghostCursor";
import { createPet, type Pet } from "@/lib/sherlockPet";
import { APPS } from "@/data/content";
import { SherlockBadge } from "@/components/SherlockBadge";
import { SherlockFace } from "@/components/SherlockFace";

interface Answer {
  query?: string;
  text?: string;
  persona?: string;
  node?: SiteNode;
  children?: SiteNode[];
}

const NAVIGATION_WORDS = /\b(open|show|take|go|browse|navigate|read|visit|book|schedule|meet|call)\b/i;
const STARTERS = ["What can you build?", "How much does it cost?", "How do we get started?"];

function selectorFor(node: SiteNode): string | null {
  if (node.route) return `a[href="${node.route}"]`;
  if (node.href) return `a[href^="${new URL(node.href).origin}"]`;
  return null;
}

// The cursor only ever goes to controls that are on screen. When a page is not
// directly linked (the phone layout has just three tabs), it goes through the
// Browse tab first, so it never has to teleport.
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

// A tour of whatever page the visitor is on: its headings in order, then the
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

interface Nudge {
  text: string;
  actions: { label: string; run: () => void }[];
}
interface NudgeState {
  count?: number;
  pages?: string[];
  off?: boolean;
}
const NUDGE_KEY = "sherlock-nudges";
const readNudges = (): NudgeState => {
  try {
    return JSON.parse(sessionStorage.getItem(NUDGE_KEY) ?? "{}") as NudgeState;
  } catch {
    return {};
  }
};
const writeNudges = (state: NudgeState) => {
  try {
    sessionStorage.setItem(NUDGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing may deny storage; nudges then repeat per load.
  }
};

// A small character instead of a terminal. It answers from the authored
// corpus, and "Show me" sends a second cursor to the real control on the page.
export function Sherlock() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const guide = useGuide(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const faceRef = useRef<HTMLButtonElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const pet = useRef<Pet | null>(null);
  const route = useRef<{ cancel: () => void } | null>(null);
  const [follow, setFollow] = useState(() => { try { return localStorage.getItem("sherlock-follow") !== "off"; } catch { return true; } });
  const injectedHint = useRef<string | null>(null);
  const requestNumber = useRef(0);
  const titleId = useId();
  const inputId = `${titleId}-input`;
  const currentNode = findNode(location.pathname.replace("/explore", "")) ?? findNode("/")!;

  const introFor = (): string | undefined => {
    if (hasOnce("greeting")) return undefined;
    markOnce("greeting");
    return GREETING_LINES.join("\n");
  };
  const openerFor = (node: SiteNode): string | undefined => {
    if (!node.route) return undefined;
    const onceId = `opener:${node.route}`;
    const line = NODE_OPENER_LINES[node.route];
    if (!line || hasOnce(onceId)) return undefined;
    markOnce(onceId);
    return line;
  };
  const nodeReply = (node: SiteNode, query: string): Answer => ({ query, text: node.summary, persona: introFor() ?? openerFor(node), node, children: node.kind === "folder" ? node.children : undefined });
  const intentReply = (intent: SherlockIntent, query: string): Answer => ({ query, text: answerForIntent(intent, query), persona: introFor(), node: intent.route ? findNode(intent.route.replace("/explore", "")) ?? findNode(intent.route) : undefined });
  const fallback = (query: string): Answer => ({ query, text: answerForIntent(intentById("fallback")!, query) });

  const engage = () => {
    if (open) return;
    window.dispatchEvent(new Event("anviq:navigator-open"));
    setNavigatorSurfaceOpen(true);
    markMetSherlock();
    markOnce("sherlock-invite-seen");
    setNudge(null);
    setOpen(true);
    const page = pageGuide(currentNode.path, guide.visited, guide.journey, guide.visitorMode);
    setAnswer({ text: page.text, persona: introFor() ?? GREETING_REPLY, node: page.next, children: page.choices });
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };
  const dismiss = () => {
    requestNumber.current += 1;
    setNavigatorSurfaceOpen(false);
    guide.close();
    setOpen(false);
    setAnswer(null);
    setThinking(false);
    setInput("");
  };

  const ask = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setInput("");
    pushQuestionHistory(text);
    guide.noteSherlockQuestion(text);
    if (contextQuestion(text)) {
      const page = pageGuide(currentNode.path, guide.visited, guide.journey, guide.visitorMode);
      setAnswer({ query: text, text: page.text, node: page.next, children: page.choices });
      return;
    }
    const node = NAVIGATION_WORDS.test(text) ? matchNavigationIntent(text) : undefined;
    if (node) {
      const steps = routeFor(node);
      if (steps) {
        dismiss();
        return showMe(node);
      }
      return setAnswer(nodeReply(node, text));
    }
    const local = findLocalSherlockIntent(text);
    if (local) return setAnswer(intentReply(local, text));
    if (!shouldUseSemanticSherlockMatch(text)) return setAnswer(fallback(text));
    const request = ++requestNumber.current;
    setThinking(true);
    setAnswer({ query: text, text: "One moment. I am comparing the evidence.", persona: introFor() });
    try {
      const response = await fetch("/api/sherlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text }) });
      const result = (await response.json()) as { intent?: string };
      const intent = result.intent ? intentById(result.intent) : undefined;
      if (request === requestNumber.current) setAnswer(intent ? intentReply(intent, text) : fallback(text));
    } catch {
      if (request === requestNumber.current) setAnswer(fallback(text));
    } finally {
      if (request === requestNumber.current) setThinking(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(input);
  };

  const openPage = (node: SiteNode) => {
    if (node.kind === "link" && node.href) {
      if (node.href.includes("calendly.com")) recordBookingClick();
      window.open(node.href, "_blank", "noopener,noreferrer");
    } else if (node.route) navigate(node.route);
    dismiss();
  };
  // The second mouse: the character leaves its spot and the cursor flies to the
  // real control and clicks it. External links are only pointed at, so a new tab
  // never opens without the visitor's own click.
  const play = (steps: Step[]) => {
    route.current?.cancel();
    const box = faceRef.current?.getBoundingClientRect();
    const from = box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : { x: window.innerWidth - 40, y: window.innerHeight - 40 };
    const run = runRoute(steps, { from, onMove: (x, y) => pet.current?.follow(x, y) });
    route.current = run;
    void run.finished.then(() => {
      if (route.current === run) route.current = null;
      pet.current?.release();
    });
  };
  const showMe = (node: SiteNode) => {
    const steps = routeFor(node);
    dismiss();
    if (steps) return play(steps);
    openPage(node);
  };
  const tour = () => {
    dismiss();
    const steps = tourFor(location.pathname);
    if (steps.length) play(steps);
  };

  useEffect(() => {
    const el = petRef.current;
    const homeEl = homeRef.current;
    if (!el || !homeEl) return;
    const controller = createPet(el, () => {
      const r = homeEl.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    pet.current = controller;
    return () => {
      route.current?.cancel();
      controller.destroy();
      pet.current = null;
    };
  }, []);
  useEffect(() => {
    pet.current?.setHome(open);
  }, [open]);
  useEffect(() => {
    pet.current?.setEnabled(follow);
    try { localStorage.setItem("sherlock-follow", follow ? "on" : "off"); } catch { /* storage may be blocked */ }
  }, [follow]);
  const closeNudge = (stopAll = false) => {
    setNudge(null);
    pet.current?.hold(false);
    if (stopAll) writeNudges({ ...readNudges(), off: true });
  };
  useEffect(() => {
    if (open) {
      setNudge(null);
      return;
    }
    const state = readNudges();
    const path = location.pathname;
    if (state.off || (state.count ?? 0) >= 3 || state.pages?.includes(path)) return;
    const timer = window.setTimeout(() => {
      if (document.activeElement?.tagName === "INPUT" || route.current) return;
      const first = hasOnce("sherlock-invite-seen") ? undefined : "Hi, I'm Sherlock. Want a quick tour? I will drive.";
      const tourAction = { label: "Show me around", run: () => { closeNudge(); tour(); } };
      const askAction = { label: "Ask me", run: () => { closeNudge(); engage(); } };
      const byPage: Record<string, Nudge> = {
        "/": { text: first ?? "Not sure where to start? Pick the app that fits and I will show you.", actions: [tourAction, askAction] },
        "/explore/services": { text: "Not sure which one fits? Tell me the problem and I will point you to it.", actions: [askAction, tourAction] },
        "/explore/projects": { text: "Want to see one up close? I can open one for you.", actions: [{ label: "Open one", run: () => { closeNudge(); play([{ selector: 'a[href^="/projects/"]', click: true, caption: "Opening a project" }]); } }, askAction] },
      };
      const picked = byPage[path] ?? { text: "Looking for something? I can take you there.", actions: [tourAction, askAction] };
      const latest = readNudges();
      writeNudges({ count: (latest.count ?? 0) + 1, pages: [...(latest.pages ?? []), path], off: false });
      markOnce("sherlock-invite-seen");
      setNudge(picked);
      pet.current?.hold(true);
    }, (state.count ?? 0) === 0 ? 4500 : 10000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, open]);
  useEffect(() => {
    if (!nudge) return;
    const timer = window.setTimeout(() => closeNudge(), 14000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nudge]);
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
  useEffect(() => {
    if (!open || !guide.hint || isEvergreenHint(guide.hint) || injectedHint.current === guide.hint) return;
    injectedHint.current = guide.hint;
    setAnswer({ text: guide.hint });
    guide.dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guide.hint]);

  const badgeName = guide.badge.count > 0 ? guide.badge.name : undefined;
  const hasChoices = !!answer?.children?.length;

  return (
    <div className={`sherlock${open ? " is-open" : ""}`}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            className="sherlock-panel"
            role="dialog"
            aria-labelledby={`${titleId}-title`}
            initial={reducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.97 }}
            transition={motionOr(reducedMotion, SPRING_MORPH)}
          >
            <div className="sherlock-head">
              <span id={`${titleId}-title`}>Sherlock</span>
              <button type="button" className="icon-button" aria-label="Close Sherlock" onClick={dismiss}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="sherlock-body" role="status" aria-live="polite">
              {answer?.query && <p className="sherlock-query">{answer.query}</p>}
              {answer?.text && <p className="sherlock-text">{answer.text}</p>}
              {answer?.persona && (
                <p className="sherlock-persona">{answer.persona}</p>
              )}
              {answer?.node && (
                <div className="sherlock-actions">
                  <button type="button" className="sherlock-show" onClick={() => showMe(answer.node!)}>
                    Show me
                  </button>
                  <button type="button" className="sherlock-open" onClick={() => openPage(answer.node!)}>
                    Open {answer.node.name}
                  </button>
                </div>
              )}
              {hasChoices && (
                <div className="sherlock-chips">
                  {answer!.children!.map((child) => (
                    <button key={child.path} type="button" className="sherlock-chip" onClick={() => setAnswer(nodeReply(child, child.name))}>
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="sherlock-chips sherlock-starters">
                <button type="button" className="sherlock-chip sherlock-tour" onClick={tour}>
                  Show me around
                </button>
                {STARTERS.map((q) => (
                  <button key={q} type="button" className="sherlock-chip" onClick={() => void ask(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <label className="sherlock-follow">
              <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
              <span>Follow my cursor</span>
            </label>
            <form className="sherlock-form" onSubmit={submit}>
              <label htmlFor={inputId} className="sr-only">
                Ask Sherlock about Anviq
              </label>
              <input id={inputId} ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Or type a question" autoComplete="off" spellCheck={false} />
              <button type="submit" className="sherlock-send" aria-label="Ask" disabled={!input.trim()}>
                <ArrowUp size={18} aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && <motion.div key="tint" className="chat-edge-tint" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionOr(reducedMotion, FADE)} />}
      </AnimatePresence>
      <div ref={homeRef} className="sherlock-home" aria-hidden="true" />
      <div ref={petRef} className="sherlock-pet" data-side="r" data-edge="b">
        {nudge && !open && (
          <div className="sherlock-nudge" role="region" aria-label="Sherlock suggestion">
            <p>{nudge.text}</p>
            <div className="sherlock-nudge-actions">
              {nudge.actions.map((action) => (
                <button key={action.label} type="button" className="sherlock-nudge-go" onClick={action.run}>
                  {action.label}
                </button>
              ))}
              <button type="button" className="sherlock-nudge-quiet" onClick={() => closeNudge(true)}>
                Not now
              </button>
            </div>
          </div>
        )}
        <button ref={faceRef} type="button" className="sherlock-fab" aria-label={badgeName ?? "Open Sherlock"} aria-expanded={open} onClick={open ? dismiss : engage}>
          <SherlockFace thinking={thinking} />
          <SherlockBadge badge={guide.badge} open={open} />
        </button>
      </div>
    </div>
  );
}
