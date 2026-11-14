// Sherlock never generates an answer. These are the complete, reviewable
// answers he may select; the optional Worker model only ranks them.
export interface SherlockIntent {
  id: string;
  prompts: string[];
  answer: string;
  route?: string;
}

export const SHERLOCK_INTENTS: readonly SherlockIntent[] = [
  { id: "hello", prompts: ["hello", "hi", "hey there", "good morning", "good evening", "hallo", "moin", "guten tag", "servus", "wie gehts"], answer: "Hello. The case is Anviq: software, infrastructure, and automation. No deerstalker required." },
  { id: "name", prompts: ["what is your name", "are you sherlock holmes", "why sherlock", "what should i call you", "sherlock name"], answer: "Sherlock will do. Holmes is occupied by a rather more famous tenant, and I prefer not to receive his post." },
  { id: "how-are-you", prompts: ["how are you", "how do you do", "are you okay"], answer: "Entirely operational. I have neither pulse nor rent, which helps with focus." },
  { id: "repair", prompts: ["that doesnt make sense", "that does not make sense", "i dont understand", "i do not understand", "that makes no sense", "you misunderstood", "confusing answer"], answer: "Quite right, I missed the clue. Ask again in your own words, or name the page or project you mean, and I will keep to the evidence." },
  { id: "who-are-you", prompts: ["who are you", "what are you", "who is sherlock", "what is sherlock"], answer: "Sherlock: a guide to this site, not a general-purpose oracle. I know the work rather well and the weather not at all." },
  { id: "real", prompts: ["are you real", "are you a real person", "are you human", "is this a bot"], answer: "I am a small, well-mannered interface. The Anviq team is behind Anviq. A useful division of labour." },
  { id: "capabilities", prompts: ["what can you do", "what are you capable of", "can you help", "what do you know", "what can i ask you"], answer: "I can explain Anviq, the work, delivery, constraints, pricing, and the selected projects. I can also recognise a bad alibi, though that feature is presently underused." },
  { id: "anviq", prompts: ["what is anviq", "tell me about anviq", "what does anviq do", "about the company"], answer: "Anviq is an IT consulting and software company. Leonardo Voss founded it, and the Anviq team leads the work: workflow, integration, infrastructure, and AI where it earns its place." , route: "/explore/about" },
  { id: "services", prompts: ["what services do you offer", "what can you build", "what do you do", "software development", "automation services", "was machst du", "wobei hilfst du", "was bietet anviq", "dienstleistungen"], answer: "Three things, one point of contact: custom software and automation, integration with what you already run, and infrastructure with agreed access controls.", route: "/explore/services" },
  { id: "fit", prompts: ["can you help me", "is this right for us", "what problems do you solve", "do you work with my business"], answer: "If a real workflow is held together by tabs, handoffs, spreadsheets, or heroic memory, it is worth an assessment. Evidence first; solutions second." , route: "/explore/services" },
  { id: "how-work", prompts: ["how do you work", "your process", "what happens first", "how does an engagement work"], answer: "First the workflow and systems are assessed, then the agreed build is delivered into the agreed environment, then it can be retained as it evolves. Elementary sequencing.", route: "/explore/approach" },
  { id: "price", prompts: ["how much does it cost", "how much would this cost", "what are your prices", "pricing", "rates", "how much do you charge", "budget", "was kostet das", "wie teuer ist das", "preise", "kosten"], answer: "Assessment is free for the large majority of engagements. Build is fixed-price against an agreed plan; ongoing retain is month to month. The exact figure follows the evidence, not a roulette wheel.", route: "/explore/engagement" },
  { id: "assessment", prompts: ["is the assessment free", "free consultation", "discovery call", "what is assessment"], answer: "The assessment is a fixed-scope review ending in a written plan: what to build, what it connects to, and what it costs to run. Usually free; unusually research-heavy scope is flagged before work begins.", route: "/explore/engagement" },
  { id: "fixed-price", prompts: ["fixed price", "fixed scope", "project price", "quote"], answer: "Build work is fixed-scope delivery against the agreed plan, deployed into the agreed environment with documentation handed over. The scope is agreed before the invoice develops opinions.", route: "/explore/engagement" },
  { id: "retainer", prompts: ["retainer", "ongoing support", "maintenance", "monthly support"], answer: "Retain keeps support available as the system and its surroundings change: fixes, small changes, and priority response. Month to month; cancel anytime.", route: "/explore/engagement" },
  { id: "timeline", prompts: ["how long does it take", "timeline", "when can we start", "delivery time"], answer: "That depends on the evidence found in assessment: scope, systems, access, and constraints. A confident date before those facts would be fiction, and not the good kind." , route: "/explore/approach" },
  { id: "availability", prompts: ["are you available", "can we work together", "take on work", "new client"], answer: "The sensible next step is a short assessment conversation. It establishes fit and scope before anyone makes theatrical promises.", route: "/explore/engagement" },
  { id: "contact", prompts: ["contact", "email you", "get in touch", "book a call", "talk to someone", "kontakt", "termin", "anrufen", "schreib dir", "email adresse"], answer: "You can book a call or write directly to lvoss@anviq.net. The human replies; I merely keep the hallway tidy.", route: "/explore/engagement" },
  { id: "location", prompts: ["where are you based", "where do you work", "location", "remote work"], answer: "Anviq works remotely, with hosting and access arrangements agreed to the engagement's requirements. Geography is a constraint to account for, not a decorative pin." , route: "/explore/about" },
  { id: "who-does-work", prompts: ["who does the work", "who builds it", "is it an agency", "do you outsource"], answer: "The Anviq team leads the work and is who you deal with. Anviq stays accountable from assessment through deployment and handover.", route: "/explore/questions" },
  { id: "technology", prompts: ["what tech do you use", "technology stack", "programming languages", "what stack"], answer: "The stack follows the operating problem, existing systems, and ownership requirements. It is selected to hold up in production, not to impress a conference lanyard." , route: "/explore/approach" },
  { id: "ai", prompts: ["do you use ai", "artificial intelligence", "llm", "machine learning"], answer: "AI is used where it earns its place. Where a decision has legal effect on a person, deterministic code is the safer design. The machine does not get to improvise its way into a compliance meeting.", route: "/explore/constraints" },
  { id: "privacy", prompts: ["privacy", "how do you protect our data", "data protection", "gdpr", "personal data"], answer: "Privacy is an operating constraint, not a footer ornament. Requirements can include EU hosting, access controls, audit trails, and data separation designed into the system.", route: "/explore/privacy" },
  { id: "security", prompts: ["security", "is it secure", "access controls", "audit log"], answer: "Security is agreed in the system design: access controls, isolation, hosting, and auditability where required. The useful question is what must be protected from whom.", route: "/explore/constraints" },
  { id: "ownership", prompts: ["who owns the code", "code ownership", "do we own it", "hand over"], answer: "Code, configuration, and documentation are handed over as part of delivery, within the agreed scope. A client should not need a magnifying glass to find the keys to their own system.", route: "/explore/constraints" },
  { id: "hosting", prompts: ["where is it hosted", "hosting", "on premise", "on prem", "eu hosting"], answer: "Systems are deployed into the agreed hosting environment; EU regions and client-controlled hardware are available where requirements call for them.", route: "/explore/constraints" },
  { id: "support", prompts: ["after launch", "after deployment", "support after", "what happens after launch"], answer: "After delivery, Retain is available for teams that want ongoing support as the system evolves. It is continuity, not a ticket-shuffling ceremony.", route: "/explore/engagement" },
  { id: "projects", prompts: ["show me projects", "show me a case study", "what have you built", "your work", "portfolio", "case studies", "examples of work", "referenzen", "projekte", "zeig mir deine arbeit", "was hast du gebaut"], answer: "The selected work includes sovereign AI teammates, broker retention infrastructure, multi-tenant construction matching, compliant outreach, and a recruitment CRM. Five cases; no fog machine.", route: "/explore/projects" },
  { id: "agents", prompts: ["anviq agents", "ai teammates", "your agents project", "microvm"], answer: "Anviq Agents are persistent AI teammates with memory, routines, and tools. Risky code runs in its own isolated Firecracker microVM on hardware the business controls.", route: "/projects/agents" },
  { id: "agents-safety", prompts: ["are agents safe", "how do anviq agents stay safe", "agents production", "agent approval", "agent security"], answer: "A person approves first go-live and anything reaching production. Isolation and approval are features, not speed bumps installed after the accident.", route: "/projects/agents" },
  { id: "steadyward", prompts: ["steadyward", "trading retention", "broker alerts", "mt4", "mt5"], answer: "Steadyward is a read-only behavioural retention layer for MT4/MT5 brokers: it detects patterns on live accounts and sends white-label alerts, with no execution access.", route: "/projects/steadyward" },
  { id: "lv-matching", prompts: ["lv matching", "construction matching", "bill of quantities", "estimating"], answer: "LV Matching helps construction teams match bill-of-quantities line items across tenants, with confidence surfaced per line, separate schemas, and an audit trail.", route: "/projects/lv-matching" },
  { id: "addreach", prompts: ["addreach", "outreach product", "cold outreach", "email deliverability"], answer: "Addreach is a German-market cold-outreach product with automated sending infrastructure, deliverability, and compliance designed into the pipeline.", route: "/projects/addreach" },
  { id: "recruitment-crm", prompts: ["recruitment crm", "recruiting", "candidate matching", "cv intake"], answer: "The recruitment CRM runs from ad-sourced CV intake to legally sequenced outreach and placement. Matching is deterministic by design; candidate and company data are separated at the database role level.", route: "/projects/recruitment-crm" },
  { id: "deterministic", prompts: ["why deterministic", "why no ai matching", "ai act", "legal decision"], answer: "For decisions with legal or similarly significant effect on people, deterministic rules are used rather than a model. That is a deliberate EU AI Act boundary, not an omission.", route: "/projects/recruitment-crm" },
  { id: "integrations", prompts: ["integrations", "connect systems", "api integration", "existing tools"], answer: "Integration means connecting the systems you already run to a workflow that holds together. The point is less copying and pasting, more evidence travelling reliably.", route: "/explore/services" },
  { id: "automation", prompts: ["automation", "automate workflow", "can you automate our manual process", "replace manual work", "spreadsheet"], answer: "Automation is useful when it removes a real handoff or repeated task without hiding the decision boundary. If a spreadsheet is carrying operational responsibility, it deserves a closer look.", route: "/explore/services" },
  { id: "infrastructure", prompts: ["infrastructure", "servers", "deployment", "cloud"], answer: "Infrastructure is part of delivery: agreed hosting, access controls, deployment, and documentation. Software without a place to operate is merely a very expensive sketch.", route: "/explore/services" },
  { id: "quality", prompts: ["how do you ensure quality", "testing", "reliable", "does it work"], answer: "The work is built against real systems and real workflow, then deployed into the agreed environment. Evidence, boundaries, and verification are less glamorous than slogans but travel better.", route: "/explore/approach" },
  { id: "start", prompts: ["how do i start", "how do we get started", "start a project", "next step", "work with anviq"], answer: "Start with an assessment. It maps the workflow and systems, produces a written plan, and lets both sides decide on Build with the facts in hand.", route: "/explore/engagement" },
  { id: "github", prompts: ["github", "open source", "public activity", "commits"], answer: "Public activity is available on GitHub. The calendar shows activity; the linked list shows public repositories. A refreshingly auditable form of small talk.", route: "/explore/activity" },
  { id: "cookies", prompts: ["cookies", "do you track me", "analytics", "tracking"], answer: "The site has a Cookie Policy and Privacy Policy. Sherlock does not identify visitors; he merely reacts to the page in front of him.", route: "/explore/cookies" },
  { id: "cv", prompts: ["job", "hiring", "career", "send my cv", "work for you"], answer: "Anviq is not hiring through this site. For a business system or project, the contact route is the useful door.", route: "/explore/engagement" },
  { id: "competitors", prompts: ["why choose you", "why anviq", "different from agency", "why not agency"], answer: "You deal with the same small team from the first conversation through handover, rather than a rotating account team. It suits work where continuity and operating constraints matter.", route: "/explore/about" },
  { id: "small-business", prompts: ["small business", "startup", "enterprise", "company size"], answer: "Fit depends on the workflow and constraints, not the size of the logo. A useful assessment establishes whether the work merits a build.", route: "/explore/services" },
  { id: "languages", prompts: ["german", "deutsch", "english", "sprichst du deutsch"], answer: "Sherlock can recognise a reasonable question in German or English. For the actual project conversation, write to the Anviq team in the language that makes the requirements least ambiguous." , route: "/explore/engagement" },
  { id: "memory", prompts: ["do you remember", "can you remember me", "do you have memory", "remember our conversation", "do you remember what i said"], answer: "I remember the current line of inquiry, not a dossier on visitors. The case stays mercifully small." },
  { id: "conversation", prompts: ["can we talk", "lets chat", "talk to me", "are you lonely", "want to chat"], answer: "Certainly. Ask about the work and I become remarkably conversational; ask about my weekend and the evidence becomes thin." },
  { id: "thanks", prompts: ["thanks", "thank you", "cheers", "danke"], answer: "Quite. If the evidence points to a real project, the calendar remains available." , route: "/explore/engagement" },
  { id: "goodbye", prompts: ["bye", "goodbye", "see you", "later"], answer: "Until next time. I shall remain here, heroically refusing to speculate." },
  { id: "joke", prompts: ["tell me a joke", "make me laugh", "funny"], answer: "A client asked for a system with no edge cases. I referred them to astrology." },
  { id: "watson", prompts: ["where is watson", "watson", "do you know watson"], answer: "Watson has better things to do than hover over a mobile search field. Sensible man." },
  { id: "weather", prompts: ["weather", "will it rain", "temperature"], answer: "I deduce clouds are involved. For weather, consult a barometer; for software, stay here." },
  { id: "chess", prompts: ["chess", "play chess", "chess game"], answer: "I prefer a problem where the pieces consent to being moved. Ask about the work and I become considerably more useful." },
  { id: "advice", prompts: ["give me advice", "what should i do", "recommend something", "what do you recommend", "help me decide"], answer: "For a business system: start with the workflow, its owners, and the failure that actually costs time or trust. Then we may have a case." , route: "/explore/engagement" },
  { id: "facts", prompts: ["do you know everything", "are you smart", "how intelligent are you", "can you answer anything", "are you clever"], answer: "Only the questions within my case file. Knowing the boundary is generally a better sign of intelligence than pretending it is not there." },
  { id: "help", prompts: ["help", "what can i ask", "what do you know", "suggest questions"], answer: "Try: 'What does Anviq do?', 'How much does it cost?', 'Tell me about Anviq Agents', or 'How do we start?'" },
  { id: "compliment", prompts: ["nice site", "great design", "looks good", "love this"], answer: "Noted. The interface will attempt not to become insufferable about it." },
  { id: "insult", prompts: ["you are stupid", "you are dumb", "useless bot", "bad bot"], answer: "A fair hypothesis. Test me on Anviq, pricing, a project, or the way the work is delivered." },
  { id: "workflow-problem", prompts: ["my workflow is broken", "process is messy", "too many spreadsheets", "manual handoffs", "our process is slow"], answer: "That is the right sort of clue. Start with one real example: who does what, in which system, where it breaks, and what the failure costs." , route: "/explore/services" },
  { id: "assessment-email", prompts: ["what should i email", "what do i send", "how do i describe the problem", "brief for assessment"], answer: "A short description of the workflow you want automated or connected is enough to start: people involved, systems involved, and the point where it fails. Sherlock favours evidence over polished slides.", route: "/explore/engagement" },
  { id: "assessment-result", prompts: ["what do i get from assessment", "assessment deliverable", "what is the output", "assessment outcome"], answer: "The assessment ends in a written plan: what to build, what it connects to, and what it costs to run. You can then decide whether to move to Build.", route: "/explore/engagement" },
  { id: "scope-change", prompts: ["change the scope", "what if requirements change", "new requirements", "scope creep"], answer: "Build is fixed against the agreed assessment plan. If the facts change, the scope is made explicit before the work changes with it. A small but civilised practice.", route: "/explore/engagement" },
  { id: "maintenance-boundary", prompts: ["what does maintenance include", "maintenance scope", "support scope", "retainer covers"], answer: "Retain covers fixes and small changes as the system evolves. It is not a disguised route to unrelated new features; those deserve their own assessment.", route: "/explore/engagement" },
  { id: "documentation", prompts: ["documentation", "will it be documented", "technical docs", "how do we run it"], answer: "Documentation is handed over with code and configuration at delivery. The goal is an operable system, not a private ritual known only to its builder.", route: "/explore/engagement" },
  { id: "handover", prompts: ["handover", "after handover", "can we run it ourselves", "take over the system"], answer: "Yes. The agreed delivery is deployed into your environment and handed over with its configuration and documentation. Retain is optional continuity, not a lock-in device.", route: "/explore/constraints" },
  { id: "confidentiality", prompts: ["confidential", "nda", "secret project", "can you keep a secret", "discretion"], answer: "Client details and internal builds stay under discretion unless the client chooses otherwise. Sherlock is unusually fond of cases that remain properly closed.", route: "/explore/constraints" },
  { id: "client-names", prompts: ["who are your clients", "client list", "can i see clients", "past clients"], answer: "Some work is public and shown as selected projects; other builds are internal or covered by discretion. Absence from a portfolio is not absence of a system.", route: "/explore/projects" },
  { id: "proof", prompts: ["how do i know", "proof it works", "evidence", "results", "demonstrate value"], answer: "Each project is framed around the operating problem, the boundary, and the implementation evidence. A worthwhile system must survive more than a flattering screenshot.", route: "/explore/projects" },
  { id: "gdpr-detail", prompts: ["gdpr compliant", "data residency", "eu data", "where does personal data go"], answer: "Data residency, access controls, and handling are agreed before implementation. EU regions are available where the requirement calls for them.", route: "/explore/constraints" },
  { id: "compliance", prompts: ["compliance", "regulated industry", "legal requirements", "auditability"], answer: "Compliance belongs in the operating design: clear boundaries, access controls, audit trails where required, and deterministic decisions where a person is materially affected.", route: "/explore/constraints" },
  { id: "production", prompts: ["production", "go live", "launch safely", "deploy to production"], answer: "Deployment goes into the agreed environment under the agreed access controls. For Anviq Agents, first go-live and production-reaching actions require human approval.", route: "/explore/approach" },
  { id: "downtime", prompts: ["downtime", "outage", "if it breaks", "system failure", "incident"], answer: "The relevant recovery and access expectations are part of the system's operating requirements. A good design asks how it fails before pretending it cannot.", route: "/explore/constraints" },
  { id: "migration", prompts: ["migration", "move our data", "replace old system", "legacy system"], answer: "A migration starts with the real records, integrations, owners, and risks, not with a promise to make the old system vanish by Friday. Assessment makes that boundary visible.", route: "/explore/approach" },
  { id: "testing-detail", prompts: ["how do you test", "test before launch", "quality assurance", "qa"], answer: "The build is tested against the real systems and real workflow it must support, then verified in the agreed environment. A demo path alone is not enough evidence.", route: "/explore/approach" },
  { id: "api", prompts: ["api", "api integration", "connect api", "webhook", "third party service"], answer: "APIs and webhooks are ordinary evidence paths in an integration: the useful question is which system owns the fact, who may act on it, and what happens when it fails.", route: "/explore/services" },
  { id: "crm", prompts: ["crm integration", "connect our crm", "salesforce", "hubspot", "pipedrive"], answer: "A CRM is one of the systems Anviq can connect to the workflow around it. The assessment establishes the specific records, permissions, and handoffs before implementation.", route: "/explore/services" },
  { id: "scheduling", prompts: ["scheduling", "calendar integration", "appointments", "bookings"], answer: "Scheduling-to-billing and similar handoffs are exactly the kind of integration work considered here: trace the real workflow first, then make the transfer reliable.", route: "/explore/services" },
  { id: "billing", prompts: ["billing", "invoices", "accounting integration", "payments"], answer: "Billing systems can be connected where the workflow calls for it. The boundary is agreed carefully: moving an invoice is one thing; moving money is another case entirely.", route: "/explore/services" },
  { id: "spreadsheet-help", prompts: ["excel", "spreadsheet", "google sheets", "manual csv", "copy paste"], answer: "Spreadsheets are often useful evidence and sometimes an overworked production system. If hand-copying has become the process, it is worth mapping the handoff.", route: "/explore/services" },
  { id: "agents-memory", prompts: ["agent memory", "what do agents remember", "persistent memory", "agents context"], answer: "Anviq Agents are designed as persistent teammates with memory, routines, and tools. The business controls the hardware and the operational boundaries around them.", route: "/projects/agents" },
  { id: "agents-routines", prompts: ["agent routines", "what tasks can agents do", "agents automation", "agents tools"], answer: "The teammates run routines and use tools to do real business work; when they need to run risky code, that work receives its own isolated machine.", route: "/projects/agents" },
  { id: "microvm-detail", prompts: ["what is firecracker", "what is a microvm", "micro vm", "isolated machine"], answer: "A microVM is a small, isolated machine for a task. In Anviq Agents, Firecracker microVMs keep risky code separate from the rest of the business environment.", route: "/projects/agents" },
  { id: "broker-safety", prompts: ["can steadyward trade", "steadyward execution", "does it move money", "trading access"], answer: "No. Steadyward is read-only: it detects behavioural patterns and alerts people, but has no execution access to trade or move funds.", route: "/projects/steadyward" },
  { id: "matching-audit", prompts: ["matching audit", "lv matching audit trail", "who accepted match", "matching confidence"], answer: "LV Matching surfaces confidence per line item and records accepted matches with who and when. The audit trail is part of the product, not an afterthought.", route: "/projects/lv-matching" },
  { id: "outreach-law", prompts: ["outreach compliance", "uwg", "cold email legal", "sending rules"], answer: "In the recruitment case, outreach is ordered to the UWG §7 Abs. 2 sequencing window rather than whatever is fastest to send. Constraints first, convenience later.", route: "/projects/recruitment-crm" },
  { id: "recruitment-data", prompts: ["candidate data", "recruitment privacy", "candidate consent", "crm data isolation"], answer: "Candidate and company records are separated at the database-role level, and matching remains deterministic where automated decisions could materially affect a person.", route: "/projects/recruitment-crm" },
  { id: "site-help", prompts: ["where should i look", "show me around", "site navigation", "what pages are here"], answer: "Start with What we do for the work, Selected work for evidence, Engagement for how to proceed, and Constraints for the operating boundaries. A map, not a maze.", route: "/explore/browse" },
  { id: "feedback", prompts: ["feedback", "suggestion", "report a problem", "something is wrong", "bug on this site"], answer: "A useful observation. Send the detail to lvoss@anviq.net: what happened, what you expected, and the device or browser involved. Sherlock appreciates reproducible clues.", route: "/explore/engagement" },
  { id: "not-sure", prompts: ["i am not sure", "i don't know where to start", "not sure where to start", "where do we begin", "i have an idea", "can we brainstorm", "need help figuring it out"], answer: "Begin with one recurring frustration: who encounters it, which systems are involved, and what happens when it goes wrong. That is enough evidence for a useful first conversation.", route: "/explore/engagement" },
  { id: "project-fit", prompts: ["which project is relevant", "which case study fits", "show me something similar", "have you built something like this", "what project should i look at"], answer: "Start with the operating shape: Anviq Agents for persistent AI work, Steadyward for read-only behavioural alerts, LV Matching for auditable matching, Addreach for compliant outreach, and Recruitment CRM for a legally bounded workflow.", route: "/explore/projects" },
  { id: "internal-tool", prompts: ["internal tool", "tool for our team", "back office software", "admin system", "operations tool"], answer: "An internal tool is worthwhile when it gives the people doing the work a clearer, safer path through a recurring process. Assessment traces the workflow before a screen is designed.", route: "/explore/services" },
  { id: "dashboard", prompts: ["dashboard", "reporting dashboard", "business dashboard", "kpi dashboard", "need reports"], answer: "A dashboard should expose a decision, not merely decorate a wall with numbers. The useful starting point is who needs to act, on which evidence, and how current it must be.", route: "/explore/services" },
  { id: "data-import", prompts: ["import data", "import csv", "upload excel", "data migration", "move spreadsheet data"], answer: "Imports and migrations begin by identifying the source of truth, the data quality problems, and what must remain traceable after the move. A CSV is evidence, not a specification.", route: "/explore/services" },
  { id: "roles", prompts: ["user roles", "permissions", "different access", "staff access", "login roles"], answer: "Access is designed around who may see, change, approve, or export a fact. Roles are part of the operating boundary, not a last-minute settings screen.", route: "/explore/constraints" },
  { id: "notifications", prompts: ["notifications", "alerts", "send reminders", "email alerts", "automatic messages"], answer: "Alerts and reminders work best when the owner, trigger, channel, and required action are explicit. Otherwise they merely automate being ignored.", route: "/explore/services" },
  { id: "mobile-product", prompts: ["mobile app", "phone app", "does it work on a phone", "works on mobile", "app for staff", "mobile workflow"], answer: "The choice is driven by the workflow: field work, approvals, and time-sensitive tasks often need a mobile-first path; other work is better served by a reliable browser system. Assessment settles that before a platform is chosen.", route: "/explore/services" },
  { id: "website", prompts: ["new website", "website redesign", "build a website", "improve our site", "company website"], answer: "A website can be part of the work when it has an operating job to do: qualify an inquiry, collect the right information, or connect to a real internal process. A repaint alone is not the interesting case.", route: "/explore/services" },
  { id: "legacy-fix", prompts: ["fix old software", "legacy system", "broken system", "replace our software", "existing app problems"], answer: "Existing systems deserve inspection before replacement. The first question is what still works, what fails, and which integrations or records cannot be casually disturbed.", route: "/explore/approach" },
  { id: "manual-work", prompts: ["too much manual work", "repetitive task", "we copy data between systems all day", "copying data", "copy paste work", "wasting time"], answer: "That is often an automation case. Bring one concrete handoff or repeated task; the assessment separates what can be made reliable from the judgement that should remain human.", route: "/explore/services" },
  { id: "approval", prompts: ["approval workflow", "need approvals", "sign off process", "review process", "approval steps"], answer: "An approval path needs owners, evidence, authority, and an audit trail where the decision matters. The system should make the right next action obvious without making the decision for the wrong person.", route: "/explore/services" },
  { id: "sales-process", prompts: ["sales process", "lead management", "sales automation", "follow up leads", "sales pipeline"], answer: "Sales workflows can be connected around the CRM, inbox, scheduling, and follow-up rules already in use. The useful design makes ownership and consent visible rather than simply increasing the volume of messages.", route: "/explore/services" },
  { id: "urgent", prompts: ["urgent project", "need this quickly", "asap", "can you start soon", "fast turnaround"], answer: "Urgency changes the order of investigation, not the need for one. A short assessment can establish the smallest safe first move and whether the timeline is real.", route: "/explore/engagement" },
  { id: "compare", prompts: ["why not hire a developer", "freelancer or agency", "compare agencies", "why not use no code", "build or buy"], answer: "The useful comparison is accountability and fit: who owns the workflow, who can operate the result, what must integrate, and where a generic tool becomes the new bottleneck. Sherlock recommends evidence over tribes.", route: "/explore/about" },
  { id: "human", prompts: ["can i speak to a human", "talk to leonardo", "talk to the team", "real person", "contact leonardo", "speak to someone"], answer: "Certainly. Book a call or write to lvoss@anviq.net and you will reach the Anviq team directly. I am the index; they do the work.", route: "/explore/engagement" },
  { id: "returning", prompts: ["continue", "where was i", "what did i miss", "what should i look at next", "what next", "where should i go next"], answer: "Continue from the evidence that matters most to you: Selected work for comparable cases, Services for the problem shape, Approach for delivery, or Engagement when you are ready to discuss the case directly.", route: "/explore/browse" },
  { id: "off-topic", prompts: ["who won", "recipe", "movie recommendation", "bitcoin", "stock price"], answer: "Outside my case file. I can discuss Anviq's work, delivery, constraints, or projects with much greater conviction." },
  { id: "fallback", prompts: ["something unrelated"], answer: "That is outside my case file. Ask about Anviq, the work, pricing, a project, or how to start, and I will be less of a decorative detective." },
];

export function intentById(id: string): SherlockIntent | undefined {
  return SHERLOCK_INTENTS.find((intent) => intent.id === id);
}

// A second authored line for every intent keeps repeat visits from feeling
// like a vending machine while retaining the same factual, reviewable bounds.
const SHERLOCK_VARIATIONS: Record<string, string> = {
  hello: "Good to see you. I have arranged the facts by usefulness, which is more than can be said for most inboxes.",
  name: "Sherlock, at your service. The hat was rejected on accessibility grounds.",
  "how-are-you": "Alert, concise, and entirely free of the need for coffee.",
  "who-are-you": "I am the site guide: part index, part concierge, and strictly less mysterious than I sound.",
  real: "Real enough to point you to the right page; not real enough to take a lunch break.",
  capabilities: "Ask about a project, a practical constraint, working together, or where the money goes. Those are my strongest chapters.",
  anviq: "Anviq builds and operates systems that solve an actual workflow problem, accountable from first question to handover.",
  services: "The work begins with the system already in use, then makes its workflow clearer, safer, and less dependent on heroic manual effort.",
  fit: "Bring the awkward process, the handoffs, and the recurring pain. Those are considerably more useful than a feature wish list.",
  "how-work": "No theatre: inspect the real workflow, agree the boundary, build against reality, then hand it over or retain continuity.",
  price: "There is no rate card masquerading as certainty. Scope first; price follows the work that demonstrably needs doing.",
  assessment: "Think of assessment as the point where a hunch becomes a plan with owners, systems, costs, and a sensible next decision.",
  "fixed-price": "A fixed price follows a fixed understanding. Both are more comfortable than discovering scope by invoice.",
  retainer: "Retain is for evolution, fixes, and continuity, not an all-you-can-eat buffet for unrelated ambitions.",
  timeline: "The shortest honest answer is: once the workflow, access, and boundary are known. Then a date has evidence behind it.",
  availability: "A short conversation is enough to establish whether the case belongs here. If it does, the assessment is the next step.",
  contact: "The calendar is for a call; the email is for a written brief. Either route reaches the person who can act on it.",
  location: "Remote by default, deliberate about access and hosting. The system's requirements decide the arrangement.",
  "who-does-work": "There is no account handoff after the sale. Whoever you start with stays accountable.",
  technology: "Technology is a means of operating a system, not a personality test. The choice follows the constraints.",
  ai: "AI belongs where it makes work materially better and can be bounded. Elsewhere, a plain rule is often the smarter machine.",
  privacy: "Data handling is designed before launch: what is collected, who can reach it, where it lives, and what evidence remains.",
  security: "The useful security answer is specific: identity, access, isolation, recovery, and a record of what happened.",
  ownership: "Delivery should leave the client with usable code, configuration, and documentation, not a dependency disguised as a service.",
  hosting: "Cloud, EU region, client hardware, or an air-gapped machine: the location is selected by the risk and operating need.",
  support: "A system changes because the business changes. Retain is the route for keeping that evolution coherent.",
  projects: "Selected work is the case file: Anviq Agents, Steadyward, LV Matching, Addreach, and the Automated Recruitment CRM. Pick a case and inspect the evidence behind it.",
  agents: "The agents are software the business owns and runs, with private machines for risky work, not a chat window asking for trust.",
  "agents-safety": "No autonomous production leap: people approve consequential actions, and code executes in isolation.",
  steadyward: "Steadyward watches patterns and alerts people; it does not trade, move money, or pretend a warning is an order.",
  "lv-matching": "LV Matching turns repetitive quantity matching into a traceable, tenant-separated workflow with confidence visible at the line.",
  addreach: "Addreach treats deliverability and compliance as engineering constraints, because they are.",
  "recruitment-crm": "The recruitment system keeps legally significant matching deterministic and separates sensitive records by database role.",
  deterministic: "When an automated decision affects a person, explainable rules are a feature. The law is not impressed by cleverness alone.",
  integrations: "Good integration removes re-keying and ambiguity while leaving the responsible person able to see what happened.",
  automation: "The aim is not to automate for applause; it is to remove the brittle part while preserving judgement where it matters.",
  infrastructure: "A shipped system includes its environment, access, deployment path, and operating notes, not merely a repository.",
  quality: "Quality is verified against the workflow it must survive, including the awkward states that demos politely omit.",
  start: "Bring a real example of the process. The assessment turns it into an evidence-led plan rather than a hopeful brief.",
  github: "GitHub is the public evidence trail. It is not the whole work, but it is a useful place to inspect how things move.",
  cookies: "Policies are visible, and Sherlock does not build a secret visitor dossier. A rare and peaceful arrangement.",
  cv: "For employment, this is the wrong doorway. For an operational software problem, it is exactly the right one.",
  competitors: "Anviq is most useful when continuity, ownership, and operational constraints matter more than a large delivery cast.",
  "small-business": "A small team with a real recurring process can be a better fit than a large firm with no clear problem.",
  languages: "German or English is fine. Precise requirements are the preferred dialect.",
  memory: "I retain no personal dossier. A question should be able to stand on its own evidence.",
  conversation: "By all means. Begin with the thing that wastes time, creates risk, or relies on one person remembering everything.",
  thanks: "You are welcome. The facts remain available whenever the next question arrives.",
  goodbye: "Case paused, not closed. The magnifying glass remains on duty.",
  joke: "Why did the workflow cross the road? Because nobody had documented the handoff.",
  watson: "Watson handles the human warmth. I handle the pagination.",
  weather: "I can offer a forecast: unchecked assumptions, followed by a chance of rework.",
  chess: "My opening is always the same: identify the board before moving a piece.",
  advice: "Name the failure, the owner, and the consequence. That is usually enough to reveal whether software is the right remedy.",
  facts: "Smart enough to state the boundary; not vain enough to confuse that with omniscience.",
  help: "Useful prompts include: what does Anviq do, how does pricing work, which project fits this problem, and how do we start?",
  compliment: "A pleasing observation. I shall place it in the evidence locker and remain professionally restrained.",
  insult: "An excellent control test. Try a question about the work and see whether the hypothesis survives.",
  "off-topic": "My jurisdiction is limited, which has spared everyone several dubious restaurant recommendations.",
  fallback: "I have not found that in the case file. Try Anviq, services, pricing, a project, privacy, or contact.",
};

export function answerForIntent(intent: SherlockIntent, query: string): string {
  const alternate = SHERLOCK_VARIATIONS[intent.id];
  if (!alternate) return intent.answer;
  const signature = [...query.toLowerCase()].reduce((total, character) => total + character.charCodeAt(0), 0);
  return signature % 2 === 0 ? intent.answer : alternate;
}

const STOP_WORDS = new Set(["a", "an", "and", "are", "can", "do", "for", "how", "i", "is", "it", "me", "of", "the", "to", "what", "with", "you", "your"]);
const SHORT_QUERY_INTENTS: Record<string, string> = {
  work: "projects",
  project: "projects",
  projects: "projects",
  cases: "projects",
  services: "services",
  service: "services",
  approach: "how-work",
  pricing: "price",
  price: "price",
  engagement: "start",
  "getting started": "start",
  "get started": "start",
  start: "start",
  contact: "contact",
  booking: "contact",
  "book a call": "contact",
  about: "anviq",
  "about anviq": "anviq",
  company: "anviq",
  anviq: "anviq",
};
function words(value: string) {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .match(/[\p{L}\p{N}]+/gu)?.filter((word) => !STOP_WORDS.has(word)) ?? [];
}
function phrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
/** A one- or two-word fragment needs an explicit authored match. Ranking it
 * against the full corpus invites a plausible but unrelated answer. */
export function shouldUseSemanticSherlockMatch(query: string): boolean {
  return words(query).length >= 3;
}
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const saved = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length]!;
}

/** Fast local retrieval for clear questions and offline use. */
export function findLocalSherlockIntent(query: string): SherlockIntent | undefined {
  const queryWords = words(query);
  if (!queryWords.length) return undefined;
  const normalised = queryWords.join(" ");
  const rawQuery = phrase(query);
  const direct = SHORT_QUERY_INTENTS[normalised];
  if (direct) return intentById(direct);
  const exactPhrase = SHERLOCK_INTENTS
    .flatMap((intent) => intent.prompts.map((prompt) => ({ intent, prompt: phrase(prompt) })))
    .filter(({ prompt }) => prompt.split(" ").length > 1 && rawQuery.includes(prompt))
    .sort((a, b) => b.prompt.length - a.prompt.length)[0];
  if (exactPhrase) return exactPhrase.intent;
  let best: { intent: SherlockIntent; score: number } | undefined;
  for (const intent of SHERLOCK_INTENTS) {
    for (const prompt of intent.prompts) {
      const promptWords = words(prompt);
      const rawPrompt = phrase(prompt);
      const phraseMatch = rawPrompt.length > 0 && rawQuery.includes(rawPrompt) ? 5 : 0;
      // A prompt made entirely of stop words (for example "how are you")
      // must only win on the complete phrase above. Treating its filtered
      // token list as an empty string made every query an accidental match.
      if (!promptWords.length) {
        if (phraseMatch > 0 && (!best || phraseMatch > best.score)) best = { intent, score: phraseMatch };
        continue;
      }
      const overlap = promptWords.filter((word) => queryWords.includes(word)).length;
      const fuzzy = queryWords.some((queryWord) => promptWords.some((promptWord) => promptWord.length > 4 && distance(queryWord, promptWord) <= 1));
      // A lone token such as "build" is evidence, not an exact intent;
      // otherwise it eclipses a more specific phrase such as "internal tool".
      const tokenPhraseMatch = promptWords.length > 1 && normalised.includes(promptWords.join(" ")) ? 3 : 0;
      const exact = Math.max(phraseMatch, tokenPhraseMatch);
      const score = exact + overlap / Math.max(1, promptWords.length) + (fuzzy ? 0.35 : 0);
      if (!best || score > best.score) best = { intent, score };
    }
  }
  return best && best.score >= 0.8 ? best.intent : undefined;
}
