import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  EyeOff,
  ExternalLink,
  FileCheck2,
  FileText,
  Folder,
  Hammer,
  House,
  Layers,
  Lock,
  Mail,
  Minus,
  PanelLeft,
  Scale,
  Search,
  Server,
  ShieldCheck,
  UploadCloud,
  Workflow,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  WORK,
  WORK_SELECTED,
  APPS,
  PROCESS,
  ENGAGEMENT,
  CONSTRAINTS,
  FAQ,
} from "@/data/content";
import { ExplorerPane } from "@/components/ExplorerPane";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EmojiReaction } from "@/components/ui/emoji-reaction";
import { DocumentPage } from "@/components/DocumentPage";

// These load on demand and are fetched when the browser is idle, so opening
// them is instant but they stay out of the first download.
const pageLoaders = {
  privacy: () => import("@/pages/Privacy").then((m) => ({ default: m.Privacy })),
  cookies: () => import("@/pages/Cookies").then((m) => ({ default: m.Cookies })),
  terms: () => import("@/pages/Terms").then((m) => ({ default: m.Terms })),
  accessibility: () => import("@/pages/Accessibility").then((m) => ({ default: m.Accessibility })),
  activity: () => import("@/components/ui/github-activity").then((m) => ({ default: m.GitHubActivity })),
  publicActivity: () => import("@/components/PublicActivity").then((m) => ({ default: m.PublicActivity })),
  lightbox: () => import("@/components/ScreenshotLightbox").then((m) => ({ default: m.ScreenshotLightbox })),
};
const Privacy = lazy(pageLoaders.privacy);
const Cookies = lazy(pageLoaders.cookies);
const Terms = lazy(pageLoaders.terms);
const Accessibility = lazy(pageLoaders.accessibility);
const GitHubActivity = lazy(pageLoaders.activity);
const PublicActivity = lazy(pageLoaders.publicActivity);
const ScreenshotLightbox = lazy(pageLoaders.lightbox);
if (typeof window !== "undefined") {
  window.addEventListener(
    "load",
    () => {
      const run = () => Object.values(pageLoaders).forEach((load) => void load());
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 5000 });
      else setTimeout(run, 2500);
    },
    { once: true },
  );
}
import { FilesBrowse, FilesOverview, FilesProjects, FilesTabBar, FilesToolbar, type FilesSort, type FilesView } from "@/components/FilesNavigation";
import { SiteNavigator } from "@/components/SiteNavigator";
import { AppIcon, AppLauncher, AppLink } from "@/components/AppLauncher";
import { recordBookingClick, recordEmailCopy, recordSearchZeroResults } from "@/lib/guide";
import { ZERO_RESULTS_HINT } from "@/lib/tone";
import { queryWordsMatch } from "@/lib/suggest";
import { isNavigatorSurfaceOpen } from "@/lib/navigatorSurface";
import { BOARD_ENTER as NAV_PILL_SPRING, SPRING_MORPH as FOLDER_LAYOUT_TRANSITION } from "@/lib/motion";

const NAV = [
  { id: "overview", label: "Overview", icon: House, href: "/" },
  {
    id: "services",
    label: "What we do",
    icon: Layers,
    href: "/explore/services",
  },
  {
    id: "projects",
    label: "Selected work",
    icon: Folder,
    href: "/explore/projects",
  },
  {
    id: "approach",
    label: "Approach",
    icon: Compass,
    href: "/explore/approach",
  },
  {
    id: "engagement",
    label: "Engagement",
    icon: FileText,
    href: "/explore/engagement",
  },
  {
    id: "constraints",
    label: "Constraints",
    icon: ShieldCheck,
    href: "/explore/constraints",
  },
  {
    id: "questions",
    label: "Questions",
    icon: CircleHelp,
    href: "/explore/questions",
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
    href: "/explore/activity",
  },
];
const SLUGS = ["agents", "steadyward", "lv-matching", "addreach", "recruitment-crm"];
const OVERVIEW_WORK = [0, 2];
const SITE_ORIGIN = "https://anviq.net";
const SECTION_META: Record<string, { title: string; description: string }> = {
  overview: {
    title: "Anviq - IT consulting and software, end to end",
    description: "An IT consulting and software company for custom systems, automation, integration, and infrastructure.",
  },
  services: {
    title: "What we do | Anviq",
    description: "Custom software, automation, integration, and infrastructure for workflows that need to work in the real world.",
  },
  projects: {
    title: "Selected work | Anviq",
    description: "Selected Anviq work across AI teammates, retention infrastructure, construction matching, outbound automation, and recruitment systems.",
  },
  approach: {
    title: "Approach | Anviq",
    description: "Anviq works from the operation outward: assess, build, deploy, and hand over systems with clear ownership.",
  },
  engagement: {
    title: "Engagement | Anviq",
    description: "Start with a scoped technical assessment, then choose fixed-scope build work or ongoing continuity.",
  },
  constraints: {
    title: "Constraints | Anviq",
    description: "Hosting, access, data handling, and ownership boundaries are agreed before implementation begins.",
  },
  questions: {
    title: "Questions | Anviq",
    description: "Answers about Anviq, the work, delivery boundaries, and how to start a conversation.",
  },
  activity: {
    title: "Activity | Anviq",
    description: "Public engineering activity and recent work from Anviq.",
  },
  browse: {
    title: "Browse | Anviq",
    description: "Browse the Anviq site: services, selected work, approach, engagement and information.",
  },
  privacy: {
    title: "Privacy policy | Anviq",
    description: "How anviq.net handles personal data, what it collects, why and your rights.",
  },
  cookies: {
    title: "Cookie policy | Anviq",
    description: "anviq.net sets no cookies. What third parties are involved and how to control cookies.",
  },
  accessibility: {
    title: "Accessibility statement | Anviq",
    description: "How anviq.net meets WCAG 2.2 AA, what we have tested and how to report a barrier.",
  },
  terms: {
    title: "Terms and disclaimer | Anviq",
    description: "The terms for using anviq.net.",
  },
  about: {
    title: "About Anviq",
    description: "An IT consulting and software company. The Anviq team leads the work, from first conversation to handover.",
  },
};
// One credibility line, not an autobiography - LinkedIn holds the story.
const FOUNDER_LINE =
  "Engineer with four years in regulated commercial operations across brokerage, fintech, and iGaming.";
// Short subheaders for search rows, the same shape as a Selected work row
// (name + tag). The body below is match text only, never displayed.
const SEARCH_SUBS: Record<string, string> = {
  services: "What Anviq builds",
  projects: "Selected builds",
  approach: "Assess, build, deploy, maintain",
  engagement: "Assessment, Build, Retain",
  constraints: "Hosting, access, compliance",
  questions: "Common questions",
  activity: "Public GitHub activity",
};
const SEARCH_ENTRIES = [
  ...NAV.filter((item) => item.id !== "overview").map((item) => ({
    title: item.label,
    href: item.href,
    group: "Explore" as const,
    icon: item.icon,
    sub: SEARCH_SUBS[item.id] ?? item.label,
    body:
      item.id === "services"
        ? WORK.map((s) => s.body).join(" ")
        : item.id === "approach"
          ? PROCESS.map((s) => s.body).join(" ")
          : item.id === "engagement"
            ? ENGAGEMENT.map((s) => s.body).join(" ")
            : item.id === "constraints"
              ? CONSTRAINTS.map((s) => s.body).join(" ")
              : item.id === "questions"
                ? FAQ.map((s) => s.q + " " + s.a).join(" ")
                : item.label,
  })),
  ...WORK_SELECTED.map((item, index) => ({
    title: item.name,
    href: `/projects/${SLUGS[index]}`,
    group: "Projects" as const,
    icon: Folder,
    sub: item.tag,
    body: `${item.tag}. ${item.body}`,
  })),
  {
    title: "About Anviq",
    href: "/explore/about",
    group: "Explore" as const,
    icon: BookOpen,
    sub: "The company",
    body: "IT consulting and software company. The Anviq team leads the work. Commercial judgment and technical delivery, full accountability.",
  },
];
function searchEntries(query: string) {
  return SEARCH_ENTRIES.filter((item) =>
    queryWordsMatch(query, [item.title, item.sub, item.href, item.body]),
  );
}
const PROJECT_DETAILS = [
  [
    ["Focus", "Persistent AI teammates with memory, routines, and tools"],
    ["Isolation", "Each job runs in its own Firecracker microVM"],
    ["Sovereignty", "Runs on hardware the client owns or controls"],
  ],
  [
    ["Focus", "Pattern detection on live trading accounts"],
    ["Delivery", "White-label trader alerts"],
    ["Boundary", "No execution access"],
  ],
  [
    ["Focus", "Construction bill-of-quantities matching"],
    ["Interface", "Chat and grid"],
    [
      "Infrastructure",
      "EU-hosted authentication and multi-tenant data handling",
    ],
  ],
  [
    ["Focus", "Cold outreach for the German market"],
    ["Delivery", "Automated sending infrastructure"],
    ["Infrastructure", "Deliverability and compliance within the pipeline"],
  ],
  [
    ["Focus", "Intake, matching, and legally-sequenced outreach"],
    ["Compliance", "Outreach ordered to UWG §7 Abs. 2, not convenience"],
    ["Data isolation", "Candidate and company data separated at the database role level"],
  ],
];
const subscribeMobile = (callback: () => void) => {
  const media = window.matchMedia("(max-width: 760px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getMobile = () => window.matchMedia("(max-width: 760px)").matches;
const getServerMobile = () => false;
// The compact Files surface is intentionally mobile-only. Tablet and laptop
// widths use the desktop explorer so there is no awkward middle composition.
const filesQuery = "(max-width: 760px)";
const subscribeFiles = (callback: () => void) => {
  const media = window.matchMedia(filesQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getFilesLayout = () => window.matchMedia(filesQuery).matches;

function LinkedinLogo() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.446-2.136 2.94v5.666H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}
function XLogo() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function FolderImage({ small = false, slug }: { small?: boolean; slug?: string }) {
  const reducedMotion = useReducedMotion();
  const className = small ? "folder-image folder-small" : "folder-image";
  if (!slug)
    return (
      <img
        className={className}
        src="/images/folder.png"
        alt=""
        width="128"
        height="128"
        draggable="false"
      />
    );
  return (
    <motion.img
      layoutId={`project-folder-${slug}`}
      className={className}
      src="/images/folder.png"
      alt=""
      width="128"
      height="128"
      draggable="false"
      transition={reducedMotion ? { duration: 0 } : FOLDER_LAYOUT_TRANSITION}
    />
  );
}
function ContactLink({
  children = "Start a conversation",
  compact = false,
  href = "https://calendly.com/lvoss-anviq/30min",
}: {
  children?: ReactNode;
  compact?: boolean;
  href?: string;
}) {
  return (
    <a
      className={`primary-button ${compact ? "compact-button" : ""}`}
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      onClick={() => {
        if (href.includes("calendly.com")) recordBookingClick();
      }}
    >
      <span className="primary-button-content">
        {children}
        {!compact && <ArrowRight size={18} aria-hidden="true" />}
      </span>
    </a>
  );
}
function Navigation({ active, label = "Explore Anviq" }: { active: string; label?: string }) {
  const reducedMotion = useReducedMotion();
  const pillTransition = reducedMotion ? { duration: 0 } : NAV_PILL_SPRING;
  const groups = [
    { title: "Explore", items: NAV.slice(0, 4) },
    { title: "Information", items: NAV.slice(4) },
  ];
  return (
    <nav aria-label={label} className="explorer-nav">
      {groups.map(({ title, items }) => (
        <div className="nav-group" key={title}>
          <p className="nav-group-label">{title}</p>
          {items.map(({ id, label, icon: Icon, href }) => {
            const selected = active === id;
            return (
              <Link
                key={id}
                to={href}
                className={`nav-link ${selected ? "is-selected" : ""}`}
                aria-current={selected ? "page" : undefined}
              >
                {selected && (
                  <motion.span
                    layoutId="explorer-nav-active"
                    className="nav-pill"
                    transition={pillTransition}
                  />
                )}
                <span className="nav-link-content">
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span>{label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
function Overview() {
  return (
    <div className="overview-page">
      <section className="welcome-section" aria-labelledby="welcome-title">
        <h1 id="welcome-title">Systems built to hold.</h1>
        <p className="intro">
          IT consulting and software. Workflow, integration, and
          infrastructure, AI where it earns its place. End-to-end
          accountability.
        </p>
        <ContactLink />
      </section>
      <AppLauncher headingId="apps-title" />
      <section className="overview-projects" aria-labelledby="projects-title">
        <div className="section-heading">
          <h2 id="projects-title">Selected work</h2>
          <Link className="quiet-link" to="/explore/projects">
            Browse all <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="folder-grid folder-grid-two">
          {OVERVIEW_WORK.map((index) => {
            const project = WORK_SELECTED[index];
            return (
              <Link
                className="project-folder"
                key={project.name}
                to={`/projects/${SLUGS[index]}`}
              >
                <span className="folder-image-lift">
                  <FolderImage slug={SLUGS[index]} />
                </span>
                <h3>{project.name}</h3>
                <p>{project.tag}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
type ProjectFile = {
  name: string;
  body: string[];
  boundary?: string;
  proof?: string[][];
};
function ProjectShips({ ships }: { ships: { date: string; title: string }[] }) {
  // ponytail: Ship log hidden while every project's `ships` is empty - a
  // "Coming soon." on all five read as unfinished. Populate `ships` in
  // content.ts to bring it back (see MEMORY: project_ship_log_todo); it
  // renders automatically as soon as any entry exists. TODO soon.
  if (ships.length === 0) return null;
  return (
    <div className="project-ships">
        <ul className="project-ships-list">
        {ships.map((entry) => (
          <li key={`${entry.date}-${entry.title}`}>
            <span className="project-ships-date">{entry.date}</span>
            <span className="project-ships-title">{entry.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
function ProjectFiles({ files }: { files: ProjectFile[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (openIndex !== null) {
    const file = files[openIndex];
    return (
      <div className="project-files project-file-open">
        <button
          type="button"
          className="quiet-link project-file-back"
          onClick={() => setOpenIndex(null)}
        >
          <ChevronLeft size={17} aria-hidden="true" />
          Files
        </button>
        <p className="project-file-name">{file.name}</p>
        {file.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        {file.boundary && <p className="project-file-boundary">{file.boundary}</p>}
        {file.proof && (
          <dl className="project-file-proof">
            {file.proof.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    );
  }
  return (
    <div className="project-files">
        <ul className="project-file-list">
        {files.map((file, index) => (
          <li key={file.name}>
            <button type="button" onClick={() => setOpenIndex(index)}>
              <FileText size={17} aria-hidden="true" />
              {file.name}
              <ChevronRight
                size={16}
                aria-hidden="true"
                className="project-file-chevron"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
function ProjectBrowser({ slug, filesLayout, view, setView, sort, setSort }: { slug?: string; filesLayout: boolean; view: FilesView; setView: (view: FilesView) => void; sort: FilesSort; setSort: (sort: FilesSort) => void }) {
  const selected = slug ? SLUGS.indexOf(slug) : filesLayout ? -1 : 0;
  if (slug && selected === -1) return <MissingPage />;
  const project = WORK_SELECTED[selected];
  return (
    <div className={`project-browser ${slug ? "has-project" : ""}`}>
      {filesLayout ? (!slug && <FilesProjects view={view} setView={setView} sort={sort} setSort={setSort} />) : <section className="project-list" aria-labelledby="project-list-title">
        <h1 id="project-list-title">Selected work</h1>
        <p>Selected builds</p>
        <nav aria-label="Projects">
          {WORK_SELECTED.map((item, index) => (
            <Link
              key={item.name}
              to={`/projects/${SLUGS[index]}`}
              aria-current={index === selected ? "page" : undefined}
              className={`project-row ${index === selected ? "is-selected" : ""}`}
            >
              <FolderImage small />
              <span>
                <strong>{item.name}</strong>
                <span>{item.tag}</span>
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </section>}
      {project && (
        <article
          className="project-preview"
          aria-labelledby="project-title"
          key={project.name}
        >
          <Link className="mobile-back quiet-link" to="/explore/projects">
            <ChevronLeft size={19} aria-hidden="true" />
            Selected work
          </Link>
          <FolderImage slug={SLUGS[selected]} />
          {filesLayout ? (
            <h1 id="project-title">{project.name}</h1>
          ) : (
            <h2 id="project-title">{project.name}</h2>
          )}
          <p className="project-category">{project.tag}</p>
          <p className="project-description">{project.body}</p>
          <dl className="project-details">
            {PROJECT_DETAILS[selected].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {project.screenshot && (
            <ScreenshotLightbox
              src={project.screenshot}
              alt={`${project.name} landing page`}
              label={`${project.name} screenshot`}
              layoutId={SLUGS[selected]}
              inline={false}
            />
          )}
          <ProjectFiles files={project.files} />
          <ProjectShips ships={project.ships} />
          {project.href ? (
            <a
              href={project.href}
              className="external-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={19} aria-hidden="true" />
              Visit {project.domain}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <a
              href={`mailto:lvoss@anviq.net?subject=${encodeURIComponent(project.name)}`}
              className="external-link"
            >
              <Mail size={19} aria-hidden="true" />
              Ask about {project.name}
            </a>
          )}
          <p className="project-note">
            A sample of builds, operated end to end. Some are
            covered by discretion, built for internal use. Others are sold
            as products with their own landing page, where more detail is
            shared.
          </p>
          {slug === "recruitment-crm" && (
            <Link className="internal-link" to="/projects/agents">
              See the agent layer behind the workflow
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </article>
      )}
    </div>
  );
}
function Services() {
  return (
    <DocumentPage
      title="What we do, in three parts."
      intro="Custom software, integration with what you already run, and infrastructure with agreed access controls. AI where it earns its place, not by default."
    >
      <div className="document-sections">
        {APPS.map((app, index) => (
          <section id={`service-${index}`} key={app.id} className="service-detail app-detail">
            <span className="app-detail-icon"><AppIcon app={app} /></span>
            <div>
              <h2>{app.name}</h2>
              <p>{app.body}</p>
              {app.id === "build" && (
                <ul className="app-services">
                  {WORK.map((item) => (
                    <li key={item.title}><strong>{item.title}.</strong> {item.body}</li>
                  ))}
                </ul>
              )}
              <AppLink app={app} className="internal-link">
                Open {app.name} <ArrowRight size={18} aria-hidden="true" />
              </AppLink>
            </div>
          </section>
        ))}
      </div>
      <p>
        Anviq embeds with your team and owns delivery from the first
        technical assessment through deployment and documentation.
      </p>
      <div className="page-cta">
        <Link className="internal-link" to="/explore/approach">
          See the approach <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <ContactLink />
      </div>
    </DocumentPage>
  );
}
// Moves focus to the next/previous button inside a roving-focus group
// (segmented control, picker list, timeline). Returns the new index so the
// caller can also update selection, or null if focus wasn't inside the group.
function focusSiblingButton(container: HTMLElement | null, direction: 1 | -1) {
  if (!container) return null;
  const items = Array.from(container.querySelectorAll<HTMLButtonElement>(":scope > button, :scope > * > button"));
  const currentIndex = items.findIndex((el) => el === document.activeElement);
  if (currentIndex === -1) return null;
  const nextIndex = (currentIndex + direction + items.length) % items.length;
  items[nextIndex].focus();
  return nextIndex;
}

const APPROACH_ICONS = [Search, Hammer, UploadCloud, FileCheck2];
// Closed racetrack loop: two straight sides plus two semicircle caps, walked
// clockwise Assess -> Build -> Deploy -> Handover -> (back to Assess).
// viewBox 0 0 640 200; nodes sit at the four corners where straight meets cap.
const APPROACH_NODE_POS = [
  { x: 15.625, y: 0 },
  { x: 84.375, y: 0 },
  { x: 84.375, y: 100 },
  { x: 15.625, y: 100 },
];
const APPROACH_SEGMENTS = [
  "M100,0 L540,0",
  "M540,0 A100,100 0 0 1 540,200",
  "M540,200 L100,200",
  "M100,200 A100,100 0 0 1 100,0",
];

function Approach() {
  const [activeStep, setActiveStep] = useState(PROCESS[0].n);
  const reducedMotion = useReducedMotion();
  const pickerRef = useRef<HTMLDivElement>(null);
  const activeIndex = PROCESS.findIndex((step) => step.n === activeStep);
  const active = PROCESS[activeIndex] ?? PROCESS[0];

  return (
    <DocumentPage
      title="The shape of the work"
      intro="Some engagements become service as software. Others are forward-deployed custom systems or infrastructure. The process starts with the operation, not the category."
    >
      <div className="constraint-inspector">
        <div
          ref={pickerRef}
          className="constraint-picker"
          role="tablist"
          aria-label="Delivery lifecycle"
          onKeyDown={(event) => {
            const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
            const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
            if (!forward && !backward) return;
            event.preventDefault();
            const nextIndex = focusSiblingButton(pickerRef.current, forward ? 1 : -1);
            if (nextIndex !== null) setActiveStep(PROCESS[nextIndex].n);
          }}
        >
          {PROCESS.map((step, index) => {
            const Icon = APPROACH_ICONS[index];
            const isActive = activeStep === step.n;
            return (
              <button
                key={step.n}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`approach-panel-${step.n}`}
                className={isActive ? "is-active" : ""}
                style={{ "--cat": `var(--cat-${index + 1})` } as CSSProperties}
                onClick={() => setActiveStep(step.n)}
              >
                <span className="constraint-icon approach-stage-icon">
                  <Icon size={17} aria-hidden="true" />
                </span>
                {step.title}
              </button>
            );
          })}
        </div>
        <div className="constraint-detail approach-detail">
          <div className="approach-loop" aria-hidden="true">
            <svg className="approach-loop-svg" viewBox="0 0 640 200">
              {APPROACH_SEGMENTS.map((d, index) => (
                <path key={d} d={d} className={`approach-loop-segment ${index < activeIndex ? "is-traveled" : ""}`} />
              ))}
            </svg>
            {PROCESS.map((step, index) => {
              const Icon = APPROACH_ICONS[index];
              const pos = APPROACH_NODE_POS[index];
              return (
                <span
                  key={step.n}
                  className={`approach-loop-node ${activeStep === step.n ? "is-active" : ""}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, "--cat": `var(--cat-${index + 1})` } as CSSProperties}
                >
                  <Icon size={15} aria-hidden="true" />
                </span>
              );
            })}
          </div>
          <motion.div
            key={active.n}
            id={`approach-panel-${active.n}`}
            role="tabpanel"
            initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="constraint-detail-label">Stage {activeIndex + 1} of {PROCESS.length}</p>
            <h2>{active.title}</h2>
            <p>{active.body}</p>
          </motion.div>
        </div>
      </div>
      <Link className="internal-link" to="/explore/engagement">
        How an engagement works <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </DocumentPage>
  );
}
function Engagement() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = ENGAGEMENT[activeIndex];
  const reducedMotion = useReducedMotion();
  const switchRef = useRef<HTMLDivElement>(null);
  const pillTransition = reducedMotion ? { duration: 0 } : { type: "spring" as const, bounce: 0, duration: 0.3 };
  return (
    <DocumentPage
      title="Working together."
      intro="Every engagement starts with a scoped technical assessment before any commitment to build."
    >
      <div
        ref={switchRef}
        className="engagement-switch"
        role="tablist"
        aria-label="Engagement stages"
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          const nextIndex = focusSiblingButton(switchRef.current, event.key === "ArrowRight" ? 1 : -1);
          if (nextIndex !== null) setActiveIndex(nextIndex);
        }}
      >
        {ENGAGEMENT.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={isActive ? "is-selected" : ""}
              onClick={() => setActiveIndex(index)}
            >
              {isActive && (
                <motion.span layoutId="engagement-switch-pill" className="engagement-switch-pill" transition={pillTransition} />
              )}
              <span className="engagement-switch-label">{item.title}</span>
            </button>
          );
        })}
      </div>
      <motion.section
        key={active.id}
        className="engagement-spec"
        role="tabpanel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="document-label">{active.price}</p>
        <h2 className="engagement-spec-title">{active.title}</h2>
        <p>{active.body}</p>
        <div className="engagement-terms">
          <div>
            <p className="document-label">Included</p>
            <ul>
              {active.in.map((line) => (
                <li key={line}>
                  <Check size={16} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="document-label">Not included</p>
            <ul>
              {active.out.map((line) => (
                <li key={line}>
                  <Minus size={16} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="document-label engagement-outcome-label">Outcome</p>
        <p className="engagement-outcome">{active.next}</p>
        {active.note && <p className="engagement-note">{active.note}</p>}
      </motion.section>
      <div className="page-cta">
        <ContactLink />
      </div>
    </DocumentPage>
  );
}
const CONSTRAINT_ICON: Record<string, typeof Lock> = {
  Ownership: FileCheck2,
  "Access and data": Lock,
  "Decision boundaries": Scale,
  Discretion: EyeOff,
};

function Constraints() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = CONSTRAINTS[activeIndex];
  const ActiveIcon = CONSTRAINT_ICON[active.title] ?? ShieldCheck;
  const reducedMotion = useReducedMotion();
  const pickerRef = useRef<HTMLDivElement>(null);
  return (
    <DocumentPage
      title="How this is operated"
      intro="Boundaries agreed before implementation: access, data, decisions, and ownership"
    >
      <div className="constraint-inspector">
        <div
          ref={pickerRef}
          className="constraint-picker"
          role="group"
          aria-label="Operating boundary"
          onKeyDown={(event) => {
            const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
            const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
            if (!forward && !backward) return;
            event.preventDefault();
            const nextIndex = focusSiblingButton(pickerRef.current, forward ? 1 : -1);
            if (nextIndex !== null) setActiveIndex(nextIndex);
          }}
        >
          {CONSTRAINTS.map((item, index) => {
            const Icon = CONSTRAINT_ICON[item.title] ?? ShieldCheck;
            return (
              <button
                key={item.title}
                type="button"
                className={activeIndex === index ? "is-active" : ""}
                aria-pressed={activeIndex === index}
                onClick={() => setActiveIndex(index)}
              >
                <span className="constraint-icon">
                  <Icon size={17} aria-hidden="true" />
                </span>
                {item.title}
              </button>
            );
          })}
        </div>
        <motion.section
          key={active.title}
          className="constraint-detail"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          aria-live="polite"
        >
          <span className="constraint-detail-icon">
            <ActiveIcon size={22} aria-hidden="true" />
          </span>
          <p className="constraint-detail-label">Operating boundary</p>
          <h2>{active.title}</h2>
          <p>{active.body}</p>
        </motion.section>
      </div>
      <Link className="internal-link" to="/projects/agents">
        See the safeguards in Anviq Agents
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </DocumentPage>
  );
}
function Questions() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const reducedMotion = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  return (
    <DocumentPage
      title="Common questions."
      intro="A few things to know before we get started."
    >
      <div
        ref={listRef}
        className="faq-list"
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          focusSiblingButton(listRef.current, event.key === "ArrowDown" ? 1 : -1);
        }}
      >
        {FAQ.map((item, index) => {
          const isOpen = openQuestion === index;
          return (
            <section key={item.q} className={isOpen ? "is-open" : ""}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                onClick={() => setOpenQuestion(isOpen ? null : index)}
              >
                <span>{item.q}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    className="faq-answer"
                    initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                    animate={reducedMotion ? undefined : { height: "auto", opacity: 1 }}
                    exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p>{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
      <div className="page-cta">
        <p>Something else on your mind?</p>
        <ContactLink />
      </div>
    </DocumentPage>
  );
}
const ABOUT_MODES = [
  { title: "Service as software", icon: Workflow, body: "A repeatable operation becomes a product people can use, with the work carried by the software itself.", link: "See Anviq Agents", href: "/projects/agents" },
  { title: "Forward-deployed engineering", icon: Layers, body: "A unique workflow gets custom software built around the people and systems already in place.", link: "See selected work", href: "/explore/projects" },
  { title: "Infrastructure", icon: Server, body: "The operating environment is the work: hardware, isolation, access, and the system underneath it all.", link: "See the safeguards", href: "/explore/constraints" },
] as const;

function About() {
  const [activeMode, setActiveMode] = useState(0);
  const reducedMotion = useReducedMotion();
  const pickerRef = useRef<HTMLDivElement>(null);
  const mode = ABOUT_MODES[activeMode]!;
  return (
    <DocumentPage
      title="About Anviq"
      intro="An IT consulting and software company. The Anviq team leads the work, from the first conversation to handover."
    >
      <h2>Founder</h2>
      <div className="identity-strip">
        <img
          className="identity-photo"
          src="/images/founder.png"
          alt="Leonardo Voss"
        />
        <div className="identity-text">
          <strong>Leonardo Voss</strong>
          <a className="identity-email" href="mailto:lvoss@anviq.net">
            lvoss@anviq.net
          </a>
          <span className="identity-line">{FOUNDER_LINE}</span>
        </div>
        <a
          className="identity-linkedin"
          href="https://www.linkedin.com/in/v-leonardo/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={16} aria-hidden="true" />
          LinkedIn
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
      <blockquote className="about-statement">
        Most systems fail because they depend on the person who built them, or on luck holding steady. Anviq is built against that: systems that hold on their own, and someone who stays accountable for them either way.
      </blockquote>
      <h2>Three ways of shipping</h2>
      <div className="constraint-inspector">
        <div
          ref={pickerRef}
          className="constraint-picker"
          role="tablist"
          aria-label="Delivery modes"
          onKeyDown={(event) => {
            const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
            const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
            if (!forward && !backward) return;
            event.preventDefault();
            const nextIndex = focusSiblingButton(pickerRef.current, forward ? 1 : -1);
            if (nextIndex !== null) setActiveMode(nextIndex);
          }}
        >
          {ABOUT_MODES.map((item, index) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={activeMode === index}
              className={activeMode === index ? "is-active" : ""}
              onClick={() => setActiveMode(index)}
            >
              <span className="constraint-icon">
                <item.icon size={17} aria-hidden="true" />
              </span>
              {item.title}
            </button>
          ))}
        </div>
        <div className="constraint-detail">
          <motion.div
            key={mode.title}
            role="tabpanel"
            initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2>{mode.title}</h2>
            <p>{mode.body}</p>
            <Link className="internal-link" to={mode.href}>{mode.link}<ArrowRight size={18} aria-hidden="true" /></Link>
          </motion.div>
        </div>
      </div>
      <Link className="internal-link" to="/explore/constraints">
        Hosting, access, and compliance boundaries
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </DocumentPage>
  );
}
function MissingPage() {
  return (
    <DocumentPage
      title="This page isn't here."
      intro="The link may have changed. You can browse Anviq's services and projects from the overview."
    >
      <Link className="internal-link" to="/">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to overview
      </Link>
    </DocumentPage>
  );
}
const PALETTE_FADE = { duration: 0.15 } as const;
const SEARCH_GROUPS = ["Explore", "Projects"] as const;
type SearchEntry = (typeof SEARCH_ENTRIES)[number];

function groupSuggestions(suggestions: SearchEntry[]) {
  return SEARCH_GROUPS.map((label) => ({
    label,
    items: suggestions.filter((item) => item.group === label),
  })).filter((group) => group.items.length > 0);
}

function SuggestionGroups({
  groups,
  suggestions,
  highlighted,
  setHighlighted,
  goTo,
}: {
  groups: ReturnType<typeof groupSuggestions>;
  suggestions: SearchEntry[];
  highlighted: number;
  setHighlighted: (index: number) => void;
  goTo: (href: string) => void;
}) {
  return (
    <>
      {groups.map((group) => (
        <li key={group.label} role="presentation" className="palette-group">
          <div role="group" aria-label={group.label}>
            <p className="palette-group-label" aria-hidden="true">
              {group.label}
            </p>
            {group.items.map((item) => {
              const index = suggestions.indexOf(item);
              return (
                <button
                  key={item.href}
                  type="button"
                  id={`search-suggestion-${index}`}
                  role="option"
                  aria-selected={index === highlighted}
                  className={index === highlighted ? "is-highlighted" : ""}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => goTo(item.href)}
                >
                  <span className="suggestion-icon">
                    <item.icon size={17} aria-hidden="true" />
                  </span>
                  <span className="suggestion-text">
                    <strong>{item.title}</strong>
                    <small>{item.sub}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </>
  );
}

function SearchControl({
  variant = "palette",
}: {
  variant?: "palette" | "inline";
}) {
  return variant === "inline" ? <InlineSearch /> : <CommandPalette />;
}

function InlineSearch() {
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [rescue, setRescue] = useState<string | null>(null);
  const [rescueSpent, setRescueSpent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const suggestions = search.trim() ? searchEntries(search).slice(0, 8) : [];
  const groups = groupSuggestions(suggestions);
  const showSuggestions = focused && suggestions.length > 0;

  useEffect(() => {
    setHighlighted(0);
  }, [search]);

  useEffect(() => {
    if (search.trim() && suggestions.length === 0) {
      recordSearchZeroResults();
      if (!rescueSpent) {
        setRescue(ZERO_RESULTS_HINT);
        setRescueSpent(true);
      }
    } else if (suggestions.length > 0) {
      setRescue(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const goTo = (href: string) => {
    setFocused(false);
    setSearch("");
    navigate(href);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (suggestions[highlighted]) goTo(suggestions[highlighted].href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (event.key === "Escape") inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="search-field-wrap" ref={wrapRef}>
      <form className="search-field" role="search" onSubmit={submit}>
        <Search size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          placeholder="Search"
          aria-label="Search Anviq"
          autoComplete="off"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions"
          aria-activedescendant={
            showSuggestions ? `search-suggestion-${highlighted}` : undefined
          }
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setSearch("");
              inputRef.current?.focus();
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </form>
      {showSuggestions && (
        <ul className="search-suggestions" id="search-suggestions" role="listbox">
          <SuggestionGroups
            groups={groups}
            suggestions={suggestions}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            goTo={goTo}
          />
        </ul>
      )}
      {search.trim() && suggestions.length === 0 && rescue && (
        <p className="search-rescue" role="status">
          {rescue}
        </p>
      )}
    </div>
  );
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const suggestions = search.trim() ? searchEntries(search).slice(0, 8) : [];
  const groups = groupSuggestions(suggestions);

  useEffect(() => {
    setHighlighted(0);
  }, [search]);

  useEffect(() => {
    if (search.trim() && suggestions.length === 0) recordSearchZeroResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Global Cmd/Ctrl+K opens the palette from anywhere. Ctrl+K is reserved by
  // Chrome/Edge on Windows for the omnibox and never reaches page JS there,
  // so "/" (used by GitHub, Slack, Notion) is a reliable fallback - guarded
  // so it doesn't hijack typing in a real text field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const isTyping =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);
        if (isTyping) return;
        if (isNavigatorSurfaceOpen()) {
          event.preventDefault();
          window.dispatchEvent(new Event("anviq:focus-navigator-input"));
          return;
        }
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus the input on open; trap Tab and handle Escape while open; restore
  // focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      const focusable = dialog
        ? [
            ...dialog.querySelectorAll<HTMLElement>(
              'button, input, [href], [tabindex]:not([tabindex="-1"])',
            ),
          ]
        : [];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  const goTo = (href: string) => {
    setOpen(false);
    setSearch("");
    navigate(href);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (suggestions[highlighted]) goTo(suggestions[highlighted].href);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="icon-button search-trigger"
        aria-label="Search Anviq (press / or Cmd+K)"
        onClick={() => setOpen(true)}
      >
        <Search size={18} aria-hidden="true" />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
          <motion.div
            className="command-palette-backdrop"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : PALETTE_FADE}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Search Anviq"
              className="command-palette-dialog"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : PALETTE_FADE}
            >
              <form className="search-field magic-search-field" role="search" onSubmit={submit}>
                <Search size={18} aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  name="q"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Make magic happen..."
                  aria-label="Search Anviq"
                  autoComplete="off"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  role="combobox"
                  aria-expanded={suggestions.length > 0}
                  aria-controls="search-suggestions"
                  aria-activedescendant={
                    suggestions.length
                      ? `search-suggestion-${highlighted}`
                      : undefined
                  }
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearch("");
                      inputRef.current?.focus();
                    }}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </form>
              {groups.length > 0 ? (
                <ul
                  className="search-suggestions palette-results"
                  id="search-suggestions"
                  role="listbox"
                >
                  <SuggestionGroups
                    groups={groups}
                    suggestions={suggestions}
                    highlighted={highlighted}
                    setHighlighted={setHighlighted}
                    goTo={goTo}
                  />
                </ul>
              ) : (
                search.trim() && (
                  <p className="palette-empty">No results for "{search}"</p>
                )
              )}
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
export function Home() {
  const { section, project: slug } = useParams();
  const location = useLocation();
  const mobile = useSyncExternalStore(
    subscribeMobile,
    getMobile,
    getServerMobile,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const reducedMotion = useReducedMotion();
  const aboutPillTransition = reducedMotion ? { duration: 0 } : NAV_PILL_SPRING;
  const filesLayout = useSyncExternalStore(subscribeFiles, getFilesLayout, getServerMobile);
  const [fileView, setFileView] = useState<FilesView>("icons");
  const [fileSort, setFileSort] = useState<FilesSort>("name");
  const mainRef = useRef<HTMLElement>(null);
  const lastLocation = useRef(location.key);
  const isProject = location.pathname.startsWith("/projects/");
  const active = isProject
    ? "projects"
    : (section ?? (location.pathname === "/" ? "overview" : "missing"));
  const currentProject = isProject
    ? WORK_SELECTED[SLUGS.indexOf(slug ?? "")]
    : undefined;
  const specialLabels: Record<string, string> = {
    browse: "Browse",
    about: "About Anviq",
    privacy: "Privacy Policy",
    cookies: "Cookie Policy",
    terms: "Terms & Disclaimer",
    accessibility: "Accessibility",
  };
  const label =
    NAV.find((item) => item.id === active)?.label ??
    specialLabels[active] ??
    "Page not found";
  const syncScrollAndFocus = () => {
    mainRef.current?.focus({ preventScroll: true });
    if (location.hash) {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ block: "start" });
      return;
    }
    // Desktop scrolls inside .explorer-main (boxed window); files-layout
    // scrolls the page itself (.explorer-main is overflow:visible there).
    // Reset whichever one actually owns the scroll - the other is a no-op.
    if (mainRef.current) mainRef.current.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    const page = currentProject
      ? {
          title: `${currentProject.name} | Anviq selected work`,
          description: currentProject.body,
        }
      : (SECTION_META[active] ?? SECTION_META.overview);
    const canonical = `${SITE_ORIGIN}${location.pathname}`;
    document.title = page.title;
    const setMeta = (selector: string, attributes: Record<string, string>, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', { name: "description" }, page.description);
    setMeta('meta[property="og:title"]', { property: "og:title" }, page.title);
    setMeta('meta[property="og:description"]', { property: "og:description" }, page.description);
    setMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
    setMeta('meta[property="og:type"]', { property: "og:type" }, currentProject ? "article" : "website");
    setMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
    setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, page.title);
    setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, page.description);
    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
    let schema = document.head.querySelector<HTMLScriptElement>('script[data-anviq-schema="page"]');
    if (!schema) {
      schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.dataset.anviqSchema = "page";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": currentProject ? "CreativeWork" : "WebPage",
      name: page.title,
      description: page.description,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "Anviq", url: SITE_ORIGIN },
      about: { "@type": "Organization", name: "Anviq", url: SITE_ORIGIN },
    });
    if (lastLocation.current !== location.key) {
      lastLocation.current = location.key;
      // Handles same-pane hash jumps (e.g. switching #service-N anchors)
      // immediately. When the active section/project itself changes, the
      // new pane hasn't mounted yet under AnimatePresence mode="wait" - this
      // call is a harmless no-op then, and ExplorerPane's onEnter (below)
      // re-runs the same logic once the new content is actually in the DOM.
      syncScrollAndFocus();
    }
  }, [location.key, location.hash, currentProject?.name, label]);
  let content: ReactNode;
  switch (active) {
    case "overview":
      content = filesLayout ? <FilesOverview /> : <Overview />;
      break;
    case "projects":
      content = <ProjectBrowser slug={slug} filesLayout={filesLayout} view={fileView} setView={setFileView} sort={fileSort} setSort={setFileSort} />;
      break;
    case "services":
      content = <Services />;
      break;
    case "approach":
      content = <Approach />;
      break;
    case "engagement":
      content = <Engagement />;
      break;
    case "constraints":
      content = <Constraints />;
      break;
    case "questions":
      content = <Questions />;
      break;
    case "activity":
      content = (
        <DocumentPage
          title="Public activity."
          intro="This pulls live from GitHub. The calendar shows public and private activity; the linked list below is public repositories only."
        >
          <div className="activity-calendar-scroll">
            <GitHubActivity
              username="Leovoss"
              showMonths
              cellSize={filesLayout ? 14 : 11}
              className="anviq-github-activity"
            />
          </div>
          <PublicActivity />
          <a
            className="external-link"
            href="https://github.com/Leovoss"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={18} aria-hidden="true" />
            View Leovoss on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </DocumentPage>
      );
      break;
    case "about":
      content = <About />;
      break;
    case "privacy":
      content = <Privacy />;
      break;
    case "cookies":
      content = <Cookies />;
      break;
    case "terms":
      content = <Terms />;
      break;
    case "accessibility":
      content = <Accessibility />;
      break;
    case "browse":
      content = filesLayout ? <FilesBrowse /> : (
        <DocumentPage title="Browse Anviq">
          <Navigation active="browse" label="Browse Anviq" />
          <Link className="internal-link" to="/explore/about">
            About Anviq
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </DocumentPage>
      );
      break;
    default:
      content = <MissingPage />;
  }
  // Sections that no longer exist, guarded here as well as in the router so
  // the redirect holds however the route was matched.
  const retired: Record<string, string> = {
    founder: "/explore/about",
    "ship-log": "/explore/projects",
    licenses: "/",
  };
  if (retired[active]) return <Navigate to={retired[active]} replace />;
  const legacy: Record<string, string> = {
    "#work": "/explore/services",
    "#work-selected": "/explore/projects",
    "#approach": "/explore/approach",
    "#engagement": "/explore/engagement",
    "#faq": "/explore/questions",
    "#activity": "/explore/activity",
    "#contact": "/explore/engagement",
    "#founder": "/explore/about",
    "#ship-log": "/explore/projects",
  };
  if (location.pathname === "/" && legacy[location.hash])
    return <Navigate to={legacy[location.hash]} replace />;
  const filesBack = isProject
    ? { href: "/explore/projects", label: "Selected work" }
    : active === "browse"
      ? { href: "/", label: "Anviq" }
      : { href: "/explore/browse", label: "Browse" };
  return (
    <div className={filesLayout ? `files-layout ${mobile ? "phone-layout" : "tablet-layout"}` : "desktop-layout"}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div
        className={`explorer-window ${!sidebarOpen ? "sidebar-hidden" : ""}`}
      >
        <aside
          className="explorer-sidebar"
          id="desktop-sidebar"
          hidden={!sidebarOpen || mobile}
        >
          {filesLayout && <p className="files-sidebar-title">Browse</p>}
          <Link to="/" className="brand" aria-label="Anviq overview">
            <Logo />
            <span>Anviq</span>
          </Link>
          <Navigation active={active} />
          <Link
            className={`about-link ${active === "about" ? "is-selected" : ""}`}
            aria-current={active === "about" ? "page" : undefined}
            to="/explore/about"
          >
            {active === "about" && (
              <motion.span
                layoutId="explorer-nav-active"
                className="nav-pill"
                transition={aboutPillTransition}
              />
            )}
            <span className="nav-link-content">
              <BookOpen size={17} aria-hidden="true" />
              About Anviq
            </span>
          </Link>
        </aside>
        {filesLayout ? <FilesToolbar title={currentProject?.name ?? (active === "overview" ? "Anviq" : label)} phone={mobile} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} back={filesBack}><SearchControl variant="inline" /></FilesToolbar> : <header className="explorer-toolbar">
          {mobile ? (
            <Link
              className="browse-button"
              to={active === "browse" ? "/" : "/explore/browse"}
            >
              <PanelLeft size={21} aria-hidden="true" />
              <span>{active === "browse" ? "Overview" : "Browse"}</span>
            </Link>
          ) : (
            <button
              className="icon-button"
              aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              aria-expanded={sidebarOpen}
              aria-controls="desktop-sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft size={21} aria-hidden="true" />
            </button>
          )}
          <nav className="toolbar-path" aria-label="Breadcrumb">
            <Link to="/">Anviq</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{label}</span>
          </nav>
          <SearchControl />
          <ContactLink compact>Get in touch</ContactLink>
        </header>}
        <main
          id="main-content"
          className="explorer-main"
          ref={mainRef}
          tabIndex={-1}
        >
          <ExplorerPane
            animKey={`${active}-${slug ?? ""}`}
            onEnter={syncScrollAndFocus}
          >
            <Suspense fallback={null}>{content}</Suspense>
          </ExplorerPane>
        </main>
        <div className="explorer-status" role="region" aria-label="Page status">
          <nav aria-label="Current location">
            <Link to="/">Anviq</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link
              to={
                NAV.find((item) => item.id === active)?.href ??
                `${location.pathname}${location.search}`
              }
            >
              {label}
            </Link>
            {currentProject && (
              <>
                <ChevronRight size={14} aria-hidden="true" />
                <span>{currentProject.name}</span>
              </>
            )}
          </nav>
          <span>
            {active === "projects" || active === "overview"
              ? `${WORK_SELECTED.length} projects`
              : "IT consulting and software"}
          </span>
        </div>
        <SiteNavigator />
      </div>
      <footer className="site-footer">
        <span>© 2026 Anviq</span>
        <nav aria-label="Legal">
          <Link to="/explore/privacy">Privacy</Link>
          <Link to="/explore/cookies">Cookies</Link>
          <Link to="/explore/terms">Terms &amp; disclaimer</Link>
          <Link to="/explore/accessibility">Accessibility</Link>
        </nav>
        <div className="site-footer-right">
          <nav className="social-links" aria-label="Social">
            <a
              href="https://www.linkedin.com/in/v-leonardo/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Leonardo Voss on LinkedIn"
            >
              <LinkedinLogo />
            </a>
            <a
              href="https://x.com/thereallvoss"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Leonardo Voss on X"
            >
              <XLogo />
            </a>
            <EmojiReaction size="sm" />
          </nav>
          <a
            href="mailto:lvoss@anviq.net"
            onCopy={() => recordEmailCopy()}
          >
            lvoss@anviq.net
          </a>
        </div>
      </footer>
      {mobile && <FilesTabBar active={active} />}
    </div>
  );
}
