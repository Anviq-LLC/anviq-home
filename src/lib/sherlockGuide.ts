import { findNode, type SiteNode } from "@/lib/siteTree";
import { preferredPathsFor, type VisitorMode } from "@/lib/sherlockJourney";

type GuideStep = { path: string; reason: string };

const STATE_REASONS: Record<string, string> = {
  "/services": "map the operational problem to the work",
  "/projects": "inspect comparable evidence",
  "/constraints": "inspect the safeguards before discussing a build",
  "/engagement": "see how an assessment and delivery begin",
  "/contact/calendly": "discuss the case directly",
  "/questions": "clear the practical buying questions",
};

// The site is a portfolio, but a prospective client should not need to be
// fluent in software to understand its relevance. These are sales-oriented
// explanations of the real pages, not additional product claims.
const PAGE_GUIDANCE: Record<string, { plain: string; next: GuideStep[] }> = {
  "/": {
    plain: "This is the front door. Anviq helps businesses turn a fragile operational process into software that can actually be run and owned.",
    next: [
      { path: "/projects", reason: "see proof from real systems" },
      { path: "/services", reason: "start with the problem you need solved" },
      { path: "/contact/calendly", reason: "discuss your case directly" },
    ],
  },
  "/projects": {
    plain: "Selected work is the evidence shelf: five real systems, each showing the operational problem, the boundary, and how it was handled.",
    next: [
      { path: "/services", reason: "map a comparable problem to the work Anviq does" },
      { path: "/approach", reason: "see how a similar system is delivered" },
      { path: "/contact/calendly", reason: "talk through a comparable case" },
    ],
  },
  "/projects/agents": {
    plain: "Anviq Agents are software teammates that do real business work, while risky code remains isolated and consequential production actions remain human-approved.",
    next: [
      { path: "/constraints", reason: "inspect the safety and ownership boundaries" },
      { path: "/services", reason: "see how this kind of work fits an engagement" },
      { path: "/contact/calendly", reason: "discuss a safe AI use case" },
    ],
  },
  "/projects/steadyward": {
    plain: "Steadyward shows a system that spots a retention risk early, alerts the people responsible, and deliberately cannot trade or move money.",
    next: [
      { path: "/constraints", reason: "see why clear operating boundaries matter" },
      { path: "/services", reason: "connect the case to your own workflow" },
      { path: "/contact/calendly", reason: "discuss a read-only alerting case" },
    ],
  },
  "/projects/lv-matching": {
    plain: "LV Matching turns repetitive construction matching into a reviewable process: people see confidence, decide each match, and retain an audit trail.",
    next: [
      { path: "/constraints", reason: "inspect its data and decision safeguards" },
      { path: "/services", reason: "see how a similar workflow could be improved" },
      { path: "/contact/calendly", reason: "discuss an auditable workflow" },
    ],
  },
  "/projects/addreach": {
    plain: "Addreach is outreach infrastructure that makes eligibility, timing, deliverability, and compliance part of the sending process instead of an afterthought.",
    next: [
      { path: "/constraints", reason: "see the delivery boundaries behind the case" },
      { path: "/services", reason: "connect it to your own handoffs" },
      { path: "/contact/calendly", reason: "talk through an outreach workflow" },
    ],
  },
  "/projects/recruitment-crm": {
    plain: "The recruitment CRM connects CV intake, matching, outreach, and placement while keeping legally sensitive decisions deterministic and records separated.",
    next: [
      { path: "/constraints", reason: "inspect the compliance and data boundaries" },
      { path: "/services", reason: "see how a complex workflow begins" },
      { path: "/contact/calendly", reason: "discuss a regulated workflow" },
    ],
  },
  "/services": {
    plain: "What we do is the translation page: software and automation remove brittle manual work, integration reconnects systems that do not talk, and infrastructure makes the result operable.",
    next: [
      { path: "/projects", reason: "see these ideas proven in real cases" },
      { path: "/approach", reason: "see what delivery looks like" },
      { path: "/contact/calendly", reason: "test whether your problem is a fit" },
    ],
  },
  "/approach": {
    plain: "Approach is the delivery method: understand the real operation, make the important boundaries explicit, then produce a system your team can run and own.",
    next: [
      { path: "/engagement", reason: "see what each stage includes" },
      { path: "/constraints", reason: "inspect the safeguards before a build starts" },
      { path: "/contact/calendly", reason: "talk through your first assessment" },
    ],
  },
  "/engagement": {
    plain: "Engagement makes the commercial path concrete: a mostly free assessment produces a plan, Build delivers an agreed scope, and Retain keeps support available as the system evolves.",
    next: [
      { path: "/contact/calendly", reason: "choose a time for the assessment conversation" },
      { path: "/questions", reason: "clear any practical concern first" },
      { path: "/projects", reason: "return to the evidence" },
    ],
  },
  "/constraints": {
    plain: "Constraints is the operating agreement: who can access what, where data lives, what the system may decide, and what is handed over.",
    next: [
      { path: "/questions", reason: "resolve the practical details" },
      { path: "/engagement", reason: "see how those boundaries become an engagement" },
      { path: "/contact/calendly", reason: "discuss your specific requirements" },
    ],
  },
  "/questions": {
    plain: "Questions answers the practical buying concerns: who does the work, where data lives, what the client owns, and how an assessment starts.",
    next: [
      { path: "/engagement", reason: "see the working model in full" },
      { path: "/contact/calendly", reason: "get a direct answer for your case" },
      { path: "/projects", reason: "inspect supporting evidence" },
    ],
  },
  "/about": {
    plain: "About explains Anviq and the person accountable for the work. The Anviq team leads it, with the commercial context kept next to the technical delivery.",
    next: [
      { path: "/projects", reason: "see that accountability in the work" },
      { path: "/activity", reason: "inspect the public evidence trail" },
      { path: "/contact/calendly", reason: "start a direct conversation" },
    ],
  },
  "/activity": {
    plain: "Activity is the public evidence trail. It is useful supporting proof, while Selected work explains the operating problems and outcomes behind it.",
    next: [
      { path: "/projects", reason: "see the work in context" },
      { path: "/about", reason: "know the company behind it" },
      { path: "/contact/calendly", reason: "discuss a real need" },
    ],
  },
};

function priorPage(path: string, visited: ReadonlySet<string>, journey?: readonly string[]): SiteNode | undefined {
  const currentIndex = journey?.lastIndexOf(path) ?? -1;
  if (currentIndex > 0) return findNode(journey![currentIndex - 1]!);
  const trail = [...visited].filter((visitedPath) => visitedPath !== path);
  return trail.length ? findNode(trail[trail.length - 1]!) : undefined;
}

export function contextQuestion(query: string): boolean {
  return /\b(where am i|what is this|this page|tell me more|more about this|explain this|where next|what next|what should i see|suggest a page|why does this matter|what does this mean)\b/i.test(query);
}

export function pageGuide(path: string, visited: ReadonlySet<string>, journey?: readonly string[], visitorMode: VisitorMode = "exploring") {
  const node = findNode(path) ?? findNode("/")!;
  const guidance = PAGE_GUIDANCE[node.path] ?? PAGE_GUIDANCE["/"];
  const unseen = guidance.next.filter(({ path: nextPath }) => !visited.has(nextPath));
  const available = unseen.length ? unseen : guidance.next;
  const preferred = preferredPathsFor(visitorMode);
  const stateStep = preferred
    .map((path) => findNode(path) && ({ path, reason: STATE_REASONS[path] ?? "continue the case" }))
    .find(Boolean);
  const step = stateStep ?? available[0]!;
  const next = findNode(step.path)!;
  const choices = guidance.next
    .map(({ path }) => findNode(path))
    .filter((choice): choice is SiteNode => Boolean(choice) && choice?.path !== next.path);
  const previous = priorPage(node.path, visited, journey);
  const cameFrom = previous ? ` You came here from ${previous.name}.` : "";
  return {
    node,
    next,
    choices,
    previous,
    reason: step.reason,
    summary: guidance.plain.split(".")[0]!,
    text: `${guidance.plain}${cameFrom} Next, ${next.name}: ${step.reason}.`,
  };
}
