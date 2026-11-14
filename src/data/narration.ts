// What Sherlock says when he walks a visitor through a page. Each line comes
// from the page's own copy, in plain spoken words. `find` matches a heading;
// `selector` points at any other element.

export interface Say {
  find?: string;
  selector?: string;
  say: string;
}

export const NARRATION: Record<string, Say[]> = {
  "/": [
    { find: "Systems built to hold", say: "Hi, I'm Sherlock. This is Anviq: IT consulting and software. The Anviq team leads the work, and the idea is simple. Take a fragile process and turn it into software your business can actually run and own." },
    { find: "What we do", say: "Here is the quickest way to see what Anviq does. Three apps, and you pick the one that fits." },
    { selector: ".apps-grid > a:nth-child(1)", say: "Anviq Agents are AI helpers for your team, with memory, routines and tools." },
    { selector: ".apps-grid > a:nth-child(2)", say: "Anviq Build is custom software, for a workflow you already have." },
    { selector: ".apps-grid > a:nth-child(3)", say: "Anviq Public is for government: accessible websites, portals and migrations." },
    { find: "Selected work", say: "Below that is real work. Anviq Agents and LV Matching are the two worth a look first." },
  ],
  "/explore/services": [
    { find: "What we do", say: "Same three apps, in more detail. In short: custom software, integration with what you already run, and infrastructure with agreed access controls. AI is used where it earns its place, not by default." },
    { find: "Anviq Agents", say: "Agents are AI teammates that keep memory, run routines and use tools. Anything risky runs in its own isolated machine, on hardware the business controls." },
    { find: "Anviq Build", say: "Build is the custom side. Software and automation for a workflow you already have, connected to the systems you already run." },
    { find: "Anviq Public", say: "Public is for public bodies. Accessible websites, records portals and migrations, with the audit documents a procurement asks for." },
  ],
  "/explore/projects": [
    { find: "Selected work", say: "These are real builds, and each one has notes on how it was made." },
    { find: "Anviq Agents", say: "Agents does real work inside a business. It has memory, routines and tools, and risky code runs in an isolated machine on hardware the business controls." },
    { find: "LV Matching", say: "LV Matching matches construction bills of quantities for several tenants at once. Sign-in is hosted in the EU, and the data handling is built for GDPR from the start." },
  ],
  "/explore/approach": [
    { find: "The shape of the work", say: "This is how the work runs. It starts with how your operation actually works, not with a category of service." },
    { find: "Assess", say: "Step one is the assessment. Map the people, the systems and the handoffs, and find the point that really breaks. Build, deploy and handover follow." },
  ],
  "/explore/engagement": [
    { find: "Working together", say: "Every engagement starts with a scoped technical assessment, before you commit to building anything." },
    { find: "Assessment", say: "The assessment is a short review of your workflow and systems, with a fixed scope. It ends in a written plan. It is free, and no code is changed." },
  ],
  "/explore/constraints": [
    { find: "How this is operated", say: "These are the boundaries agreed before anything is built: access, data, decisions and ownership." },
    { find: "Ownership", say: "On ownership, the code, configuration and documentation are handed over as part of delivery, as agreed in the scope." },
  ],
  "/explore/questions": [
    { find: "Common questions", say: "These are the things people ask first. For example, who does the work? The Anviq team leads it and is who you deal with." },
  ],
  "/explore/about": [
    { find: "About Anviq", say: "Anviq is an IT consulting and software company. The Anviq team leads the work from the first conversation to handover." },
    { find: "Founder", say: "Leonardo is an engineer with four years in regulated commercial operations, across brokerage, fintech and iGaming." },
    { find: "Three ways of shipping", say: "Anviq ships in three ways: service as software, forward-deployed engineering, and infrastructure." },
  ],
  "/projects/agents": [
    { find: "Anviq Agents", say: "Here is Anviq Agents up close. Persistent AI teammates that do real work inside a business, with memory, routines and tools. The README and architecture notes explain how it is put together." },
  ],
  "/projects/steadyward": [
    { find: "Steadyward", say: "Steadyward is a retention layer for MT4 and MT5 brokers. It watches live trading accounts for behavioural patterns and sends white label alerts to traders. It is read only, so it has no execution access." },
  ],
  "/projects/addreach": [
    { find: "Addreach", say: "Addreach is a cold outreach product for the German market. The sending infrastructure has deliverability and compliance built into the pipeline, not added on afterwards." },
  ],
  "/projects/recruitment-crm": [
    { find: "Automated Recruitment CRM", say: "This one runs the whole loop for a German recruitment operation: from CVs sourced through ads, to legally sequenced outreach, to placement. The matching is plain code and not AI, on purpose. The EU AI Act was the reason, not a missing feature." },
  ],
  "/projects/lv-matching": [
    { find: "LV Matching", say: "LV Matching, up close. Construction bill of quantities matching for several tenants, with a chat and grid interface. The notes cover the architecture, the constraints and the proof." },
  ],
};

/** First sentence of some text, kept short enough to say aloud. */
export function firstSentence(text: string, max = 170): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const match = clean.match(/^.*?[.!?](\s|$)/);
  const sentence = (match ? match[0] : clean).trim();
  return sentence.length > max ? sentence.slice(0, max).replace(/\s+\S*$/, "") + "." : sentence;
}
