import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Activity, ArrowRight, BookOpen, ChevronLeft, ChevronRight, CircleHelp, Compass, FileText, Folder, House, Layers, LayoutGrid, List, Mail, PanelLeft, ShieldCheck } from "lucide-react";
import { WORK_SELECTED } from "@/data/content";
import { Logo } from "@/components/Logo";
import { AppLauncher } from "@/components/AppLauncher";
import { recordBookingClick } from "@/lib/guide";
import { motionOr, SPRING_MORPH as FOLDER_LAYOUT_TRANSITION } from "@/lib/motion";

const projectSlugs = ["agents", "steadyward", "lv-matching", "addreach", "recruitment-crm"];

export function FilesArtwork({ document = false, slug }: { document?: boolean; slug?: string }) {
  const reducedMotion = useReducedMotion();
  if (document) return <span className="files-document-icon" aria-hidden="true"><FileText size={31} strokeWidth={1.75} /></span>;
  if (!slug) return <img className="files-folder-art" src="/images/folder.png" width="112" height="112" alt="" draggable="false" />;
  return (
    <motion.img
      layoutId={`project-folder-${slug}`}
      className="files-folder-art"
      src="/images/folder.png"
      width="112"
      height="112"
      alt=""
      draggable="false"
      transition={motionOr(reducedMotion, FOLDER_LAYOUT_TRANSITION)}
    />
  );
}

export function FilesToolbar({ title, phone, sidebarOpen, onToggleSidebar, back, children }: {
  title: string;
  phone: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  back: { href: string; label: string };
  children: ReactNode;
}) {
  return <header className="files-toolbar">
    <div className="files-toolbar-row">
      {phone ? <Link to={back.href} className="files-back"><ChevronLeft size={24} aria-hidden="true" /><span>{back.label}</span></Link> : <div className="files-toolbar-leading"><button className="icon-button" aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"} aria-expanded={sidebarOpen} aria-controls="desktop-sidebar" onClick={onToggleSidebar}><PanelLeft size={23} aria-hidden="true" /></button>{back.href !== "/explore/browse" && <Link to={back.href} className="files-back"><ChevronLeft size={22} aria-hidden="true" /><span>{back.label}</span></Link>}</div>}
      <span className="files-toolbar-title">{title}</span>
      <a href="https://calendly.com/lvoss-anviq/30min" target="_blank" rel="noopener noreferrer" onClick={() => recordBookingClick()} className="files-contact" aria-label="Contact Anviq"><Mail size={22} strokeWidth={1.75} aria-hidden="true" /><span>Contact</span></a>
    </div>
    <div className="files-search-row">{children}</div>
  </header>;
}

export function FilesTabBar({ active }: { active: string }) {
  const selected = active === "overview" ? "overview" : active === "activity" ? "activity" : "browse";
  return <nav className="files-tab-bar" aria-label="Main navigation">
    {[{ id: "overview", href: "/", label: "Overview", Icon: House }, { id: "browse", href: "/explore/browse", label: "Browse", Icon: Folder }, { id: "activity", href: "/explore/activity", label: "Activity", Icon: Activity }].map(({ id, href, label, Icon }) => <Link key={id} to={href} aria-current={selected === id ? "page" : undefined}><Icon size={23} strokeWidth={selected === id ? 2 : 1.6} aria-hidden="true" /><span>{label}</span></Link>)}
  </nav>;
}

export function FilesOverview() {
  return <div className="files-overview files-screen">
    <div className="files-page-heading"><h1 className="sr-only">Anviq</h1><Logo /><p>IT consulting and software</p></div>
    <section className="files-welcome-document" aria-labelledby="files-welcome-title">
      <h2 id="files-welcome-title">Systems built to hold.</h2>
      <p>Workflow, integration, and infrastructure, AI where it earns its place. End-to-end accountability.</p>
      <a href="https://calendly.com/lvoss-anviq/30min" target="_blank" rel="noopener noreferrer" onClick={() => recordBookingClick()}>Start a conversation <ArrowRight size={17} aria-hidden="true" /></a>
    </section>
    <AppLauncher headingId="files-apps-title" />
    <section className="files-overview-work" aria-labelledby="files-work-title"><div className="files-section-heading"><h2 id="files-work-title">Selected work</h2><Link to="/explore/projects">See all<ChevronRight size={16} aria-hidden="true" /></Link></div>
      <div className="files-grid files-grid-two">{[0, 2].map(index => <Link className="files-item" key={WORK_SELECTED[index].name} to={`/projects/${projectSlugs[index]}`}><FilesArtwork slug={projectSlugs[index]} /><span className="files-item-name">{WORK_SELECTED[index].name}</span><span className="files-item-kind">Project</span></Link>)}</div>
    </section>
  </div>;
}

export function FilesBrowse() {
  const groups = [
    { title: "Locations", items: [{ label: "Anviq", note: "IT consulting and software", href: "/", Icon: Folder }] },
    { title: "Favorites", items: [{ label: "Selected work", note: `${WORK_SELECTED.length} projects`, href: "/explore/projects", Icon: Folder }, { label: "What we do", href: "/explore/services", Icon: Layers }, { label: "Approach", href: "/explore/approach", Icon: Compass }] },
    { title: "Information", items: [{ label: "Engagement", href: "/explore/engagement", Icon: FileText }, { label: "Constraints", href: "/explore/constraints", Icon: ShieldCheck }, { label: "Questions", href: "/explore/questions", Icon: CircleHelp }, { label: "Activity", href: "/explore/activity", Icon: Activity }, { label: "About Anviq", href: "/explore/about", Icon: BookOpen }] },
  ];
  return <div className="files-browse files-screen"><div className="files-page-heading"><h1>Browse</h1></div>{groups.map(({ title, items }) => <section className="files-browse-group" key={title}><h2>{title}</h2><nav className="files-grouped-list" aria-label={title}>{items.map(({ label, href, Icon, ...rest }) => <Link to={href} key={href}><Icon size={23} strokeWidth={1.75} aria-hidden="true" /><span>{label}{"note" in rest && <small>{rest.note}</small>}</span><ChevronRight size={17} aria-hidden="true" /></Link>)}</nav></section>)}</div>;
}

export type FilesView = "icons" | "list";
export type FilesSort = "name" | "kind";
export function FilesProjects({ view, setView, sort, setSort }: { view: FilesView; setView: (view: FilesView) => void; sort: FilesSort; setSort: (sort: FilesSort) => void }) {
  const projects = WORK_SELECTED.map((item, index) => ({ ...item, slug: projectSlugs[index] })).sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : a.tag.localeCompare(b.tag)));
  return <section className="files-projects files-screen" aria-labelledby="files-projects-title"><div className="files-page-heading"><h1 id="files-projects-title">Selected work</h1><p>Builds, end to end.</p></div>
    <div className="files-view-toolbar"><label className="files-sort">Sort by <select aria-label="Sort projects" value={sort} onChange={event => setSort(event.target.value as FilesSort)}><option value="name">Name</option><option value="kind">Type</option></select></label><div className="files-view-switch" role="group" aria-label="Project view"><button aria-label="Icon view" aria-pressed={view === "icons"} onClick={() => setView("icons")}><LayoutGrid size={19} aria-hidden="true" /></button><button aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={22} aria-hidden="true" /></button></div></div>
    <nav className={view === "icons" ? "files-grid" : "files-project-rows"} aria-label="Projects">{projects.map(project => <Link className="files-item" key={project.slug} to={`/projects/${project.slug}`}><FilesArtwork slug={project.slug} /><span className="files-item-name">{project.name}</span><span className="files-item-kind">{project.tag}</span>{view === "list" && <ChevronRight size={17} aria-hidden="true" />}</Link>)}</nav>
    <p className="files-item-count">{WORK_SELECTED.length} projects</p>
    <p className="files-collection-note">Some are covered by discretion, built for internal use. Others are sold as products with their own landing page, where more detail is shared.</p>
  </section>;
}
