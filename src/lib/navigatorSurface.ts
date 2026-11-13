// Tiny cross-surface flag: the desktop `/` hotkey on CommandPalette must
// not steal focus from an open Sherlock panel. Not a store - one
// boolean the two navigator surfaces write on open/close.

let surfaceOpen = false;

export function setNavigatorSurfaceOpen(open: boolean) {
  surfaceOpen = open;
}

export function isNavigatorSurfaceOpen() {
  return surfaceOpen;
}
