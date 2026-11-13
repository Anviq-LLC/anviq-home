export const WORK = [
  {
    title: "Software & automation",
    body: "Custom software and automation for a workflow you already have: increasingly the software does the work itself, not just a tool your team operates, using AI where it earns its place.",
  },
  {
    title: "Integration",
    body: "Connect what gets built to the systems you already run: scheduling to billing, CRM to operations, wherever the handoff currently breaks.",
  },
  {
    title: "Infrastructure",
    body: "Hosting region, access controls and data handling agreed with you before a line of implementation starts.",
  },
];

export const IDEA = [
  {
    title: "Precision engineering",
    body: "Make dimensions, decisions and outcomes explicit.",
  },
  { title: "Quiet confidence", body: "Let evidence carry the claim." },
  { title: "Trust", body: "State responsibilities and boundaries." },
  { title: "Discretion", body: "Protect client information." },
];

export const PROCESS = [
  {
    n: "01",
    title: "Assess",
    body: "Map the people, systems, and handoffs. Find the point that actually breaks.",
  },
  {
    n: "02",
    title: "Build",
    body: "Build against the real workflow and the systems your team already uses.",
  },
  {
    n: "03",
    title: "Deploy",
    body: "Put it into the agreed environment with the right access controls.",
  },
  {
    n: "04",
    title: "Handover",
    body: "Hand over the system clearly. Stay on when continuity is useful.",
  },
];

export const WORK_SELECTED = [
  {
    href: null,
    tag: "Sovereign AI teammates",
    name: "Anviq Agents",
    body: "Persistent AI teammates that do real work inside a business, with memory, routines, and tools, and run any risky code in its own isolated machine on hardware the business controls.",
    domain: null,
    screenshot: "/images/anviq-agents-shot.png",
    ships: [] as { date: string; title: string }[],
    files: [
      {
        name: "README.md",
        body: [
          "Persistent AI teammates for a business: they carry memory, run routines, and use tools to do real work, not just answer questions.",
          "It inverts the usual software-as-a-service: not a tool your team operates, but the service itself, delivered as software you own and run.",
          "Two layers that fit together: the teammates, and a microVM engine that hands them a private, isolated machine whenever they need to run real code.",
        ],
      },
      {
        name: "architecture.md",
        body: [
          "The two layers meet at one HTTP seam: a teammate asks for a computer, and the engine starts, runs, and then destroys a private Firecracker microVM for that job. Either side can be swapped without touching the other.",
          "Each job runs in its own microVM on KVM, with its own kernel and TAP networking, so one job's code cannot reach another's or the host it runs on.",
        ],
      },
      {
        name: "constraints.md",
        body: [
          "A person approves first go-live and anything that reaches production. The teammates do not ship to production on their own.",
          "Sovereign tier, codename Rostock: runs on hardware the client owns or controls, bare metal or on-prem, air-gapped where needed, with bring-your-own-key, SSO, and audit logging. Anviq can stand up and operate that hardware, not only hand it over.",
        ],
      },
      {
        name: "proof.md",
        body: [],
        boundary:
          "What broke: AI pilots either touched production directly, which no one in a regulated business could sign off on, or stayed a chat window that could not actually do the work.",
        proof: [
          ["Isolation", "Each job runs in its own Firecracker microVM on KVM, not a shared process"],
          ["Where it runs", "On hardware the client owns or controls, air-gapped where required"],
          ["Human gate", "A person approves first go-live and anything reaching production"],
        ],
      },
    ],
  },
  {
    href: "https://steadyward.com",
    tag: "Retention infrastructure",
    name: "Steadyward",
    body: "A read-only behavioural retention layer for MT4/MT5 brokers: pattern detection on live trading accounts, white-label trader alerts, no execution access.",
    domain: "steadyward.com",
    screenshot: "/images/steadyward-shot.png",
    ships: [] as { date: string; title: string }[],
    files: [
      {
        name: "README.md",
        body: [
          "Read-only retention layer over a broker's MT4/MT5 stack.",
          "Two surfaces: an alert queue the broker's own retention tooling consumes, and white-label alerts shown to the trader.",
        ],
      },
      {
        name: "architecture.md",
        body: [
          "Ingests account activity from the broker's MT4/MT5 bridge on a polling schedule, scores it against known churn patterns, and writes alerts to a queue the broker's own retention tooling consumes.",
          "No direct connection between Steadyward and the trading engine's order execution path.",
        ],
      },
      {
        name: "constraints.md",
        body: [
          "No execution access, by design: the retention layer cannot place, close, or modify a trade.",
          "Hosting region and data retention are agreed per broker before onboarding.",
        ],
      },
      {
        name: "proof.md",
        body: [],
        boundary:
          "What broke: retention teams found out a trader was about to churn from a spreadsheet updated once a week, well after it mattered.",
        proof: [
          ["Signal", "3 consecutive high-risk sessions"],
          ["Alert latency", "Under 5 minutes from pattern match"],
          ["Access level", "Read-only, no trade endpoints called"],
        ],
      },
    ],
  },
  {
    href: null,
    tag: "Multi-tenant SaaS",
    name: "LV Matching",
    body: "Construction bill-of-quantities matching for multiple tenants, with a chat-and-grid interface, EU-hosted auth, and data handling built for GDPR from the schema up.",
    domain: null,
    screenshot: null,
    ships: [] as { date: string; title: string }[],
    files: [
      {
        name: "README.md",
        body: [
          "Multi-tenant matching service for construction bills of quantities.",
          "Two surfaces over the same data: a grid for line-item review, and a chat panel beside it for corrections.",
        ],
      },
      {
        name: "architecture.md",
        body: [
          "Tenants are isolated per schema rather than by a tenant_id column, so a query cannot cross tenants by omission.",
          "Authentication is EU-hosted and sits outside the matching service.",
        ],
      },
      {
        name: "constraints.md",
        body: [
          "Match confidence is surfaced per line item and never applied silently: an estimator accepts or rejects each one.",
          "Every accepted match is written to an audit log with who accepted it and when.",
        ],
      },
      {
        name: "proof.md",
        body: [],
        boundary:
          "What broke: estimators matched bill-of-quantities line items by hand across spreadsheets per tenant, with no shared audit trail.",
        proof: [
          ["Match confidence", "Surfaced per line item, not hidden"],
          ["Tenant isolation", "Separate schema per tenant, not a shared table with a tenant_id filter"],
          ["Audit", "Every accepted match logged with who and when"],
        ],
      },
    ],
  },
  {
    href: "https://addreach.addvert.de",
    tag: "Outbound automation",
    name: "Addreach",
    body: "Cold-outreach product for a German market: automated sending infrastructure with deliverability and compliance built into the pipeline, not bolted on after.",
    domain: "addreach.addvert.de",
    screenshot: "/images/addreach-shot.png",
    ships: [] as { date: string; title: string }[],
    files: [
      {
        name: "README.md",
        body: [
          "Sending infrastructure for cold outreach into the German market.",
          "Three parts: campaign configuration, an eligibility gate, and a send pipeline with deliverability monitoring.",
        ],
      },
      {
        name: "architecture.md",
        body: [
          "Recipients pass an eligibility check, opt-out state and sequencing window, before anything is queued for sending.",
          "The pipeline tracks domain and sender reputation per campaign rather than per account.",
        ],
      },
      {
        name: "constraints.md",
        body: [
          "A send blocks automatically when the legal window has not passed; there is no override in the interface.",
          "Compliance runs inside the pipeline, not as a checklist a user could skip.",
        ],
      },
      {
        name: "proof.md",
        body: [],
        boundary:
          "What broke: outreach sequencing lived in a spreadsheet no compliance review ever saw before sends went out.",
        proof: [
          ["Send eligibility", "Checked against opt-out and sequencing rules before queueing"],
          ["Deliverability", "Domain and sender reputation monitored per campaign"],
          ["Compliance gate", "A send blocks automatically if the legal window hasn't passed"],
        ],
      },
    ],
  },
  {
    href: null,
    tag: "Recruitment platform",
    name: "Automated Recruitment CRM",
    body: "Runs the full loop from ad-sourced CV intake to legally-sequenced outreach to placement, for a German recruitment operation. Matching is deterministic code, not AI, by design: the EU AI Act was the reason, not a missing feature.",
    domain: null,
    screenshot: "/images/recruitment-crm-shot.png",
    ships: [] as { date: string; title: string }[],
    files: [
      {
        name: "README.md",
        body: [
          "Recruitment pipeline service for a German operation.",
          "Three stages: CV intake from job-board ad responses, a deterministic matching engine, and a sequencing gate in front of outreach.",
        ],
      },
      {
        name: "architecture.md",
        body: [
          "Intake pulls CVs from job-board ad responses into a normalized candidate record. A rules engine scores fit against open roles; outreach is queued only once the legally required sequencing window has passed.",
          "Candidate and company data are separated at the database role level so a compromised outreach worker can't read company-side records.",
        ],
      },
      {
        name: "constraints.md",
        body: [
          "No AI in the matching path: under the EU AI Act, an automated match with legal or similarly significant effect on a candidate carries obligations this system is built to avoid entirely.",
          "Outreach ordered to UWG §7 Abs. 2, not to whatever is fastest to send.",
        ],
      },
      {
        name: "proof.md",
        body: [],
        boundary:
          "What broke: candidate outreach went out whenever a recruiter had time, not when the law required a gap since the ad response.",
        proof: [
          ["Matching", "Deterministic rules engine, not a model"],
          ["Outreach timing", "Blocked until the UWG §7 Abs. 2 window has passed"],
          ["Data isolation", "Candidate and company records separated at the database role level"],
        ],
      },
    ],
  },
];

export const CONSTRAINTS = [
  {
    title: "Ownership",
    body: "Code, configuration, and documentation are handed over as part of delivery, per the agreed scope.",
  },
  {
    title: "Access and data",
    body: "Hosting, access controls, and data handling are agreed before implementation starts.",
  },
  {
    title: "Decision boundaries",
    body: "No automated decision with legal or similarly significant effect on a person.",
  },
  {
    title: "Discretion",
    body: "Client details and internal builds stay covered by discretion unless you choose to be named.",
  },
];

// One real engagement's constraints in practice - not a market specialty
// claim. DACH is one market this practice can deliver in among others,
// commonly regarded as one of the harder ones to serve well; it's used
// here as the proof case, not the positioning.
export const DELIVERY_PROOF = [
  {
    label: "UWG §7",
    note: "Outreach ordered to the statutory sequencing window, not convenience.",
  },
  {
    label: "Data residency",
    note: "Hosted where your requirements say, EU regions included.",
  },
  {
    label: "AI Act",
    note: "Deterministic code where a decision would have legal effect on a person, not a model.",
  },
];

export const ENGAGEMENT = [
  {
    id: "assessment",
    title: "Assessment",
    price: "Free",
    body: "A short, fixed-scope review of the workflow and systems, ending in a written plan.",
    in: [
      "Workflow and systems mapped end to end",
      "Written plan: what to build, what it connects to",
      "Fixed scope, no charge",
    ],
    out: ["No code changes", "No infrastructure changes"],
    next: "You get the plan, then decide whether to build.",
    note: "Usually free. If planning needs unusually significant research time, it is priced before work starts; that is uncommon.",
  },
  {
    id: "build",
    title: "Build",
    price: "Fixed price",
    body: "Fixed-scope delivery against the plan, deployed and documented.",
    in: [
      "Delivery against the agreed plan",
      "Deployed into your agreed environment",
      "Documentation handed over at the end",
    ],
    out: ["No maintenance included", "No scope beyond the assessment plan"],
    next: "A working system in your environment, ready to own.",
    note: undefined as string | undefined,
  },
  {
    id: "retain",
    title: "Retain",
    price: "Month to month",
    body: "Ongoing access as the system evolves.",
    in: [
      "Ongoing support as the system evolves",
      "Fixes and small changes as needed",
      "Priority response",
    ],
    out: ["Not a retainer for unrelated new features", "No fixed minimum hours"],
    next: "Continuity month to month, cancel anytime.",
    note: undefined as string | undefined,
  },
];

export const FAQ = [
  {
    q: "Who actually does the work?",
    a: "Leonardo Voss leads the work, and he is the person you deal with. Anviq stays accountable from the assessment through deployment and handover.",
  },
  {
    q: "Where is data hosted?",
    a: "Hosting region, access controls and data handling are agreed with you as part of the technical assessment, before implementation starts.",
  },
  {
    q: "Do I own what gets built?",
    a: "Yes. Code, configuration and documentation are handed over as part of delivery, per the agreed scope.",
  },
  {
    q: "How does a technical assessment start?",
    a: "Email a short description of the workflow you want automated or connected. Leonardo replies with scope and timing for the assessment.",
  },
];

export const APPS = [
  {
    id: "agents",
    name: "Anviq Agents",
    tag: "AI helpers for your team",
    body: "Persistent AI teammates with memory, routines and tools. Risky code runs in its own isolated machine on hardware the business controls.",
    icon: "/images/app-agents.svg?v=4bac8e58",
    href: "https://agents.anviq.net/?open=1",
    c1: "#2b3bb8",
    c2: "#6f8bff",
  },
  {
    id: "build",
    name: "Anviq Build",
    tag: "Custom software",
    body: "Software and automation, integration with the systems you already run, and infrastructure with agreed access controls.",
    icon: "/images/app-build.svg?v=38710458",
    href: "https://build.anviq.net/?open=1",
    c1: "#1b212b",
    c2: "#4a5565",
  },
  {
    id: "public",
    name: "Anviq Public",
    tag: "Websites for government",
    body: "Accessible websites, records portals and migrations, with the audit documents a procurement asks for.",
    icon: "/images/app-public.svg?v=cf6145ae",
    href: "https://public.anviq.net/?open=1",
    c1: "#0f5a73",
    c2: "#2fa89a",
  },
];
