import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { recordLightboxPeek } from "@/lib/guide";
import { FADE as BACKDROP_TRANSITION, motionOr, SPRING_MORPH as QUICK_LOOK_SPRING } from "@/lib/motion";

type PreviewProps = {
  src: string;
  alt: string;
  label: string;
  layoutId: string;
  /** Desktop expands the shot in place, Finder-style. Touch shells get the
   * full-screen Quick Look overlay instead. */
  inline?: boolean;
};

// Finder shows a preview inside the window rather than throwing an overlay
// over everything: clicking the shot grows it to the width of the project
// pane and back.
function InlinePreview({ src, alt, label }: Omit<PreviewProps, "layoutId">) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const transition = motionOr(reducedMotion, QUICK_LOOK_SPRING);
  return (
    <motion.figure
      layout
      transition={transition}
      className={`screenshot-preview ${open ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="project-screenshot-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
      >
        <motion.img
          layout
          transition={transition}
          className="project-screenshot"
          src={src}
          alt={alt}
          loading="lazy"
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.figcaption
            className="screenshot-preview-bar"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={BACKDROP_TRANSITION}
          >
            <span>{label}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Collapse preview"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </motion.figcaption>
        )}
      </AnimatePresence>
    </motion.figure>
  );
}

const LONG_PRESS_MS = 350;

// iOS-style Peek: holding the thumbnail zooms it in, letting go dismisses it.
// A plain tap or keyboard activation still opens the pinned overlay with an
// explicit close button, so the gesture is additive rather than a replacement.
function OverlayQuickLook({ src, alt, label, layoutId }: PreviewProps) {
  const [mode, setMode] = useState<"closed" | "peek" | "pinned">("closed");
  const open = mode !== "closed";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const reducedMotion = useReducedMotion();

  const clearPressTimer = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };
  useEffect(() => clearPressTimer, []);

  const startPress = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    clearPressTimer();
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      longPressed.current = true;
      setMode("peek");
      recordLightboxPeek();
    }, LONG_PRESS_MS);
  };

  const endPress = () => {
    clearPressTimer();
    setMode((current) => (current === "peek" ? "closed" : current));
  };

  useEffect(() => {
    if (mode !== "pinned") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === " ") {
        event.preventDefault();
        setMode("closed");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "pinned") dialogRef.current?.focus();
  }, [mode]);

  // HIG 3.2: the navigator (Sherlock) and this lightbox never stack -
  // whichever opens second closes the other instead of layering two
  // full-screen overlays.
  useEffect(() => {
    if (mode === "closed") return;
    window.dispatchEvent(new Event("anviq:lightbox-open"));
    const onNavigatorOpen = () => setMode("closed");
    window.addEventListener("anviq:navigator-open", onNavigatorOpen);
    return () => window.removeEventListener("anviq:navigator-open", onNavigatorOpen);
  }, [mode]);

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="project-screenshot-trigger"
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerCancel={endPress}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          setMode("pinned");
        }}
        aria-haspopup="dialog"
      >
        <motion.img
          layoutId={`screenshot-${layoutId}`}
          className="project-screenshot"
          style={{ opacity: open ? 0 : 1 }}
          src={src}
          alt={alt}
          loading="lazy"
          transition={motionOr(reducedMotion, QUICK_LOOK_SPRING)}
        />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="quicklook-backdrop"
              onClick={() => setMode("closed")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionOr(reducedMotion, BACKDROP_TRANSITION)}
            >
              {mode === "pinned" && (
                <button
                  type="button"
                  className="quicklook-close"
                  onClick={() => setMode("closed")}
                  aria-label="Close preview"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              )}
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                tabIndex={-1}
                className="quicklook-dialog"
                onClick={(event) => event.stopPropagation()}
              >
                <motion.img
                  layoutId={`screenshot-${layoutId}`}
                  src={src}
                  alt={alt}
                  transition={motionOr(reducedMotion, QUICK_LOOK_SPRING)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export function ScreenshotLightbox({ inline, ...props }: PreviewProps) {
  return inline ? <InlinePreview {...props} /> : <OverlayQuickLook {...props} inline={inline} />;
}
