const HISTORY_KEY = "anviq-sherlock-history";
const HISTORY_CAP = 50;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function pushQuestionHistory(question: string): string[] {
  const trimmed = question.trim();
  if (!trimmed) return loadHistory();
  const next = [trimmed, ...loadHistory().filter((item) => item !== trimmed)].slice(0, HISTORY_CAP);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Private mode etc.
  }
  return next;
}

/** Word-AND substring match used by the search capsule and palette. */
export function queryWordsMatch(query: string, fields: string[]): boolean {
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  const hay = fields.join(" ").toLocaleLowerCase();
  return words.every((word) => hay.includes(word));
}
