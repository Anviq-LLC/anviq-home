import { lazy, Suspense, useSyncExternalStore } from "react";

const Terminal = lazy(() => import("@/components/Terminal").then((m) => ({ default: m.Terminal })));
const MobileChat = lazy(() => import("@/components/MobileChat").then((m) => ({ default: m.MobileChat })));

// Keep the terminal for true desktop workspaces. iPadOS can report a wide
// desktop-sized viewport in landscape, so width alone is not enough: the
// primary pointer must also be fine and hover-capable. Touch-first tablets
// therefore keep Sherlock's compact MobileChat surface at every orientation.
const QUERY = "(min-width: 1200px) and (hover: hover) and (pointer: fine)";
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

// Desktop gets the terminal, mobile gets the chat. One boolean, so it can
// never render both or neither.
export function SiteNavigator() {
  const desktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <Suspense fallback={null}>{desktop ? <Terminal /> : <MobileChat />}</Suspense>;
}
