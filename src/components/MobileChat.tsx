import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, SquareTerminal, X } from "lucide-react";
import { findNode, type SiteNode } from "@/lib/siteTree";
import { matchNavigationIntent } from "@/lib/chatIntents";
import { contextQuestion, pageGuide } from "@/lib/sherlockGuide";
import { answerForIntent, findLocalSherlockIntent, intentById, shouldUseSemanticSherlockMatch, type SherlockIntent } from "@/lib/sherlockCorpus";
import { EXAMPLE_HINT, hasOnce, isEvergreenHint, markMetSherlock, markOnce, recordBookingClick, tryPersona, useGuide } from "@/lib/guide";
import { GREETING_LINES, GREETING_REPLY, NODE_OPENER_LINES } from "@/lib/tone";
import { FADE, motionOr, SPRING_MORPH } from "@/lib/motion";
import { pushCommandHistory } from "@/lib/suggest";
import { setNavigatorSurfaceOpen } from "@/lib/navigatorSurface";
import { SherlockBadge } from "@/components/SherlockBadge";
import { TypedPersonaLine } from "@/components/TypedPersonaLine";

interface Answer { query?: string; text?: string; persona?: string; node?: SiteNode; children?: SiteNode[]; }
const NAVIGATION_WORDS = /\b(open|show|take|go|browse|navigate|read|visit|book|schedule|meet|call|öffne|zeige|geh)\b/i;

// Mobile starts as a compact, badged FAB and expands into the existing
// focused search surface. Desktop keeps its terminal entirely unchanged.
export function MobileChat() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [input, setInput] = useState("");
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const guide = useGuide(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const unmatchedCount = useRef(0);
  const injectedHint = useRef<string | null>(null);
  const [hasAsked, setHasAsked] = useState(false);
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
  const hasPendingOpener = (node: SiteNode) => !!node.route && !!NODE_OPENER_LINES[node.route] && !hasOnce(`opener:${node.route}`);
  const askNode = (label: string, node: SiteNode) => { setHasAsked(true); setAnswer(nodeReply(node, label)); };

  const engage = () => {
    if (open) return;
    window.dispatchEvent(new Event("anviq:navigator-open"));
    setNavigatorSurfaceOpen(true);
    markMetSherlock();
    markOnce("sherlock-invite-seen");
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
    setHasAsked(false);
    inputRef.current?.blur();
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushCommandHistory(text);
    setHasAsked(true);
    guide.noteSherlockQuestion(text);
    if (contextQuestion(text)) {
      const page = pageGuide(currentNode.path, guide.visited, guide.journey, guide.visitorMode);
      setAnswer({ query: text, text: page.text, node: page.next, children: page.choices });
      return;
    }
    // Action requests take the visitor to the actual page. Questions such as
    // "what services do you offer?" still reach Sherlock's authored corpus.
    const node = NAVIGATION_WORDS.test(text) ? matchNavigationIntent(text) : undefined;
    if (node) { unmatchedCount.current = 0; setAnswer(nodeReply(node, text)); return; }
    const localIntent = findLocalSherlockIntent(text);
    if (localIntent) { unmatchedCount.current = 0; setAnswer(intentReply(localIntent, text)); return; }
    if (!shouldUseSemanticSherlockMatch(text)) {
      setAnswer({ query: text, text: answerForIntent(intentById("fallback")!, text) });
      return;
    }
    const request = ++requestNumber.current;
    unmatchedCount.current += 1;
    const rescue = unmatchedCount.current >= 2 && tryPersona("cmd-unknown-rescue") ? EXAMPLE_HINT : undefined;
    setAnswer({ query: text, text: "One moment. I am comparing the evidence.", persona: introFor() ?? rescue });
    try {
      const response = await fetch("/api/sherlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text }) });
      const result = (await response.json()) as { intent?: string };
      const intent = result.intent ? intentById(result.intent) : undefined;
      if (request === requestNumber.current) setAnswer(intent ? intentReply(intent, text) : { query: text, text: answerForIntent(intentById("fallback")!, text) });
    } catch {
      if (request === requestNumber.current) setAnswer({ query: text, text: answerForIntent(intentById("fallback")!, text) });
    }
  };
  const openPage = (node: SiteNode) => {
    if (node.kind === "link" && node.href) { if (node.href.includes("calendly.com")) recordBookingClick(); window.open(node.href, "_blank", "noopener,noreferrer"); }
    else if (node.route) navigate(node.route);
    dismiss();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); dismiss(); } };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onLightboxOpen = () => dismiss();
    window.addEventListener("anviq:lightbox-open", onLightboxOpen);
    return () => window.removeEventListener("anviq:lightbox-open", onLightboxOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    if (!open || !hasAsked || !guide.hint || isEvergreenHint(guide.hint) || injectedHint.current === guide.hint) return;
    injectedHint.current = guide.hint;
    setAnswer({ text: guide.hint });
    guide.dismiss();
  // guide is intentionally decomposed to its stateful hint; dismissing it
  // advances that state and should not retrigger this response.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasAsked, guide.hint]);

  const evergreen = !answer && open && hasAsked && guide.hint && isEvergreenHint(guide.hint) ? guide.hint : null;
  const panel = answer ?? (evergreen ? { text: evergreen } : null);
  const badgeName = guide.badge.count > 0 ? guide.badge.name : undefined;

  return <>
    <AnimatePresence>{open && <motion.div key="edge-tint" className="chat-edge-tint" aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionOr(reducedMotion, FADE)} />}</AnimatePresence>
    <div className={`chat-bar-anchor${open ? " is-open" : " is-closed"}`}>
      <AnimatePresence>{panel && <motion.div key={answer ? (answer.query ?? answer.text ?? "answer") : "evergreen"} className="chat-answer" role="status" aria-live="polite" ref={(el) => { if (el) el.scrollTop = 0; }} initial={reducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: 6, scale: 0.98 }} transition={motionOr(reducedMotion, SPRING_MORPH)}>
        <button type="button" className="icon-button chat-answer-dismiss" aria-label="Close Sherlock" onClick={dismiss}><X size={16} aria-hidden="true" /></button>
        {answer?.query && <p className="chat-answer-query">{answer.query}</p>}
        {panel.text && <p>{panel.text}</p>}
        {panel === answer && answer?.persona && <p className="chat-persona"><span aria-hidden="true">›</span> <TypedPersonaLine text={answer.persona} reducedMotion={reducedMotion} /></p>}
        {answer?.node && <button type="button" className="chat-open-button" onClick={() => openPage(answer.node!)}>Open {answer.node.name}</button>}
        {answer?.children && <div className="chat-chip-row">{answer.children.map((child) => child.kind === "folder" || hasPendingOpener(child) ? <button key={child.path} type="button" className="chat-chip" onClick={() => askNode(child.name, child)}>{child.name}</button> : <button key={child.path} type="button" className="chat-chip" onClick={() => openPage(child)}>{child.name}</button>)}</div>}
      </motion.div>}</AnimatePresence>
      <AnimatePresence initial={false} mode="wait">{open ? <motion.form key="search" className="chat-bar" onSubmit={submit} initial={reducedMotion ? undefined : { opacity: 0, scaleX: 0.45 }} animate={{ opacity: 1, scaleX: 1 }} exit={reducedMotion ? undefined : { opacity: 0, scaleX: 0.45 }} transition={motionOr(reducedMotion, SPRING_MORPH)} style={{ transformOrigin: "right center" }}>
        <span className="chat-bar-mark"><SquareTerminal size={20} aria-hidden="true" /></span>
        <label htmlFor={inputId} className="sr-only">Ask Sherlock about Anviq</label>
        <input id={inputId} ref={inputRef} type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Sherlock" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
        {input.trim() && <button type="submit" className="chat-send" aria-label="Ask"><ArrowUp size={18} aria-hidden="true" /></button>}
      </motion.form> : <motion.button key="fab" type="button" className="chat-fab" aria-label={badgeName ?? "Open Sherlock"} onClick={engage} initial={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }} transition={motionOr(reducedMotion, SPRING_MORPH)}><SquareTerminal size={22} aria-hidden="true" /><span className="sherlock-invite" aria-hidden="true">Ask Sherlock</span><SherlockBadge badge={guide.badge} open={false} /></motion.button>}</AnimatePresence>
    </div>
  </>;
}
