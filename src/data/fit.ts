// The "Find my fit" flow. Questions branch by who the visitor is. Every reason
// in the result restates something the site already says, so nothing here
// promises more than the pages do.

export interface Option {
  value: string;
  label: string;
}
export interface Question {
  id: string;
  text: string;
  options: Option[];
}
export type Who = "business" | "public";

export const WHO: Option[] = [
  { value: "business", label: "A business or team" },
  { value: "public", label: "A public body: city, county, school, library" },
];

export const QUESTIONS: Record<Who, Question[]> = {
  business: [
    {
      id: "problem",
      text: "What is the biggest headache right now?",
      options: [
        { value: "hand", label: "Repetitive work people do by hand" },
        { value: "helper", label: "I want an AI helper working alongside my team" },
        { value: "disconnected", label: "Systems that do not talk to each other" },
        { value: "idea", label: "An idea for new software" },
        { value: "unsure", label: "I am not sure yet" },
      ],
    },
    {
      id: "where",
      text: "Where does this work live today?",
      options: [
        { value: "sheets", label: "Spreadsheets and email" },
        { value: "legacy", label: "One older system we depend on" },
        { value: "tools", label: "Several tools that do not connect" },
        { value: "new", label: "Nowhere yet, it is a new idea" },
      ],
    },
    {
      id: "people",
      text: "How many people touch it?",
      options: [
        { value: "few", label: "Just a few of us" },
        { value: "team", label: "A team, roughly 6 to 25 people" },
        { value: "many", label: "A department or the whole company" },
      ],
    },
    {
      id: "data",
      text: "How sensitive is the data involved?",
      options: [
        { value: "normal", label: "Ordinary business data" },
        { value: "personal", label: "Personal or customer data" },
        { value: "strict", label: "Confidential or regulated, or it must stay on our own hardware" },
      ],
    },
    {
      id: "timing",
      text: "How soon do you want to move?",
      options: [
        { value: "urgent", label: "As soon as possible" },
        { value: "quarter", label: "Within the next few months" },
        { value: "explore", label: "I am exploring for now" },
      ],
    },
  ],
  public: [
    {
      id: "need",
      text: "What does your organisation need?",
      options: [
        { value: "site", label: "A new website or a redesign" },
        { value: "fix", label: "To make our existing site accessible" },
        { value: "portal", label: "A records portal or workflow" },
        { value: "migrate", label: "To move content off an old system" },
        { value: "rfp", label: "Help answering an RFP" },
      ],
    },
    {
      id: "driver",
      text: "What is driving the timing?",
      options: [
        { value: "ada", label: "The ADA Title II accessibility deadline" },
        { value: "rfp", label: "An RFP or procurement with a due date" },
        { value: "budget", label: "A budget cycle" },
        { value: "none", label: "No fixed date yet" },
      ],
    },
    {
      id: "size",
      text: "How many people does your organisation serve?",
      options: [
        { value: "big", label: "50,000 or more" },
        { value: "small", label: "Fewer than 50,000, or a special district" },
        { value: "unsure", label: "Not sure" },
      ],
    },
    {
      id: "hosting",
      text: "Do you have a hosting requirement?",
      options: [
        { value: "us", label: "US hosting" },
        { value: "eu", label: "EU hosting" },
        { value: "none", label: "No requirement" },
        { value: "ask", label: "I am not sure what is allowed" },
      ],
    },
    {
      id: "buying",
      text: "How would you buy this?",
      options: [
        { value: "quote", label: "A quote from a single vendor" },
        { value: "rfp", label: "A formal RFP" },
        { value: "unknown", label: "Not decided yet" },
      ],
    },
  ],
};

export type Answers = Record<string, string>;

export interface Recommendation {
  /** App id from APPS, or undefined when a call is the right first step. */
  app?: "agents" | "build" | "public";
  headline: string;
  reasons: string[];
  bring: string[];
  note?: string;
}

const labelOf = (who: Who, id: string, value: string | undefined) => QUESTIONS[who].find((q) => q.id === id)?.options.find((o) => o.value === value)?.label ?? "";

export function summaryLines(who: Who, answers: Answers): string[] {
  const lines = [`Who it is for: ${WHO.find((w) => w.value === who)?.label}`];
  for (const q of QUESTIONS[who]) {
    const label = labelOf(who, q.id, answers[q.id]);
    if (label) lines.push(`${q.text} ${label}`);
  }
  return lines;
}

export function recommend(who: Who, a: Answers): Recommendation {
  if (who === "public") {
    const reasons: string[] = [];
    const need: Record<string, string> = {
      site: "Public builds accessible websites that are checked against WCAG 2.1 AA before handover.",
      fix: "An existing site can be assessed first: the free written assessment covers your current site's accessibility and privacy.",
      portal: "Records portals and workflows are one of the three things Public builds, with role based access and MFA for staff.",
      migrate: "Migration and remediation is part of Public: moving content off a legacy system, or fixing the accessibility of what you have.",
      rfp: "Public has an RFP builder and a compliance matrix, so your answers and the evidence you will receive are ready to copy.",
    };
    if (need[a.need]) reasons.push(need[a.need]);
    if (a.hosting === "us" || a.hosting === "eu") reasons.push(`Hosting is in the ${a.hosting === "us" ? "US" : "EU"} region you choose, agreed before implementation starts.`);
    if (a.hosting === "ask") reasons.push("Hosting region is agreed with you before implementation starts, so it is part of the first conversation.");
    if (a.buying === "rfp") reasons.push("For a formal RFP, the procurement page shows what to send and what you get back.");
    if (a.buying === "quote") reasons.push("For a quote, send the scope by email and you get scope and timing back. The price in your bid holds through delivery.");
    let note: string | undefined;
    if (a.driver === "ada" || a.size) {
      note =
        a.size === "big"
          ? "Under the ADA Title II web rule your date is April 26, 2027. That date comes from the Justice Department's April 2026 rule, so check ADA.gov for updates."
          : a.size === "small"
            ? "Under the ADA Title II web rule your date is April 26, 2028. That date comes from the Justice Department's April 2026 rule, so check ADA.gov for updates."
            : "Under the ADA Title II web rule the date depends on size: April 26, 2027 for 50,000 or more, April 26, 2028 for smaller entities and special districts. Check ADA.gov for updates.";
    }
    return {
      app: "public",
      headline: "Anviq Public fits",
      reasons,
      bring: ["Your organisation", "The RFP, or a summary of the scope", "Your deadline", "Any hosting requirement"],
      note,
    };
  }

  const reasons: string[] = [];
  const problem: Record<string, string> = {
    hand: "Repetitive hand work is what AI teammates with memory, routines and tools are for.",
    helper: "Anviq Agents are persistent AI teammates that do real work inside a business, with memory, routines and tools.",
    disconnected: "Connecting systems that do not talk to each other is core to Build: integration with what you already run.",
    idea: "A new idea starts with a written plan from the free assessment, before anything is built.",
  };
  if (problem[a.problem]) reasons.push(problem[a.problem]);
  const where: Record<string, string> = {
    sheets: "Spreadsheets and email are a common starting point. The assessment maps the workflow and systems end to end.",
    legacy: "Working with an older system is normal. The assessment looks at how it fits before anything is changed.",
    tools: "Tools that do not connect are where handoffs break. Finding that point is the first part of the assessment.",
  };
  if (where[a.where]) reasons.push(where[a.where]);
  if (a.people === "many") reasons.push("With many people involved there are more handoffs, and mapping them is part of the assessment.");
  if (a.data === "personal") reasons.push("With personal or customer data, hosting region, access controls and data handling are agreed with you before implementation starts.");
  if (a.data === "strict") reasons.push("If it must stay on your hardware, Anviq Agents can run on hardware you control, on-prem or air-gapped, with audit logging.");
  if (a.timing === "urgent") reasons.push("Since you want to move soon, the quickest first step is the free written assessment.");

  const agents = a.problem === "hand" || a.problem === "helper";
  const sensitiveAgents = a.data === "strict" && a.problem !== "idea" && a.problem !== "disconnected";
  const app = a.problem === "unsure" ? undefined : agents || sensitiveAgents ? "agents" : "build";
  return {
    app,
    headline: app === "agents" ? "Anviq Agents fits best" : app === "build" ? "Anviq Build fits best" : "A short call is the right first step",
    reasons: reasons.length ? reasons : ["Not sure yet is a fine place to start. A short call is the quickest way to find out."],
    bring: ["A real example of the process", "The tools and systems involved", "Who touches it today"],
  };
}
