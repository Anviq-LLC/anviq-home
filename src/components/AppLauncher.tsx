import { useEffect, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { APPS } from "@/data/content";

type App = (typeof APPS)[number];
type Box = { left: number; top: number; size: number };

const NAVIGATE_MS = 140;

export function AppIcon({ app }: { app: App }) {
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={app.icon.replace(".svg", "-dark.svg")} />
      <img src={app.icon} alt="" width="112" height="112" draggable="false" style={{ width: "100%", height: "100%" }} />
    </picture>
  );
}

// Click: the icon grows into a full-screen splash while the site starts loading,
// and the site opens with the same splash so the two read as one movement.
export function AppLink({ app, className, children, hash }: { app: App; className?: string; children: ReactNode; hash?: string }) {
  const href = hash ? `${app.href}#${hash}` : app.href;
  const reduced = useReducedMotion();
  const [box, setBox] = useState<Box | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setBox(null);
        setOpen(false);
      }
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  useEffect(() => {
    if (!box) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    return () => cancelAnimationFrame(frame);
  }, [box]);

  function launch(event: MouseEvent<HTMLAnchorElement>) {
    if (reduced || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (box) return;
    const icon = event.currentTarget.querySelector<HTMLElement>(".app-icon") ?? event.currentTarget;
    const rect = icon.getBoundingClientRect();
    setBox({ left: rect.left, top: rect.top, size: rect.width });
    window.setTimeout(() => {
      window.location.href = href;
    }, NAVIGATE_MS);
  }

  const frame: CSSProperties = box
    ? open
      ? { left: 0, top: 0, width: "100vw", height: "100dvh", borderRadius: 0 }
      : { left: box.left, top: box.top, width: box.size, height: box.size, borderRadius: "22%" }
    : {};

  return (
    <>
      <a className={`${className ?? ""}${box ? " is-launching" : ""}`} href={href} onClick={launch}>
        {children}
      </a>
      {box && <p className="sr-only" role="status">Opening {app.name}</p>}
      {box && (
        <div className={`app-launch${open ? " is-open" : ""}`} style={frame} aria-hidden="true">
          <div className="app-launch-in">
            <span className="app-launch-icon" style={{ width: open ? 112 : box.size, height: open ? 112 : box.size }}>
              <AppIcon app={app} />
            </span>
            <b>{app.name}</b>
          </div>
        </div>
      )}
    </>
  );
}

export function AppLauncher({ headingId, heading = "What we do" }: { headingId: string; heading?: string }) {
  return (
    <section className="apps" aria-labelledby={headingId}>
      <div className="apps-head">
        <h2 id={headingId}>{heading}</h2>
        <p>Pick the one that fits.</p>
      </div>
      <div className="apps-grid">
        {APPS.map((app) => (
          <AppLink key={app.id} app={app} className="app-tile">
            <span className="app-icon">
              <AppIcon app={app} />
            </span>
            <span className="app-name">{app.name}</span>
            <span className="app-tag">{app.tag}</span>
          </AppLink>
        ))}
      </div>
    </section>
  );
}
