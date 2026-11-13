// Keyword matching for Sherlock's typed requests. Keywords are derived from siteTree.ts (path segments,
// aliases, name words), so there's no separate list to maintain.

import { flattenRoutes, type SiteNode } from "@/lib/siteTree";

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function keywordsFor(node: SiteNode): string[] {
  const segment = node.path === "/" ? [] : wordsOf(node.path.slice(node.path.lastIndexOf("/") + 1));
  const aliasWords = (node.aliases ?? []).flatMap(wordsOf);
  const nameWords = wordsOf(node.name);
  return [...new Set([...segment, ...aliasWords, ...nameWords])];
}

let index: Map<string, SiteNode> | undefined;

function keywordIndex(): Map<string, SiteNode> {
  if (index) return index;
  index = new Map();
  // Root first, then declaration order, so a more specific later match
  // (e.g. a project's own name) overrides a generic earlier one.
  for (const node of flattenRoutes()) {
    for (const keyword of keywordsFor(node)) {
      if (!index.has(keyword)) index.set(keyword, node);
    }
  }
  return index;
}

/**
 * Deterministic keyword lookup: the first word in `query` that matches a
 * real node's path segment, alias, or name wins. No fuzzy matching, no
 * ranking - the same query always resolves to the same node.
 */
export function matchIntent(query: string): SiteNode | undefined {
  const table = keywordIndex();
  for (const word of wordsOf(query)) {
    const node = table.get(word);
    if (node) return node;
  }
  return undefined;
}

/**
 * Prefer an explicitly named page ("Anviq Agents", "selected work") over a
 * generic word within it ("Anviq", "work"). Sherlock uses
 * this for an action request.
 */
export function matchNavigationIntent(query: string): SiteNode | undefined {
  const compact = query.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const explicit = flattenRoutes()
    .filter((node) => node.path !== "/" && (node.route || node.href))
    .flatMap((node) => [node.name, ...(node.aliases ?? [])].map((name) => ({ node, name })))
    .map(({ node, name }) => ({ node, compactName: name.toLowerCase().replace(/[^a-z0-9]+/g, "") }))
    .filter(({ compactName }) => compactName.length > 2 && compact.includes(compactName))
    .sort((a, b) => b.compactName.length - a.compactName.length)[0]?.node;
  return explicit ?? matchIntent(query);
}
