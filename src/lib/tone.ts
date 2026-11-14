// Sherlock's copy. Keyed by route/tree path so every line can be checked
// against src/lib/siteTree.ts.

// First open of either surface, once per visitor.
export const GREETING_LINES = [
  "Sherlock, finder of things. I deduce you've come to see the work. You are, after all, on the work website.",
  "The other one retired to Sussex to keep bees. I was replaced by Spotlight in 2005. One of us drew the short straw.",
];

// Once per visitor, when a project case is opened through Sherlock.
export const NODE_OPENER_LINES: Record<string, string> = {
  "/projects/steadyward": "Retention infrastructure. So far, you are retained.",
  "/projects/lv-matching": "Minds its own tenants. Built like the lawyers were in the room.",
  "/projects/addreach": "Outbound automation. You, however, arrived of your own free will.",
  "/projects/recruitment-crm": "Anonymized client. Sherlock keeps oaths.",
  "/projects/agents": "AI teammates that stay on your own hardware. No wandering off to a hyperscaler.",
};

// Once per visitor, on the first visit to a section. Fired from the router
// subscription in guide.ts, so it also covers normal browsing.
export const SECTION_COMMENTARY: Record<string, string> = {
  "/services": "Three ways to work with Anviq. The team stays the point of contact.",
  "/engagement": "Terms of engagement, actually readable. Rare artifact.",
  "/approach": "How the work runs. No process theater.",
  "/constraints": "The page where clients get told no. They read it twice.",
  "/questions": "Answers pre-loaded. Suspiciously efficient.",
  "/activity": "Live commits. GitHub doesn't do marketing copy.",
  "/about": "Anviq on the door. The team on the work.",
  "/privacy": "No cookies here. The footer reaction stays in the footer.",
  "/cookies": "No cookies here. The footer reaction stays in the footer.",
  "/terms": "No cookies here. The footer reaction stays in the footer.",
};

// Once per visitor, after 3 sections visited.
export const BOOKING_HINT =
  "You've done the diligence. The calendar is the next click. Strictly business.";

// Once per visitor, 3+ sections visited and no booking click yet.
export const SOCIAL_HINT =
  "If async is more your speed, LinkedIn and X are real, and the team answers.";

// Deductions. Only coarse facts (never timings, hovers or scroll depth).
export const DEDUCTION_SECOND_CASE =
  "Two cases opened, neither closed. Deduction: you're comparing.";
export const DEDUCTION_ALL_SECTIONS =
  "Every folder opened. Deduction: very thorough or very lost. The calendar is next either way.";
export const DEDUCTION_RETURN_VISIT =
  "You left, then returned. Deduction: the other tabs disappointed.";

// Event reactions, once per visitor each. Triggers live at the call sites.
export const FOURTH_CASE_HINT = "All four. The portfolio review is complete.";
export const MULTI_DAY_RETURN_HINT = 'Filed you under "thinking it over." Correctly.';
export const TAB_RETURN_HINT = "Welcome back. Nothing moved. Discipline.";
export const LIGHTBOX_PEEK_HINT = "A proper inspection. The README holds up to it.";
export const GITHUB_CLICK_HINT = "Straight to the commit log. Sherlock respects it.";
// Wired but disabled, see EMAIL_COPY_ENABLED in guide.ts.
export const EMAIL_COPY_HINT = "Copied. A person of action.";
export const ZERO_RESULTS_HINT = 'Nothing. Try "projects." Or ask a human.';
export const CALENDLY_RETURN_HINT = "Window-shopped the calendar. It holds.";
export const PRINT_HINT = "Filing this for the archive. Noted.";

// A bare "hi" gets the same answer everywhere.
export const GREETING_WORDS = ["hi", "hello", "hey", "hiya", "yo", "sup", "howdy", "greetings"] as const;
export const GREETING_REPLY = "Hello. Now, to business: projects, services, or about?";

// First open via a badged control. Uses the real badge age when known.
export const BADGE_GREETING_DEFAULT =
  "That badge was up for four days. I counted. It's what I do.";

export function badgeGreetingForDays(days: number): string {
  if (days <= 0) return "That badge was up today. I counted. It's what I do.";
  if (days === 1) return "That badge was up for a day. I counted. It's what I do.";
  if (days === 4) return BADGE_GREETING_DEFAULT;
  return `That badge was up for ${days} days. I counted. It's what I do.`;
}
