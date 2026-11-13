// Transition timing for Sherlock, the lightbox, board panes and
// folder morphs. The command palette keeps its own PALETTE_FADE in Home.tsx.
//
//   FADE          opacity only (backdrops, dialogs)
//   SPRING_MORPH  slight bounce, same for open and dismiss (folder morph,
//                 quicklook, chat sheet)
//   BOARD_ENTER   pane swaps and the About nav pill, no bounce
//
// BOARD_EXIT is faster than the rest so the breadcrumb, which switches
// immediately, never sits next to the previous section's content.

export const FADE = { duration: 0.18 } as const;

export const SPRING_MORPH = { type: "spring", bounce: 0.1, duration: 0.38 } as const;

export const BOARD_ENTER = { type: "spring", bounce: 0, duration: 0.32 } as const;
export const BOARD_EXIT = { duration: 0.05, ease: "linear" } as const;

export const INSTANT = { duration: 0 } as const;

/** `reducedMotion ? INSTANT : transition` - the one pattern used everywhere.
 *  Takes `boolean | null` directly - motion/react's useReducedMotion()
 *  returns null before the media query has resolved on first render. */
export function motionOr<T>(reducedMotion: boolean | null, transition: T) {
  return reducedMotion ? INSTANT : transition;
}
