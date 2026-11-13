import { lazy, Suspense } from "react";

const Sherlock = lazy(() => import("@/components/Sherlock").then((m) => ({ default: m.Sherlock })));

// One companion on every screen size.
export function SiteNavigator() {
  return (
    <Suspense fallback={null}>
      <Sherlock />
    </Suspense>
  );
}
