import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, X } from "lucide-react";
import { findNode, type SiteNode } from "@/lib/siteTree";
import { matchNavigationIntent } from "@/lib/chatIntents";
import { contextQuestion, pageGuide } from "@/lib/sherlockGuide";
import { answerForIntent, findLocalSherlockIntent, intentById, shouldUseSemanticSherlockMatch, type SherlockIntent } from "@/lib/sherlockCorpus";
import { hasMetSherlock, hasOnce, isEvergreenHint, markMetSherlock, markOnce, recordBookingClick, useGuide } from "@/lib/guide";
import { GREETING_LINES, GREETING_REPLY, NODE_OPENER_LINES } from "@/lib/tone";
import { FADE, motionOr, SPRING_MORPH } from "@/lib/motion";
import { pushCommandHistory } from "@/lib/suggest";
import { setNavigatorSurfaceOpen } from "@/lib/navigatorSurface";
import { findTarget, pointAt } from "@/lib/ghostCursor";
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

// A small character instead of a terminal. It answers from the authored
// corpus, and "Show me" sends a second cursor to the real control on the page.
export function Sherlock() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [hello, setHello] = useState(false);
  const [status, setStatus] = useState("");
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const guide = useGuide(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const faceRef = useRef<HTMLButtonElement>(null);
  const cancelPoint = useRef<(() => void) | null>(null);
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
    setHello(false);
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
    pushCommandHistory(text);
    guide.noteSherlockQuestion(text);
    if (contextQuestion(text)) {
      const page = pageGuide(currentNode.path, guide.visited, guide.journey, guide.visitorMode);
      setAnswer({ query: text, text: page.text, node: page.next, children: page.choices });
      return;
    }
    const node = NAVIGATION_WORDS.test(text) ? matchNavigationIntent(text) : undefined;
    if (node) return setAnswer(nodeReply(node, text));
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
  // The second mouse: fly to the real control and click it. External links are
  // only pointed at, so a new tab never opens without the visitor's own click.
  const showMe = (node: SiteNode) => {
    const selector = selectorFor(node);
    const target = selector ? findTarget(selector) : null;
    dismiss();
    if (!target) {
      if (node.route) navigate(node.route);
      else openPage(node);
      return;
    }
    const box = faceRef.current?.getBoundingClientRect();
    const from = box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : { x: window.innerWidth - 40, y: window.innerHeight - 40 };
    cancelPoint.current?.();
    const external = node.kind === "link";
    setStatus(external ? "Here. It is yours to click." : "On it.");
    cancelPoint.current = pointAt(target, {
      from,
      click: !external,
      onDone: (result) => {
        cancelPoint.current = null;
        setStatus(result === "cancelled" ? "" : external ? "That is the one." : "");
      },
    });
  };

  useEffect(() => () => cancelPoint.current?.(), []);
  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(""), 3200);
    return () => window.clearTimeout(t);
  }, [status]);
  useEffect(() => {
    if (hasMetSherlock() || hasOnce("sherlock-invite-seen")) return;
    const show = window.setTimeout(() => setHello(true), 1400);
    const hide = window.setTimeout(() => setHello(false), 9000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
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
                {STARTERS.map((q) => (
                  <button key={q} type="button" className="sherlock-chip" onClick={() => void ask(q)}>
                    {q}
                  </button>
                ))}
              </div>
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
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && <motion.div key="tint" className="chat-edge-tint" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionOr(reducedMotion, FADE)} />}
      </AnimatePresence>
      {hello && !open && <span className="sherlock-hello" aria-hidden="true">Need a guide?</span>}
      {status && !open && <span className="sherlock-status" role="status">{status}</span>}
      <button ref={faceRef} type="button" className="sherlock-fab" aria-label={badgeName ?? "Open Sherlock"} aria-expanded={open} onClick={open ? dismiss : engage}>
        <SherlockFace thinking={thinking} />
        <SherlockBadge badge={guide.badge} open={open} />
      </button>
    </div>
  );
}
